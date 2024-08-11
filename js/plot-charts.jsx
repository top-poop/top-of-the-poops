import {Loading} from "./loading";
import * as React from "react";
import {Plot} from "./plot";

const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

const plot_height = 600;
const plot_width = Math.max(1150, vw - 50);

const PlotSpillsDuration = () => {
    const optionsFn = (Plot, data) => {
        return {
            //                        marginTop: 150,
            marginLeft: 100,
            marginBottom: 30,
            width: plot_width,
            height: plot_height,
            r: {range: [3, 60], domain: [0, 1000]},
            y: {
                grid: true,
            },
            x: {
                grid: false,
                type: "log", base: 10
            },
            marks: [
                Plot.text(
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                    {
                        text: d => `${d} m`,
                        textAnchor: "end",
                        rotate: 45,
                        x: d => d * 730,
                        y: " _"
                    }
                ),
                Plot.dot(
                    data.filter(it => it["total_spill_hours"] > 20),
                    Plot.binX(
                        {r: "count", title: (xx) => `${xx.length} CSOs`},
                        {
                            y: "company_name",
                            x: "total_spill_hours",
                            //thresholds: [168 * 1, 168 * 2, 168 * 3, 1 * 730, 2 * 730, 3 * 730, 4 * 730, 5 * 730, 6 * 730, 7 * 730, 8 * 730, 9 * 730, 10 * 730, 11 * 730, 12 * 730],
                            thresholds: 48,
                            fill: "company_name",
                            opacity: 0.7,
                            mixBlendMode: "multiply",
                            tip: true,
                        }
                    )
                ),
                Plot.ruleX(
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                    {
                        stroke: "red",
                        opacity: 0.3,
                        x: d => d * 730,
                    }
                ),
            ]
        }
    }

    return <Loading
        url="data/generated/spills-all.json"
        nullBeforeLoad
        render={data => <Plot data={data} options={optionsFn}/>}
    />
}

const PlotSpillsCumulative = () => {

    const optionsFn = (Plot, data) => {
        return {
            //                        marginTop: 150,
            marginLeft: 100,
            marginBottom: 30,
            width: plot_width,
            height: plot_height,
            y: {
                grid: true,
                type: "log", base: 10,
            },
            x: {
                grid: false,
                type: "log", base: 10,
                // domain: [1,60,]
            },
            color: {
                domain: [false, true],
                range: ["#ccc", "red"]
            },
            marks: [
                Plot.line(
                    data.filter(d => d["total_spill_hours"] > 0),
                    Plot.binX(
                        {y: "count", filter: null},
                        {
                            thresholds: [1, 168 * 0.5, 168 * 1, 168 * 2, 168 * 3,
                                1 * 730, 1.5* 730, 2 * 730, 2.5 * 750, 3 * 730, 4 * 730, 5 * 730,
                                6 * 730, 7 * 730, 8 * 730, 9 * 730, 10 * 730, 11 * 730, 12 * 730],

                            // thresholds: "freedman-diaconis",
                            z: "company_name",
                            cumulative: -1,
                            x: "total_spill_hours",
                            stroke: (d) => d['company_name'] === 'Thames Water',
                            // sort: {channel: "stroke"},
                        })
                ),
                Plot.dot(
                    data,
                    Plot.binX(
                        {y: "count", filter: null},
                        {
                            thresholds: [1, 168 * 0.5, 168 * 1, 168 * 2, 168 * 3,
                                1 * 730, 1.5* 730, 2 * 730, 2.5 * 750, 3 * 730, 4 * 730, 5 * 730,
                                6 * 730, 7 * 730, 8 * 730, 9 * 730, 10 * 730, 11 * 730, 12 * 730],
                            // thresholds: "freedman-diaconis",
                            z: "company_name",
                            cumulative: -1,
                            x: "total_spill_hours",
                            stroke: (d) => d['company_name'] === 'Thames Water',
                            opacity: 0.7,
                            title: (d) => d.company_name,
                            tip: true,

                        })
                ),
                Plot.ruleX(
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    {
                        stroke: "red",
                        opacity: 0.4,
                        x: d => d * 730,
                    }
                ),
                Plot.text(
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    {
                        text: d => `${d} m`,
                        //textAnchor: "end",
                        rotate: 45,
                        x: d => d * 730,
                        y: 2000,
                    }
                )
            ]
        }
    }

    return <Loading
        url="data/generated/spills-all.json"
        nullBeforeLoad
        render={data => <Plot data={data} options={optionsFn}/>}
    />


}

const PlotSpillsByCompany = () => {
    const optionsFn = (Plot, data) => {
        return {
            marginLeft: 100,
            marginBottom: 30,
            width: plot_width,
            height: plot_height,
            y: {
                grid: true,
                zero: true,
                label: "Years of Continuous Dumping ↑",
            },
            color: {
                legend: true
            },
            x: {
                grid: false,
                domain: [2020, 2021, 2022, 2023],
                tickFormat: d => `${d}`,
            },
            marks: [
                Plot.areaY(
                    data,
                    {
                        x: "reporting_year",
                        y: (d) => d.hours / (750.5 * 12),
                        // stroke: "company_name",
                        // strokeWidth: 5,
                        fill: "company_name",
                        tip: true,
                        opacity: 0.7,
                    }
                ),
            ]
        }
    }

    return <Loading
        url="data/generated/spills-by-company.json"
        nullBeforeLoad
        render={data => <Plot data={data} options={optionsFn}/>}
    />

}

export {PlotSpillsDuration, PlotSpillsCumulative, PlotSpillsByCompany};