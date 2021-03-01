import * as React from "react";
import { Typography } from "@material-ui/core";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-balham.css";

const formMetadataColDefs = {
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
}

export class FormResponseDataGridView extends React.Component {
    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    render() {
        return (
            <>
                <Typography variant="h6">All Responses</Typography>
                <div
                    className="ag-theme-balham"
                    style={{ height: "200pt", width: "100%" }}
                >
                    <AgGridReact
                        enableCellTextSelection={true}
                        columnDefs={this.props.columnDefs}
                        defaultColDef={formMetadataColDefs}
                        rowData={this.props.rowData}
                        onGridReady={this.onGridReady}
                    />
                </div>
            </>
        );
    }
}