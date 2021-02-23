import * as React from "react";
import {FormCreationView} from "./FormCreationView";
import {Toolbar, AppBar, IconButton, Typography, Box} from "@material-ui/core";
import {Menu} from "@material-ui/icons";

export class FormUpdateView extends React.Component {
    render() {
        const user = localStorage.getItem("username");
        const isRegistered = localStorage.getItem("isRegistered");
        const {template, formName, formId, formUrl, course} = this.props;
        return (
            <div style={{flexGrow: 1}}>
                <AppBar position="static" variant="outlined" color="primary">
                    <Toolbar>
                        <IconButton edge="start">
                            <Menu />
                        </IconButton>
                        <Typography variant="h6" style={{flexGrow: 1}}>
                            Team Builder - Updating a Form
                        </Typography>
                        <Typography variant="h6">
                            Welcome {user}!
                        </Typography>
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
                    {isRegistered
                        ?
                        <FormCreationView 
                            template={template} 
                            formName={formName} 
                            formId={formId} 
                            formUrl={formUrl}
                            course={course} 
                        />
                        :
                        <Typography>
                            Direct access has been disabled.
                            Please sign in as a registered TA for the course and then update the form from the main page.
                        </Typography>
                    }
                </Box>
            </div>
        );
    }
}