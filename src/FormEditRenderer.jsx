import * as React from "react";
import {IconButton, Typography} from "@material-ui/core";
import {UpdateOutlined} from "@material-ui/icons";
import {Link} from "react-router-dom";


export class FormEditRenderer extends React.Component {
    getFormEditLink = () => {
        return this.props.context.componentParent.getFormEditLink(this.props.node);
    }

    getUser = () => {
        return this.props.context.componentParent.getUser();
    }

    checkIsRegistered = () => {
        return this.props.context.componentParent.checkIsRegistered();
    }

    render() {
        return (
            <Link
                to={{pathname: this.getFormEditLink()}}
                target="_blank"
            >
                Edit Form
            </Link>
        );
    }
}