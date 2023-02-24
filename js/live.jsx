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
        "a-0", "a-4", "a-8", "a-12", "a-16", "a-20", "a-24", // a = available (online)
        "z-0", "z-4", "z-8", "z-12", "z-16", "z-20", "z-24", // z = offline
        "o-0", "o-4", "o-8", "o-12", "o-16", "o-20", "o-24", // o = overflowing
        "p-0", "p-4", "p-8", "p-12", "p-16", "p-20", "p-24", // p = potentially overflowing
        "u-0", "u-4", "u-8", "u-12", "u-16", "u-20", "u-24", // u = unknown
    ],
    range: [
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
        const count = data.count

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
                    data.data,
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
                    data.data,
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


const LiveDataPlot = ({data}) => {
    const height = window.innerHeight
    const width = window.innerWidth

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
            <span style={ { "background-color": "#28A64580" } }>&nbsp;&nbsp;&nbsp;&nbsp;</span><span> Monitoring Online </span>
            <span style={ { "background-color": "#333333" } }>&nbsp;&nbsp;&nbsp;&nbsp;</span><span> Monitoring Offline </span>
            <span style={ { "background-color": "#842904" } }>&nbsp;&nbsp;&nbsp;&nbsp;</span><span> Polluting </span>
            <span style={ { "background-color": "#460d83" } }>&nbsp;&nbsp;&nbsp;&nbsp;</span><span> Potentially Polluting </span>
            <span style={ { "background-color": "#3b9acb80" } }>&nbsp;&nbsp;&nbsp;&nbsp;</span><span> Unknown </span>
        </Card.Body>
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