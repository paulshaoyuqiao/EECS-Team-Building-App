import * as React from "react";
import { withRouter } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { FormEditRenderer } from "./FormEditRenderer";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

const formMetadataColumns = [
    { field: "name", headerName: "Author", width: 200 },
    { field: "formName", headerName: "Form Name", width: 300 },
    { field: "count", headerName: "# Responses", width: 150 },
    { field: "url", headerName: "Published Url", width: 300 },
    { field: "url", headerName: "Edit Form", cellRenderer: "formEditRenderer"},
];

const formMetadataColDefs = {
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
}

const formFrameworkComponents = {
    formEditRenderer: FormEditRenderer,
};

class FormMetadataGridView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            context: {componentParent: this},
        };
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    getFormEditLink = (node) => {
        console.log("node", node);
        const formUrl = node.data.url;
        return `${formUrl.substring(formUrl.indexOf("/") + 1)}/edit`;
    }

    getUser = () => {
        return this.props.username;
    }

    checkIsRegistered = () => {
        return this.props.isRegistered;
    }

    render() {
        return (
            <div
                className="ag-theme-balham"
                style={{height: "100%", width: "100%"}}
            >
                <AgGridReact
                    enableCellTextSelection={true}
                    columnDefs={formMetadataColumns}
                    defaultColDef={formMetadataColDefs}
                    rowData={this.props.rowData}
                    context={this.state.context}
                    onGridReady={this.onGridReady}
                    frameworkComponents={formFrameworkComponents}
                />
            </div>
        );
    }
}

export default withRouter(FormMetadataGridView);