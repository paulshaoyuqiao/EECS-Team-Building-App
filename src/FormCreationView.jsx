import * as React from "react";
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
} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import {
    AddCircleRounded, 
    Delete, 
    Clear, 
    PublishRounded, 
    CheckCircleRounded, 
    CancelRounded,
} from "@material-ui/icons";
import ApiManager from "./api/api";

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
            showFormCreationSuccess: false,
        };
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
        const templateData = {
            name: this.props.name,
            email: this.props.email,
            course: this.props.course,
            template: this.state.template
        };
        ApiManager.post('/new_template', templateData).then((response) => {
            const data = response.data;
            if ("success" in data && data["success"]) {
                this.setState({showFormCreationSuccess: true});
            }
        })
    }

    render() {
        return (
            <>
                <Snackbar
                    open={this.state.showFormCreationSuccess}
                    autoHideDuration={5000}
                    onClose={() => this.setState({showFormCreationSuccess: false})}
                    anchorOrigin={{vertical: "top", horizontal: "center"}}
                >
                    <Alert severity="success" icon={<CheckCircleRounded />}>
                        Form Successfully Published!
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
                            Publish Form
                        </Button>
                    </ButtonGroup>
                </FormGroup>
            </>
        )
    }
}
