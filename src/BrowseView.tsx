import * as React from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import {AppBar, Button, IconButton, Typography, Avatar, FormControl, TextField} from "@material-ui/core";
import {Menu, VpnKey} from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import ApiManager from "./api/api";
import { courses } from "./data/utils";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
        },
        margin: {
            margin: theme.spacing(1),
        },
    }),
);

class BrowseView extends React.Component<any, any> {
    private classes = useStyles();
    constructor(props: any) {
        super(props);
        this.state = {
            isUserLoggedIn: false,
            isUserRegistered: false,
            id: null,
            name: null,
            email: null,
            profilePic: null,
            course: null,
            registrationKey: null,
        };
    }

    componentDidMount = () => {
        this.checkUserStatus();
    }

    checkUserStatus = () => {
        // Checks if the user is logged in first.
        ApiManager.get("/").then((response: any) => {
            const data = response.data;
            if (data["is_logged_in"]) {
                // Proceed to the logic that checks if the user is registered.
                this.setState({isUserLoggedIn: true}, () => this.checkUserRegistration());
            }
        });
    }

    checkUserRegistration = () => {
        // Checks if the user is registered.
        const params = {email: this.state.email};
        ApiManager.get("/is_registered", params).then((response: any) => {
            this.setState({isUserRegistered: response.data['is_registered']});
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
        ApiManager.get("/register", params).then((response: any) => {
            const data = response.data;
            if (data["error"] === null) {
                this.setState({isUserRegistered: true});
            }
        });
    }

    loginUser = () => {
        // login users through Google OAuth2.
        ApiManager.get("/login").then((response: any) => {
            const data = response.data;
            const isUserLoggedIn = true;
            const {id, name, email, profile_pic: profilePic} = data;
            this.setState({isUserLoggedIn, id, name, email, profilePic});
        });
    }

    renderBrowseViewAppBarOptions = () => {
        if (!this.state.isUserLoggedIn) {
            return (
                <Button
                    variant="contained"
                    color="primary"
                    className={this.classes.margin}
                    startIcon={<VpnKey />}
                >
                    Login with Bmail
                </Button>
            );
        } else {
            const name = this.state.name;
            const profilePicLink = this.state.profilePic;
            return (
                <div style={{display: "flex", flexDirection: "row"}}>
                    <Typography variant="h3" className={this.classes.title}>
                        Welcome {name ? name : ""}!
                    </Typography>
                    <Avatar variant="circle" src={profilePicLink} className={this.classes.title} />
                </div>
            );
        }
    }

    renderBrowseViewMainContainer = () => {
        if (!this.state.isUserRegistered) {
            // If the user is not yet registered, shows the registration form
            return (
                <FormControl className={this.classes.margin}>
                    <Typography variant="h5" className={this.classes.title}>
                        Which course are you teaching?
                    </Typography>
                    <Autocomplete
                        options={courses}
                        getOptionLabel={(course) => course}
                        style={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label="Course Name" variant="outlined" />}
                        value={this.state.course}
                        onChange={(event: any, course: string | null) => {
                            if (course !== null) {
                                this.setState({course});
                            }
                        }}
                    />
                    <Typography variant="h5" className={this.classes.title}>
                        Please provide the registration key for the course.
                    </Typography>
                    <TextField
                        label="Registration Key"
                        variant="outlined"
                        value={this.state.registrationKey}
                        onChange={(event: any) => {
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
                </FormControl>
            )
        }
    }

    render() {
        return (
            <AppBar position="static">
                <IconButton edge="start" className={this.classes.menuButton}>
                    <Menu />
                </IconButton>
                <Typography variant="h3" className={this.classes.title}>
                    Team Builder
                </Typography>
                {this.renderBrowseViewAppBarOptions()}
            </AppBar>
        );
    }
}