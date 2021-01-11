import * as React from "react";
import {
    FormGroup,
    FormControl,
    TextField,
    Divider,
    Typography,
    RadioGroup,
    Radio,
    FormControlLabel,
    Checkbox,
    CircularProgress,
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Button,
    Snackbar,
} from "@material-ui/core";
import {List, MenuBook, Send} from "@material-ui/icons";
import {Alert} from "@material-ui/lab";
import ApiManager from "./api/api";

const qType = Object.freeze({
    shortAnswer: "short-answer",
    singleSelect: "single-select",
    multiSelect: "multi-select",
});

export class FormTemplateView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formId: "",
            formName: "",
            course: "",
            data: {},
            template: [],
            showMissingFieldError: false,
            showSubmissionSuccess: false,
        };
    }

    handleSingleValueChange = (event, prompt) => {
        let data = this.state.data;
        data[prompt] = event.target.value;
        this.setState({data});
    }
    
    handleMultiValueChange = (event, type, prompt) => {
        let data = this.state.data;
        let selections = data[prompt];
        let currOption = event.target.name;
        if (selections.includes(currOption)) {
            selections = selections.filter((o) => o !== currOption);
        } else {
            selections.push(currOption);
        }
        data[prompt] = selections;
        this.setState({data});
    }

    renderQuestionBody = (question) => {
        const {type, prompt, options} = question;
        const promptHeader = <Typography variant="h6">{prompt}</Typography>;
        let body;
        switch(type) {
            case qType.shortAnswer:
                body = (
                    <TextField
                        label="Answer"
                        variant="outlined"
                        required={true}
                        value={this.state.data[prompt]}
                        onChange={(event) => this.handleSingleValueChange(event, prompt)}
                        fullWidth={true}
                        style={{marginTop: "10pt", marginBottom: "10pt"}}
                    />
                );
                break;
            case qType.singleSelect:
                body = (
                    <RadioGroup value={this.state.data[prompt]} onChange={(event) => this.handleSingleValueChange(event, prompt)}>
                        {options.map((option) => {
                            return (
                                <FormControlLabel
                                    value={option}
                                    control={<Radio />}
                                    label={option}
                                />
                            );
                        })}
                    </RadioGroup>
                );
                break;
            default:
                body = (
                    <FormGroup>
                        {options.map((option) => {
                            return (
                                <FormControlLabel
                                    control={
                                        <Checkbox 
                                            checked={this.state.data[prompt].includes(option)}
                                            onChange={(event) => this.handleMultiValueChange(event, type, prompt)} 
                                            name={option} 
                                        />
                                    }
                                    label={option}
                                />
                            );
                        })}
                    </FormGroup>
                );
                break;
        }
        return (
            <>
                {promptHeader}
                {body}
            </>
        );
    }

    submitFormResponse = () => {
        // First checks that all required fields are non-empty.
        // TODO: enable optional fields; for now, all fields are mandatory.
        const data = this.state.data;
        let allFilledOut = true;
        for (const [_, ans] of Object.entries(data)) {
            if (typeof ans === "string" && ans.trim().length === 0) {
                allFilledOut = false;
            } else if (Array.isArray(ans) && ans.length === 0){
                allFilledOut = false;
            }
            if (!allFilledOut) {
                this.setState({showMissingFieldError: true});
                return;
            }
        }
        const formData = {
            formId: this.state.formId,
            response: data,
        };
        ApiManager.post('/submit_response', formData).then((response) => {
            const data = response.data;
            if ("success" in data && data["success"]) {
                this.setState({showSubmissionSuccess: true});
            }
        });
    }

    renderFormFromTemplate = (template) => {
        // expecting template to be an array of objects strictly containing 3 exact fields: type, prompt, and options
        return (
            <>
                {template.map((question) => {
                    return (
                        <>
                            <FormControl>
                                {this.renderQuestionBody(question)}
                            </FormControl>
                            <Divider style={{margin: "10pt"}}/>
                        </>
                    );
                })}
                <Button
                    onClick={this.submitFormResponse}
                    variant="contained"
                    endIcon={<Send />}
                    style={{
                        backgroundColor: "green",
                        color: "white",
                        width: "100px",
                    }}
                >
                    Submit
                </Button>
            </>
        );
    }

    mountFormState = (template) => {
        const data = {};
        const course = template["course"];
        const formId = template["formId"];
        const formName = template["formName"];
        template = template["template"];
        template.forEach(question => {
            const {type, prompt} = question;
            if ([qType.shortAnswer, qType.singleSelect].includes(type)) {
                data[prompt] = "";
            } else {
                data[prompt] = [];
            }
        });
        this.setState({data, template, formId, formName, course});
    }

    componentDidMount() {
        this.mountFormState(this.props.template);
    }

    render() {
        const template = this.state.template;
        if (template.length === 0) {
            return (
                <div style={{
                    margin: 0,
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                }}>
                    <CircularProgress size={100} />
                </div>
            );
        } else {
            return (
                <>
                    <Snackbar
                        open={this.state.showMissingFieldError}
                        autoHideDuration={5000}
                        onClose={() => this.setState({showMissingFieldError: false})}
                        anchorOrigin={{vertical: "top", horizontal: "center"}}
                    >
                        <Alert severity="error">
                            Please make sure all fields are filled out before submitting!
                        </Alert>
                    </Snackbar>
                    <Snackbar
                        open={this.state.showSubmissionSuccess}
                        autoHideDuration={5000}
                        onClose={() => this.setState({showSubmissionSuccess: false})}
                        anchorOrigin={{vertical: "top", horizontal: "center"}}
                    >
                        <Alert severity="success">
                            Your response has been successfully submitted!
                        </Alert>
                    </Snackbar>
                    <AppBar position="static" variant="outlined" color="primary">
                        <Toolbar>
                            <IconButton edge="start">
                                <List style={{color: "white"}}/>
                            </IconButton>
                            <Typography variant="h6" style={{flexGrow: 1}}>
                                {this.state.formName}
                            </Typography>
                            <div style={{display: "flex", flexDirection: "row"}}>
                                <MenuBook style={{marginRight: "5px"}} />
                                <Typography variant="h6" style={{flexGrow: 1}}>
                                    {this.state.course}
                                </Typography>
                            </div>
                        </Toolbar>
                    </AppBar>
                    <Box style={{margin: "2%"}}>
                        <FormGroup>
                            {this.renderFormFromTemplate(template)}
                        </FormGroup>
                    </Box>
                </>
            );
        }
    }
}