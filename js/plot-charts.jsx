import {Loading} from "./loading";
import * as React from "react";
import {Plot} from "./plot";
import {formatNumber} from "./text";

const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

const plot_height = 600;
const plot_width = Math.max(1150, vw - 50);

const PlotSpillsDuration = () => {
    const optionsFn = ( Plot, data) => {
        return {
            //                        marginTop: 150,
            marginLeft: 100,
            marginBottom: 30,
            width: plot_width,
            height: plot_height,
            r: { range: [3, 30], domain: [0, 1000] },
            y: {
                grid: true,
            },
            x: {
                grid: false,
                type: "log", base: 10
            },
            marks: [
                Plot.text(
                    [1,2,3,4,5,6,7,8,9,10,11,12],
                    {
                        text: d=> `${d} m`,
                        textAnchor: "end",
                        rotate: 45,
                        x: d => d * 730,
                        y: " _"
                    }
                ),
                Plot.dot(
                    data,
                    Plot.binX(
                        { r: "count", },
                        {
                            y: "company_name",
                            x: "total_spill_hours",
                            thresholds: "freedman-diaconis",
                            fill: "company_name",
                            opacity: 0.7,
                            mixBlendMode: "multiply",
                        }
                    )
                ),
                Plot.ruleX(
                    [1,2,3,4,5,6,7,8,9,10,11,12],
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
            },
            marks: [
                Plot.line(
                    data,
                    Plot.binX(
                        {y: "count"},
                        {
                            thresholds: "freedman-diaconis",
                            z: "company_name",
                            cumulative: -1,
                            x: "total_spill_hours",
                            stroke: "company_name",
                        })
                ),
                Plot.dot(
                    data,
                    Plot.binX(
                        {y: "count"},
                        {
                            thresholds: "freedman-diaconis",
                            z: "company_name",
                            cumulative: -1,
                            x: "total_spill_hours",
                            stroke: "company_name",
                            opacity: 0.7,
                        })
                ),
                Plot.ruleX(
                    [1,2,3,4,5,6,7,8,9,10,11,12],
                    {
                        stroke: "red",
                        opacity: 0.4,
                        x: d => d * 730,
                    }
                ),
                Plot.text(
                    [1,2,3,4,5,6,7,8,9,10,11,12],
                    {
                        text: d=> `${d} m`,
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
            },
            x: {
                grid: false,
                tickFormat: d => `${d}`,
            },
            facet: {
                data: data,
                x: "company_name",
            },
            marks: [
                Plot.barY(
                    data,
                    Plot.groupX(
                        {y: "sum"},
                        {
                            x: "reporting_year",
                            y:"hours",
                            fill: "company_name",
                        }
                    )
                )
            ]
        }
    }

    return <Loading
        url="data/generated/spills-by-company.json"
        nullBeforeLoad
        render={data => <Plot data={data} options={optionsFn}/>}
    />

}

export { PlotSpillsDuration, PlotSpillsCumulative, PlotSpillsByCompany };