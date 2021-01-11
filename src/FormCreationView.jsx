import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import {
    FormGroup,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    TextField,
    Button,
    Divider,
    IconButton,
    InputAdornment,
    Typography,
    ButtonGroup,
    Snackbar,
    Tooltip,
} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import {
    AddCircleRounded, 
    Delete, 
    Clear, 
    PublishRounded, 
    CheckCircleRounded, 
    CancelRounded,
    InfoRounded,
} from "@material-ui/icons";
import ApiManager from "./api/api";
import {getFormPath} from "./data/utils";

const qType = Object.freeze({
    shortAnswer: "short-answer",
    singleSelect: "single-select",
    multiSelect: "multi-select",
});

export class FormCreationView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            template: [],
            formName: "",
            formUrl: "",
            submitButtonName: "Publish Form",
            formPublishMessage: "Form Successfully Published!",
            showFormCreationSuccess: false,
            showMissingFormNameError: false,
        };
    }

    componentDidMount() {
        const {formName, template} = this.props;
        if (formName && template) {
            const submitButtonName = "Update Form";
            const formPublishMessage = "Form Successfully Updated!"
            // If form name and the template have been predefined, the form is being edited
            this.setState({formName, template, submitButtonName, formPublishMessage});
        }
    }

    renderAllOptions = (index, allOptions) => {
        const template = this.state.template;
        return (
            <>
                {allOptions.map((_, optionIndex) => {
                    return (
                        <div style={{display: "table-cell", verticalAlign: "middle"}}>
                            <TextField
                                label="Option"
                                variant="outlined"
                                value={template[index]["options"][optionIndex]}
                                style={{marginBottom: "10pt", width: "300pt"}}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton 
                                                onClick={() => {
                                                    const template = this.state.template;
                                                    template[index]["options"][optionIndex] = "";
                                                    this.setState({template});
                                                }}
                                            >
                                                <Clear />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                onChange={(event) => {
                                    const template = this.state.template;
                                    template[index]["options"][optionIndex] = event.target.value;
                                    this.setState({template});
                                }}
                            />
                            <IconButton 
                                color="secondary" 
                                size="medium"
                                style={{marginBottom: "10pt"}}
                                onClick={() => {
                                    let currQuestion = this.state.template[index];
                                    let options = currQuestion["options"];
                                    currQuestion["options"] = options.filter((_, currIndex) => currIndex !== optionIndex);
                                    this.setState({template});
                                }}
                            >
                                <Delete />
                            </IconButton>
                        </div>
                    );
                })}
            </>
        );
    }

    renderQuestionSkeleton = (questionType, prompt, options, index) => {
        const promptField = (
            <TextField
                label="Prompt"
                required={true}
                variant="outlined"
                key={`shortAnswerPrompt-${index}`}
                style={{width: "300pt", marginRight: "10pt"}}
                value={prompt}
                onChange={(event) => {
                    const template = this.state.template;
                    template[index]["prompt"] = event.target.value;
                    this.setState({template});
                }}
            />
        );
        const optionsField = (
            <FormControl>
                {this.renderAllOptions(index, options)}
                <Button 
                    variant="contained" 
                    startIcon={<AddCircleRounded />}
                    size="large"
                    color="primary"
                    onClick={() => {
                        const template = this.state.template;
                        template[index]["options"].push("");
                        this.setState({template});
                    }}
                >
                    Add Another Option
                </Button>
            </FormControl>
        )
        if (questionType === qType.shortAnswer) {
            return promptField;
        } else {
            return (
                <>
                    {promptField}
                    {optionsField}
                </>
            );
        }
    }

    renderAllQuestions = () => {
        const allQuestions = this.state.template;
        return (
            <>
                {allQuestions.map((question, index) => {
                    return (
                        <>
                            <div style={{display: "flex", flexDirection: "row"}}>
                                <Typography variant="h6">Question</Typography>
                                <IconButton
                                    style={{
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                        paddingLeft: "5pt",
                                        paddingRight: 0,
                                    }}
                                    color="secondary" 
                                    onClick={() => {
                                        let template = this.state.template;
                                        console.log("deleting index", index);
                                        template.splice(index, 1);
                                        this.setState({template});
                                    }}
                                >
                                    <CancelRounded />
                                </IconButton>
                            </div>
                            <div style={{display: "flex", flexDirection: "row", margin: "10pt"}}>
                                <FormControl style={{marginRight: "10pt"}}>
                                    <InputLabel>Question Type</InputLabel>
                                    <Select
                                        value={question["type"]}
                                        style={{width: "150pt"}}
                                        onChange={(event) => {
                                            let template = this.state.template;
                                            template[index]["type"] = event.target.value;
                                            this.setState({template});
                                        }}
                                    >
                                        <MenuItem value={qType.shortAnswer}>Short Answer</MenuItem>
                                        <MenuItem value={qType.singleSelect}>Multiple Choice</MenuItem>
                                        <MenuItem value={qType.multiSelect}>Multiselect Checkbox</MenuItem>
                                    </Select>
                                </FormControl>
                                {this.renderQuestionSkeleton(question.type, question.prompt, question.options, index)}
                            </div>
                            <Divider style={{margin: "10pt"}}/>
                        </>
                    );
                })}
            </>
        );
    }

    submitTemplateForGeneration = () => {
        const formName = this.state.formName;
        if (typeof formName !== "string" || formName.trim().length === 0) {
            this.setState({showMissingFormNameError: true});
        } else {
            const templateData = {
                name: this.props.name,
                email: this.props.email,
                course: this.props.course,
                template: this.state.template,
                formName: formName,
                formUrl: this.state.formUrl,
            };
            const formId = this.props.formId;
            templateData["formId"] = formId ? formId : uuidv4();
            ApiManager.post('/new_template', templateData).then((response) => {
                const data = response.data;
                if ("success" in data && data["success"]) {
                    this.setState({showFormCreationSuccess: true});
                }
            });
        }
    }

    render() {
        const formName = this.state.formName ? this.state.formName : "";
        const course = this.props.course ? this.props.course : "";
        return (
            <>
                <Snackbar
                    open={this.state.showFormCreationSuccess}
                    autoHideDuration={8000}
                    onClose={() => this.setState({showFormCreationSuccess: false})}
                    anchorOrigin={{vertical: "top", horizontal: "center"}}
                >
                    <Alert severity="success" icon={<CheckCircleRounded />}>
                        {this.state.formPublishMessage} <br />
                        Your form is published at path {getFormPath(formName, course, this.state.formUrl)}. <br />
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={this.state.showMissingFormNameError}
                    autoHideDuration={8000}
                    onClose={() => this.setState({showMissingFormNameError: false})}
                    anchorOrigin={{vertical: "top", horizontal: "center"}}
                >
                    <Alert severity="warning">
                        Please provide a non-empty form name before submitting.
                    </Alert>
                </Snackbar>
                <FormGroup>
                    <FormControl>
                        <Typography variant="h6">What is the name of your form?</Typography>
                        <TextField
                            label="Form Name"
                            variant="outlined"
                            required={true}
                            value={this.state.formName}
                            onChange={(event) => this.setState({formName: event.target.value})} 
                            fullWidth={true}
                            style={{marginTop: "10pt", marginBottom: "10pt"}}
                        />
                    </FormControl>
                    <FormControl>
                        <div style={{display: "flex", flexDirection: "row"}}>
                            <Typography variant="h6">
                                What is the url path for your form?
                            </Typography>
                            <Tooltip
                                arrow={true}
                                title={
                                    <React.Fragment>
                                        <Typography>
                                            The <b>url path</b> determines where the students can access the form.
                                            By default, if this section is not specified, the url path will be dervied from
                                            the form name. For example, if a form is named <code>"A Form"</code> for a course
                                            CS 10A, the full url to the form will be something similar to <code>BASE-URL/10a/a-form</code>
                                            This section allows you to <b>override the default url</b>.
                                        </Typography>
                                    </React.Fragment>
                                }
                                placement="right-start"
                            >
                                <InfoRounded />
                            </Tooltip>
                        </div>
                        <TextField
                            label="Form Url"
                            variant="outlined"
                            required={true}
                            value={this.state.formUrl}
                            onChange={(event) => this.setState({formUrl: event.target.value})}
                            fullWidth={true}
                            style={{marginTop: "10pt", marginBottom: "10pt"}}
                        />
                    </FormControl>
                    <Divider style={{margin: "10pt"}}/>
                    {this.renderAllQuestions()}
                    <ButtonGroup disableElevation variant="contained">
                        <Button
                            color="primary"
                            startIcon={<AddCircleRounded />}
                            onClick={() => {
                                const allQuestions = this.state.template;
                                allQuestions.push({type: qType.shortAnswer, prompt: "", options: []});
                                this.setState({template: allQuestions});
                            }}
                        >
                            Add a New Question
                        </Button>
                        <Button
                            color="primary"
                            endIcon={<PublishRounded />}
                            onClick={this.submitTemplateForGeneration}
                        >
                            {this.state.submitButtonName}
                        </Button>
                    </ButtonGroup>
                </FormGroup>
            </>
        )
    }
}
