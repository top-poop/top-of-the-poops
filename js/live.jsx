import {Plot} from "./plot";
import {toKebabCase} from "./text";
import * as React from "react";
import {Loading} from "./loading";
import {Card, Col, Row} from "react-bootstrap";


const tt_map = {
    "a": "Monitoring Online",
    "z": "Monitoring Offline",
    "o": "Sewage Overflowing",
    "p": "Potentially Overflowing",
    "u": "Unknown"
}

const tt_text = (date, domain) => {
    const [c, v, _] = domain.split("-")
    const t = tt_map[c]

    return `${date}: ${t} up to ${v} hours`
}

const colours = {
    domain: [
        "r-0", "r-1", "r-2", "r-3", "r-4", "r-5", "r-6", "r-7", "r-8", "r-9", "r-10", // r = rainfall
        "a-0", "a-4", "a-8", "a-12", "a-16", "a-20", "a-24", // a = available (online)
        "z-0", "z-4", "z-8", "z-12", "z-16", "z-20", "z-24", // z = offline
        "o-0", "o-4", "o-8", "o-12", "o-16", "o-20", "o-24", // o = overflowing
        "p-0", "p-4", "p-8", "p-12", "p-16", "p-20", "p-24", // p = potentially overflowing
        "u-0", "u-4", "u-8", "u-12", "u-16", "u-20", "u-24", // u = unknown
    ],
    range: [
        '#ffffff', 'rgb(247,251,255)', 'rgb(225,237,248)','rgb(202,222,240)',
        'rgb(171,207, 230)', 'rgb(130,186,219)', 'rgb(89,161,207)', 'rgb(55,135,192)',
        'rgb(28,106,175)', 'rgb(11,77,148)', 'rgb(8,48,107)',

        "rgba(40,166,69,0.29)", "rgba(40,166,69,0.42)", "#28A64580", "#28A64580", "#28A64580", "#28A64580", "#28A64580",
        "rgba(102,102,102,0.6)", "rgba(102,102,102,0.7)", "rgba(110,110,110,0.9)", "#545454", "#444444", "#444444", "#333333",
        "#f7a974", "#fda863", "#d44a04", "#d44a04", "#d44a04", "#842904", "#842904",
        "#d4d4e8", "#d4d4e8", "#b2b1d5", "#b2b1d5", "#7363ad", "#7363ad", "#460d83",
        "rgba(59,154,203,0.24)", "rgba(59,154,203,0.28)", "rgba(59,154,203,0.36)", "#3b9acb80", "#3b9acb80", "#3b9acb80", "#3b9acb80",
    ],
};

const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)

const LiveDataHorizontalPlot = ({data}) => {

    const optionsFn = (Plot, data) => {
        const dates = data.dates.map(it => new Date(it))

        // count is number of CSOs + 1 for rainfall
        const count = data.count + 1

        return {
            marginLeft: 150,
            width: Math.max(1150, vw - 50),
            height: (20 * count) + 60,
            color: colours,
            x: {
                type: "band",
                ticks: dates.filter((d, i) => i % 30 === 0),
                padding: 0.1,
                grid: false,
            },
            y: {
                grid: false,
                label: "",
            },
            marks: [
                Plot.cell(
                    data.rainfall,
                    {
                        x: d=> new Date(d.d),
                        y: d => " Rainfall (mm)", //space -> will come first
                        fill: "r",
                        title: d => `${d.c} mm (75th percentile from ${d.n} nearby stations)`
                    }
                ),

                Plot.cell(
                    data.cso,
                    {
                        x: d => new Date(d.d),
                        y: "p",
                        fill: "a",
                        title: d => tt_text(d.d, d.a)
                    }
                ),
            ]
        }
    }
    return <Plot className="horizontal" options={optionsFn} data={data}/>
}

const LiveDataVerticalPlot = ({data}) => {
    const optionsFn = (Plot, data) => {
        const dates = data.dates.map(it => new Date(it))

        return {
            marginTop: 200,
            marginLeft: 100,
            marginBottom: 30,
            width: Math.max(1150, vw - 50),
            height: (20 * dates.length) + 90,
            color: colours,
            y: {
                type: "band",
                ticks: dates.filter((d, i) => i % 30 === 0),
                grid: false,
                reverse: true,
            },
            x: {
                axis: "top",
                grid: false,
                label: "",
                tickRotate: 45,
                padding: 0.3,
            },
            marks: [
                Plot.cell(
                    data.rainfall,
                    {
                        y: d=> new Date(d.d),
                        x: d => " Rainfall (mm)", //space -> will come first
                        fill: "r",
                        title: d => `${d.c} mm (75th percentile from ${d.n} nearby stations)`
                    }
                ),
                Plot.cell(
                    data.cso,
                    {
                        y: d => new Date(d.d),
                        x: "p",
                        fill: "a",
                        title: d => tt_text(d.d, d.a)
                    }
                ),
            ]
        }
    }
    return <Plot className="vertical" options={optionsFn} data={data}/>
}

const height = window.innerHeight
const width = window.innerWidth

const LiveDataPlot = ({data}) => {
    if (height > (width * 1.4)) {
        return <LiveDataVerticalPlot data={data}/>
    }
    return <LiveDataHorizontalPlot data={data}/>
}

const LiveDataCard = ({data}) => {
    return <Card>
        <Card.Header>Daily Data for 2023</Card.Header>
        <Card.Body style={ {padding: 5} }>
            <LiveDataPlot data={data}/>
            <span style={ { "backgroundColor": "#28A64580" } }>&nbsp;&nbsp;&nbsp;&nbsp;</span><span> Monitoring Online </span>
            <span style={ { "backgroundColor": "#333333" } }>&nbsp;&nbsp;&nbsp;&nbsp;</span><span> Monitoring Offline </span>
            <span style={ { "backgroundColor": "#842904" } }>&nbsp;&nbsp;&nbsp;&nbsp;</span><span> Polluting </span>
            <span style={ { "backgroundColor": "#460d83" } }>&nbsp;&nbsp;&nbsp;&nbsp;</span><span> Potentially Polluting </span>
            <span style={ { "backgroundColor": "#3b9acb80" } }>&nbsp;&nbsp;&nbsp;&nbsp;</span><span> Unknown </span>
        </Card.Body>
        <Card.Footer>
            Daily data is experimental and data is not guaranteed to be accurate. Please inform us of any issue, we will fix.
        </Card.Footer>
    </Card>
}

const LiveDataStuff = ({data}) => {
    return <Row>
        <Col>
            <Row>
                <Col>
                    <LiveDataCard data={data}/>
                </Col>
            </Row>
        </Col>
    </Row>
}

const LiveData = ({constituency}) => {
    return <Loading
        nullBeforeLoad
        url={`data/generated/live/constituencies/${toKebabCase(constituency)}.json`}
        render={(data) => <LiveDataStuff data={data}/>}
    />
}

export {LiveData};