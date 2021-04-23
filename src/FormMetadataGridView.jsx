import * as React from "react";
import { withRouter } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { FormEditRenderer } from "./FormEditRenderer";
import { FormResponseVizRenderer } from "./FormResponseVizRenderer";
import { FormAccessType } from "./data/utils";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

const formMetadataColumns = [
    { field: "name", headerName: "Author", width: 200 },
    { field: "formName", headerName: "Form Name", width: 300 },
    { field: "count", headerName: "# Responses", width: 150 },
    { field: "url", headerName: "Published Url", width: 300 },
    { field: "url", headerName: "Edit Form", cellRenderer: "formEditRenderer"},
    { field: "url", headerName: "Response Summary", cellRenderer: "formResponseVizRenderer"},
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
    formResponseVizRenderer: FormResponseVizRenderer,
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

    getLink = (node, type) => {
        const formUrl = node.data.url;
        const partialUrl = formUrl.substring(formUrl.indexOf("/") + 1);
        switch (type) {
            case FormAccessType.EDIT:
                return `${partialUrl}/edit`;
            case FormAccessType.VISUALIZE:
                return `${partialUrl}/viz`;
            default:
                return "";
        }
    }

    render() {
        return (
            <div
                className="ag-theme-balham"
                style={{height: "800pt", width: "100%"}}
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