import * as React from "react";
import {Typography, Divider} from "@material-ui/core";
import * as Recharts from "recharts/umd/Recharts";

const {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip} = Recharts;

  export class FormResponseHistogramView extends React.Component {

      renderHistograms = (agg) => {
          console.log("agg", agg);
          return (
              <> 
                <Typography variant="h6">Bar Charts</Typography>
                {
                    agg.map((question) => {
                        return (
                            <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                                <Typography><b>Question</b>: {question["title"]}</Typography>
                                <BarChart
                                    width={800}
                                    height={400}
                                    data={question["data"]}
                                    margin={{
                                        top: 5, right: 10, left: 10, bottom: 5
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                                <Divider style={{margin: "10pt"}}/>
                                <br />
                            </div>
                        );
                    })
                }
              </>
          );
      }

      render() {
          return this.renderHistograms(Object.values(this.props.aggregatedResponses));
      }
  }