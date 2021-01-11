import * as React from "react";
import {Link} from "react-router-dom";
import {FormAccessType} from "./data/utils";


export class FormEditRenderer extends React.Component {
    getFormEditLink = () => {
        return this.props.context.componentParent.getLink(this.props.node, FormAccessType.EDIT);
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