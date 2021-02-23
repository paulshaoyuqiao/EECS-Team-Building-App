import * as React from "react";
import {Link} from "react-router-dom";
import {FormAccessType} from "./data/utils";


export class FormResponseVizRenderer extends React.Component {
    getFormResponseVizLink = () => {
        return this.props.context.componentParent.getLink(this.props.node, FormAccessType.VISUALIZE);
    }

    render() {
        return (
            <Link
                to={{pathname: this.getFormResponseVizLink()}}
                target="_blank"
            >
                View Response Summary
            </Link>
        );
    }
}