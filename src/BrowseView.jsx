import * as React from "react";
import {
    Toolbar,
    AppBar,
    Button,
    IconButton,
    Typography,
    Avatar,
    FormControl,
    TextField,
    Box,
    Snackbar,
    CircularProgress,
    FormGroup,
} from "@material-ui/core";
import {Menu, CheckCircleRounded, ErrorRounded, NoteAddRounded} from "@material-ui/icons";
import { Autocomplete, Alert } from "@material-ui/lab";
import { FormCreationView } from "./FormCreationView";
import FormMetadataGridView from "./FormMetadataGridView";
import ApiManager from "./api/api";
import {GoogleLogin, GoogleLogout} from "react-google-login";
import { courses, getFormPath } from "./data/utils";

class BrowseView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isUserLoggedIn: false,
            isUserRegistered: false,
            id: null,
            name: null,
            email: null,
            profilePic: null,
            course: "CS 61A",
            registrationKey: "",
            showRegistrationSuccess: false,
            showRegistrationError: false,
            registrationError: "",
            isInitialized: false,
            showNewFormTemplate: false,
            formMetadata: [],
        };
    }

    checkUserRegistration = () => {
        // Checks if the user is registered.
        const params = {email: this.state.email};
        ApiManager.get("/is_registered", params).then((response) => {
            console.log("Received response from user registration check", response.data);
            const isUserRegistered = response.data["is_registered"];
            const isInitialized = true;
            localStorage.setItem("isRegistered", isUserRegistered);
            localStorage.setItem("username", this.state.name);
            this.setState({isUserRegistered, isInitialized});
        });
        this.fetchAllCourseFormMetadata();
    }

    registerUser = () => {
        // Registers a logged in user.
        const {id, name, email, course, registrationKey} = this.state;
        const params = {
            id: id,
            name: name,
            email: email,
            course: course,
            key: registrationKey
        };
        this.setState({showRegistrationError: false});
        ApiManager.get("/register", params).then((response) => {
            const data = response.data;
            console.log("Received response from attempt to register user", data);
            const errString = data["error"];
            const registrationSuccess = data["success"];
            if (errString === null && registrationSuccess) {
                this.setState({isUserRegistered: true, showRegistrationSuccess: true});
            } else {
                this.setState({
                    registrationError: errString,
                    showRegistrationError: true,
                });
            }
        });
    }

    onLoginSuccess = (res) => {
        const user = res.profileObj;
        this.setState({
            id: user.googleId,
            name: user.name,
            email: user.email,
            profilePic: user.imageUrl,
            isUserLoggedIn: true,
        }, () => {
            this.checkUserRegistration();
        });
    }

    onLoginFailure = (res) => {
        console.error("Login Failed", res);
    }

    renderBrowseViewFormOptions = () => {
        if (this.state.isUserRegistered) {
            return (
                <>
                    <Button 
                        variant="contained"
                        size="large"
                        style={{marginRight: "5pt"}}
                        color="secondary"
                        startIcon={<NoteAddRounded />}
                        onClick={() => this.setState({showNewFormTemplate: !this.state.showNewFormTemplate})}
                    >
                        New Form
                    </Button>
                </>
            );
        }
        return <></>;
    }

    renderBrowseViewAppBarOptions = () => {
        if (!this.state.isUserLoggedIn) {
            return (
                <GoogleLogin
                    clientId="818587922434-cacu513e45l2u0gkkr4qrnl52m8orie6.apps.googleusercontent.com"
                    buttonText="Login with Bmail"
                    onSuccess={this.onLoginSuccess}
                    onFailure={this.onLoginFailure}
                    isSignedIn={true}
                    cookiePolicy="single_host_origin"
                />
            );
        } else {
            const name = this.state.name;
            const profilePicLink = this.state.profilePic;
            return (
                <>
                    <Typography variant="h6" style={{marginRight: "1%"}}>
                        Welcome {name ? name : ""}!
                    </Typography>
                    <Avatar variant="circular" src={profilePicLink} style={{marginRight: "1%"}}/>
                    {this.renderBrowseViewFormOptions()}
                    <GoogleLogout
                        clientId="818587922434-cacu513e45l2u0gkkr4qrnl52m8orie6.apps.googleusercontent.com"
                        buttonText="Log out"
                        onLogoutSuccess={() => this.setState({isUserLoggedIn: false})}
                        onFailure={() => console.error("Logout Error")}
                    />
                </>
            );
        }
    }

    fetchAllCourseFormMetadata = () => {
        // fetches the metadata of all the published forms for the current course
        ApiManager.get("/template_metadata", {course: this.state.course}).then((response) => {
            const metadata = response.data["metadata"]
            console.log("Received response from /template_metadata", metadata);
            metadata.forEach((row, index) => {
                row["url"] = getFormPath(row["formName"], row["course"], row["formUrl"]);
                row["id"] = index;
            })
            this.setState({formMetadata: metadata});
        });
    }

    renderBrowseViewMainContainer = () => {
        if (!this.state.isUserLoggedIn) {
            return (
                <div>
                    Please Login First.
                </div>
            );
        } else if (!this.state.isInitialized) {
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
        } else if (!this.state.isUserRegistered) {
            // If the user is not yet registered, shows the registration form
            return (
                <FormGroup>
                    <FormControl>
                        <Typography variant="h6" style={{marginTop: "3pt", marginBottom: "3pt"}}>
                            Which course are you teaching?
                        </Typography>
                        <Autocomplete
                            options={courses}
                            getOptionLabel={(course) => course}
                            style={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} label="Course Name" variant="outlined" />}
                            value={this.state.course}
                            onChange={(_, course) => {
                                if (course !== null) {
                                    this.setState({course});
                                }
                            }}
                        />
                    </FormControl>
                    <FormControl>
                        <Typography variant="h6" style={{marginTop: "3pt", marginBottom: "3pt"}}>
                            Please provide the registration key for the course.
                        </Typography>
                        <TextField
                            label="Registration Key"
                            variant="outlined"
                            value={this.state.registrationKey}
                            onChange={(event) => {
                                const registrationKey = event.target.value;
                                if (registrationKey !== null) {
                                    this.setState({registrationKey});
                                }
                            }}
                        />
                    </FormControl>
                    <FormControl>
                        <Button
                            style={{marginTop: "3pt"}}
                            variant="contained"
                            color="primary"
                            onClick={this.registerUser}
                        >
                            Verify Registration
                        </Button>
                    </FormControl>
                    <Snackbar
                        open={this.state.showRegistrationError}
                        autoHideDuration={5000}
                        onClose={() => this.setState({showRegistrationError: false})}
                        anchorOrigin={{vertical: "top", horizontal: "center"}}
                    >
                        <Alert severity="error" icon={<ErrorRounded />}>
                            {this.state.registrationError}
                        </Alert>
                    </Snackbar>
                </FormGroup>
            );
        } else if (this.state.showNewFormTemplate) {
            return (
                <FormCreationView
                    email={this.state.email}
                    course={this.state.course}
                    name={this.state.name}
                />
            );
        }
        return (
            <>
                <Snackbar
                    open={this.state.showRegistrationSuccess}
                    autoHideDuration={5000}
                    onClose={() => this.setState({showRegistrationSuccess: false})}
                    anchorOrigin={{vertical: "top", horizontal: "center"}}
                >
                    <Alert severity="success" icon={<CheckCircleRounded />}>
                        Registration Success!
                    </Alert>
                </Snackbar>
                <div style={{ width: "100%", height: "800px"}}>
                    <FormMetadataGridView
                        rowData={this.state.formMetadata}
                        isRegistered={this.state.isUserRegistered}
                        username={this.state.name}
                    />
                </div>
            </>
        );
    }

    render() {
        return (
            <>
                <div style={{flexGrow: 1}}>
                    <AppBar position="static" variant="outlined" color="primary">
                        <Toolbar>
                            <IconButton edge="start">
                                <Menu />
                            </IconButton>
                            <Typography variant="h6" style={{flexGrow: 1}}>
                                Team Builder
                            </Typography>
                            {this.renderBrowseViewAppBarOptions()}
                        </Toolbar>
                    </AppBar>
                    <Box
                        style={{
                            justifyContent: "center",
                            display: "flex",
                            alignItems: "center",
                            padding: "5pt",
                        }}
                    >
                        {this.renderBrowseViewMainContainer()}
                    </Box>
                </div>
            </>
        );
    }
}

export {BrowseView};
