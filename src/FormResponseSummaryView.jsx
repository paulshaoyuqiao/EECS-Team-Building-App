import * as React from "react";
import {Toolbar, AppBar, IconButton, Typography, Box, Divider} from "@material-ui/core";
import {BarChart} from "@material-ui/icons";
import {FormResponseDataGridView} from "./FormResponseDataGridView";
import {FormResponseHistogramView} from "./FormResponseHistogramView";
import ApiManager from "./api/api.js";

export class FormResponseSummaryView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gridData: [],
            columnDefs: [],
            aggregatedResponses: {},
        };
    }

    componentDidMount = () => {
        const params = {formId: this.props.formId};
        ApiManager.get("/aggregate_response", params).then((response) => {
            const data = response.data;
            console.log("Received responses from /aggregate_response", data);
            const gridData = "grid_responses" in data ? data["grid_responses"] : [];
            const columnDefs = "grid_column_defs" in data ? data["grid_column_defs"] : [];
            const aggregatedResponses = "aggregated_responses" in data ? data["aggregated_responses"] : {};
            this.setState({gridData, columnDefs, aggregatedResponses});
        })
    }

    renderVizTabs = () => {
        return (
            <>
                <FormResponseDataGridView columnDefs={this.state.columnDefs} rowData={this.state.gridData} />
                <Divider style={{margin: "10pt"}} />
                <FormResponseHistogramView aggregatedResponses={this.state.aggregatedResponses} />
            </>
        );
    }

    render() {
        const user = localStorage.getItem("username");
        const isRegistered = localStorage.getItem("isRegistered");
        return (
            <div>
                <AppBar position="static" variant="outlined" color="primary">
                    <Toolbar>
                        <IconButton edge="start">
                            <BarChart />
                        </IconButton>
                        <Typography variant="h6" style={{flexGrow: 1}}>
                            Team Builder - Response Summary for Form: {this.props.formName}
                        </Typography>
                        <Typography variant="h6">
                            Welcome {user}!
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "5pt",
                    }}
                >
                    {isRegistered
                        ?
                        this.renderVizTabs()
                        :
                        <Typography>
                            Direct access has been disabled.
                            Please sign in as a registered TA for the course and then update the form from the main page.
                        </Typography>
                    }
                </div>
            </div>
        );
    }
}