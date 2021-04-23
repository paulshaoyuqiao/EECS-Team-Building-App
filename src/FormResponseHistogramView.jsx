import * as React from "react";
import { Typography, Divider } from "@material-ui/core";
import {deepPurple, indigo, blue, lightBlue, teal, cyan} from "@material-ui/core/colors";
import * as Recharts from "recharts/umd/Recharts";

const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = Recharts;
export class FormResponseHistogramView extends React.Component {
    generateCategoryColors = (numColors) => {
        let colors = new Set();
        let palettes = [deepPurple, indigo, blue, lightBlue, teal, cyan];
        while (colors.size < numColors) {
            // Generate a random shading factor between 100 and 900
            let shade = 100 * (Math.floor(Math.random() * Math.floor(9)) + 1);
            let palette = palettes[Math.floor(Math.random() * palettes.length)];
            let color = palette[shade];
            if (!colors.has(color)) {
                colors.add(color);
            }
        }
        return [...colors];
    }

    renderHistograms = (agg) => {
        // TODO: Dynamically determine the strokeDash interval based on the max number of submissions.
        console.log("agg", agg);
        return (
            <>
                <Typography variant="h6">Bar Charts</Typography>
                {
                    agg.map((question) => {
                        let barFigures, dataKeys;
                        const data = question["data"]
                        if (data.length > 0) {
                            dataKeys = Object.keys(question["data"][0]).filter((key) => !["name", "value"].includes(key));
                        } else {
                            dataKeys = [];
                        }
                        const isMultiCategory = dataKeys.length > 0;
                        const barChartWidth = Math.max(dataKeys.length * 250, 600);
                        if (isMultiCategory) {
                            // Handles multi-category bar chart with hues
                            const barColors = this.generateCategoryColors(dataKeys.length);
                            barFigures = dataKeys.map((label, index) => <Bar dataKey={label} fill={barColors[index]} />);
                        } else {
                            barFigures = <Bar dataKey="value" fill="#8884d8" />;
                        }
                        
                        return (
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                <Typography><b>Question</b>: {question["title"]}</Typography>
                                <BarChart
                                    width={barChartWidth}
                                    height={400}
                                    data={question["data"]}
                                    margin={{
                                        top: 5, right: 10, left: 10, bottom: 5
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" height={80} interval={0}/>
                                    <YAxis />
                                    <Tooltip />
                                    {isMultiCategory ? <Legend layout="vertical" verticalAlign="top" align="right" /> : <></>}
                                    {barFigures}
                                </BarChart>
                                <Divider style={{ margin: "10pt" }} />
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