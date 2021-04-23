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
    Backdrop,
} from "@material-ui/core";
import {List, MenuBook, Send, FreeBreakfast, NightsStay, WarningRounded} from "@material-ui/icons";
import { Alert, ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import ApiManager from "./api/api";
import { QuestionType } from "./data/utils";

export class FormTemplateView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formId: "",
            formName: "",
            course: "",
            formReleaseDate: "",
            formDueDate: "",
            isFormBeforeRelease: false,
            isFormOpen: false,
            isFormClosed: false,
            data: {},
            rankErrors: {},
            template: [],
            showMissingFieldError: false,
            showUnresolvedError: false,
            showSubmissionSuccess: false,
        };
    }

    handleSingleValueChange = (event, prompt) => {
        let data = this.state.data;
        data[prompt] = event.target.value;
        this.setState({ data });
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
        this.setState({ data });
    }

    handleExclusiveRankChange = (value, prompt, option) => {
        let data = this.state.data;
        let rankErrors = this.state.rankErrors;
        data[prompt][option] = value;
        // Identify all non-null duplicates and their indices to flag for errors
        let rankSelections = {};
        for (const [option, value] of Object.entries(data[prompt])) {
            if (value !== null) {
                if (!(value in rankSelections)) {
                    rankSelections[value] = [];
                }
                rankSelections[value].push(option);
            }
        }
        for (const [_, options] of Object.entries(rankSelections)) {
            if (options.length > 1) {
                options.map((option) => rankErrors[prompt][option] = true);
            } else if (options.length === 1) {
                rankErrors[prompt][options] = false;
            }
        }
        this.setState({rankErrors, data});
    }

    checkRankError = (prompt, option) => this.state.rankErrors[prompt][option];

    renderQuestionBody = (question) => {
        const { type, prompt, options } = question;
        const promptHeader = <Typography variant="h6">{prompt}</Typography>;
        let body;
        switch (type) {
            case QuestionType.SHORT_ANSWER:
                body = (
                    <TextField
                        label="Answer"
                        variant="outlined"
                        required={true}
                        value={this.state.data[prompt]}
                        onChange={(event) => this.handleSingleValueChange(event, prompt)}
                        fullWidth={true}
                        style={{ marginTop: "10pt", marginBottom: "10pt" }}
                    />
                );
                break;
            case QuestionType.SINGLE_SELECT:
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
            case QuestionType.MULTI_SELECT:
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
            default:
                const numRanks = options.length;
                const allRanks = [...Array(numRanks + 1).keys()].slice(1);
                body = (
                    <FormGroup>
                        {options.map((option) => {
                            return (
                                <div 
                                    style={{
                                        display: "flex", 
                                        flexDirection: "row", 
                                        background: this.checkRankError(prompt, option) ? "#ff000045" : "inherit",
                                        marginBottom: "5pt",
                                        alignItems: "center",
                                        borderRadius: "5pt",
                                    }}
                                >
                                    <Typography style={{width: "20%", margin: "5pt"}}>{option}</Typography>
                                    <ToggleButtonGroup
                                        value={this.state.data[prompt][option]}
                                        exclusive={true}
                                        onChange={(_, value) => this.handleExclusiveRankChange(value, prompt, option)}
                                    >
                                        {allRanks.map((rank) => {
                                            return (
                                                <ToggleButton value={rank} style={{width: "50pt"}}>
                                                    <Typography variant="h6" style={{color: "black"}}>{rank}</Typography>
                                                </ToggleButton>
                                            );
                                        })}
                                    </ToggleButtonGroup>
                                    <div 
                                        style={{
                                            flexDirection: "row",
                                            display: this.checkRankError(prompt, option) ? "flex" : "none",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginLeft: "5pt"
                                        }}
                                    >
                                        <WarningRounded style={{color: "red"}} />
                                        <Typography style={{color: "red"}}>
                                            Each option must have a unique rank.
                                        </Typography>
                                    </div>
                                </div>
                            );
                        })}
                    </FormGroup>
                )
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
        const {data, rankErrors} = this.state;
        let allFilledOut = true;
        for (const [_, ans] of Object.entries(data)) {
            if (typeof ans === "string" && ans.trim().length === 0) {
                allFilledOut = false;
            } else if (Array.isArray(ans) && ans.length === 0) {
                allFilledOut = false;
            } else if (typeof ans === "object") {
                if (Object.values(ans).includes(null)) {
                    allFilledOut = false;
                }
            }
            if (!allFilledOut) {
                this.setState({ showMissingFieldError: true });
                return;
            }
        }
        for (const [_, errors] of Object.entries(rankErrors)) {
            for (const [_, hasError] of Object.entries(errors)) {
                if (hasError) {
                    this.setState({ showUnresolvedError: true });
                    return;
                }
            }
        }

        const formData = {
            formId: this.state.formId,
            response: data,
        };
        ApiManager.post('/submit_response', formData).then((response) => {
            const data = response.data;
            if ("success" in data && data["success"]) {
                this.setState({ showSubmissionSuccess: true });
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
                            <Divider style={{ margin: "10pt" }} />
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

    checkFormAvailability = (formReleaseDate, formDueDate) => {
        const currDate = new Date();
        if (currDate < formReleaseDate) {
            this.setState({isFormBeforeRelease: true});
        } else if (formDueDate !== null && currDate > formDueDate) {
            this.setState({isFormClosed: true});
        } else{
            this.setState({isFormOpen: true});
        }
    }

    renderFormFromState = (template) => {
        if (this.state.isFormBeforeRelease) {
            return (
                <Backdrop open={true}>
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <FreeBreakfast style={{marginRight: "5px"}} />
                        <Typography variant="h6">The form isn't open yet...</Typography>
                    </div>
                </Backdrop>
            );
        } else if (this.state.isFormClosed) {
            return (
                <Backdrop open={true}>
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <NightsStay style={{marginRight: "5px"}} />
                        <Typography variant="h6">The form is already closed :(</Typography>
                    </div>
                </Backdrop>
            );
        } else {
            return (
                <FormGroup>
                    {this.renderFormFromTemplate(template)}
                </FormGroup>
            );
        }
    }

    mountFormState = (template) => {
        console.log("from FormTemplateView - template", template);
        const data = {};
        const rankErrors = {};
        const course = template["course"];
        const formId = template["formId"];
        const formName = template["formName"];
        const formReleaseDate = new Date(template["formReleaseDate"]);
        let formDueDate = template["formDueDate"];
        formDueDate = formDueDate ? new Date(formDueDate) : formDueDate;
        template = template["template"];
        template.forEach(question => {
            const { type, prompt, options } = question;
            if ([QuestionType.SHORT_ANSWER, QuestionType.SINGLE_SELECT].includes(type)) {
                data[prompt] = "";
            } else if (type === QuestionType.MULTI_SELECT) {
                data[prompt] = [];
            } else if (type === QuestionType.GRID_RANK) {
                data[prompt] = {}
                rankErrors[prompt] = {}
                options.forEach((option) => {
                    data[prompt][option] = null;
                    rankErrors[prompt][option] = false;
                });
            }
        });
        this.checkFormAvailability(formReleaseDate, formDueDate)
        this.setState({ data, template, formId, formName, formReleaseDate, formDueDate, course, rankErrors });
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
                        onClose={() => this.setState({ showMissingFieldError: false })}
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    >
                        <Alert severity="error">
                            Please make sure all fields are filled out before submitting!
                        </Alert>
                    </Snackbar>
                    <Snackbar
                        open={this.state.showUnresolvedError}
                        autoHideDuration={5000}
                        onClose={() => this.setState({ showUnresolvedError: false })}
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    >
                        <Alert severity="error">
                            Please check all grid-select questions to make sure each option is assigned a unique rank!
                        </Alert>
                    </Snackbar>
                    <Snackbar
                        open={this.state.showSubmissionSuccess}
                        autoHideDuration={5000}
                        onClose={() => this.setState({ showSubmissionSuccess: false })}
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    >
                        <Alert severity="success">
                            Your response has been successfully submitted!
                        </Alert>
                    </Snackbar>
                    <AppBar position="static" variant="outlined" color="primary">
                        <Toolbar>
                            <IconButton edge="start">
                                <List style={{ color: "white" }} />
                            </IconButton>
                            <Typography variant="h6" style={{ flexGrow: 1 }}>
                                {this.state.formName}
                            </Typography>
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <MenuBook style={{ marginRight: "5px" }} />
                                <Typography variant="h6" style={{ flexGrow: 1 }}>
                                    {this.state.course}
                                </Typography>
                            </div>
                        </Toolbar>
                    </AppBar>
                    <Box style={{ margin: "2%" }}>
                        {this.renderFormFromState(template)}
                    </Box>
                </>
            );
        }
    }
}