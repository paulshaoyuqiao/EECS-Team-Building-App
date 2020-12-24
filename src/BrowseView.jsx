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
} from "@material-ui/core";
import {Menu, VpnKey} from "@material-ui/icons";
import { Autocomplete, Alert } from "@material-ui/lab";
import ApiManager from "./api/api";
import {GoogleLogin, GoogleLogout} from "react-google-login";
import { courses } from "./data/utils";


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
        };
    }

    checkUserRegistration = () => {
        // Checks if the user is registered.
        const params = {email: this.state.email};
        ApiManager.get("/is_registered", params).then((response) => {
            console.log("Received response from user registration check", response.data);
            const isUserRegistered = response.data["is_registered"];
            const isInitialized = true;
            this.setState({isUserRegistered, isInitialized});
        });
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
                    "-ms-transform": "translateY(-50%)",
                    transform: "translateY(-50%)",
                }}>
                    <CircularProgress size={100} />
                </div>
            );
        } else if (!this.state.isUserRegistered) {
            // If the user is not yet registered, shows the registration form
            return (
                <FormControl>
                    <Typography variant="h6">
                        Which course are you teaching?
                    </Typography>
                    <Autocomplete
                        options={courses}
                        getOptionLabel={(course) => course}
                        style={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label="Course Name" variant="outlined" />}
                        value={this.state.course}
                        onChange={(event, course) => {
                            if (course !== null) {
                                this.setState({course});
                            }
                        }}
                    />
                    <Typography variant="h6">
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
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.registerUser}
                    >
                        Verify Registration
                    </Button>
                    <Snackbar
                        open={this.state.showRegistrationError}
                        autoHideDuration={5000}
                        onClose={() => this.setState({showRegistrationError: false})}
                        anchorOrigin={{vertical: "top", horizontal: "center"}}
                    >
                        <Alert severity="error">
                            {this.state.registrationError}
                        </Alert>
                    </Snackbar>
                    <Snackbar
                        open={this.state.showRegistrationSuccess}
                        autoHideDuration={5000}
                        onClose={() => this.setState({showRegistrationSuccess: false})}
                        anchorOrigin={{vertical: "top", horizontal: "center"}}
                    >
                        <Alert severity="success">
                            Registration Success!
                        </Alert>
                    </Snackbar>
                </FormControl>
            )
        }
        return (
            <div>
                TODO: Add in Form Data Here
            </div>
        );
    }

    render() {
        return (
            <>
                <div style={{flexGrow: 1}}>
                    <AppBar position="static">
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
