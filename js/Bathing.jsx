import * as React from 'react';
import {useState} from 'react';
import ReactDOM from 'react-dom';
import {Alert, Card, Col, Container, Row, Table} from "react-bootstrap";
import {ForkMeHero} from "./heroes";
import {tweetURI} from "./twitter";
import {formatNumber} from "./text";
import {Map, MapMove, Mobile} from "./maps";
import {ChloroGeo, InfoBox, Legend} from "./chloropleth";
import {FacebookShare, TwitterShare} from "./sharing";
import {LoadingPlot} from "./plot";


const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

const spillColours = [
'#f0515a',
'#F4646C',
'#F7787F',
'#FA8C92',
'#FCA1A6',
'#FEB6BA',
'#FFCCCF',
'#FFE3E4'
];

spillColours.reverse();

const spillMax = 18000;

const colourScale = (colours, maxValue) => {

    const scale = colours.length / maxValue

    return (n) => {
        return colours[Math.min(scale * n, colours.length - 1).toFixed()];
    }
}

const spillsStyle = (feature) => {
    const fillColor = colourScale(spillColours, spillMax)(feature.properties.total_hours);

    return {
        fillColor: fillColor,
        weight: 3,
        opacity: 0.3,
        color: '#000',
        // dashArray: '3',
        fillOpacity: 0.6
    }
}

const MapLegend = ({colours, max, children}) => {

    const count = colours.length
    const step = max / count

    const scale = colourScale(colours, max)

    const things = [...Array(colours.length).keys()].map(n => {
        return <React.Fragment key={`legend-${n}`}>
            <i style={{background: scale(n * step)}}> </i> {formatNumber(n * step)} - {formatNumber((n + 1) * step)}
            <br/>
        </React.Fragment>
    })
    return <React.Fragment>
        <div>{children}</div>
        {things}
    </React.Fragment>;
}

const CountyInfo = ({feature}) => {
    return <React.Fragment>
        <b>{feature.properties.name}</b>
        <br/>{formatNumber(feature.properties.total_hours, 2)} hours of sewage on beaches
    </React.Fragment>
}

const CountyMap = () => {

    const [feature, setFeature] = useState()

    const info = feature ? <CountyInfo feature={feature}/> :
        <React.Fragment>Hover over/Tap on a county</React.Fragment>

    return <Map style="v2">
        <ChloroGeo url="../data/generated/chloropleth/chloro-counties.json" style={spillsStyle} onMouseOverFeature={setFeature}/>
        <Legend>
            <MapLegend colours={spillColours} max={spillMax}/>
        </Legend>
        <InfoBox>
            {info}
        </InfoBox>
    </Map>
}

const RainfallChart = () => {
    const url = "../data/generated/rainfall-uk.json"
    const optionsFn = (Plot, data) => {
        return {
            marginTop: 50,
            marginLeft: 75,
            marginBottom: 50,
            width: Math.min(1150, vw - 50),
            height: 600,
            y: {  label: "↑ UK Rainfall (mm)" },
            x: { label: "Month", domain: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]},
            marks: [
                Plot.areaY(data, {x: "month", y1: "min", y2: "max", fill: '#f0515a', fillOpacity: 0.2 }),
                Plot.areaY(data, {x: "month", y1: "minus_1_stddev", y2: "plus_1_stddev", fillOpacity: 0.4, fill: "#209fc5"}),
                Plot.line(data, {x: "month", y: "avg", stroke: '#209fc5', strokeOpacity: 0.9, strokeDasharray: [1, 4]}),
                Plot.line(data, {x: "month", y: "reading", stroke: '#005f7f'}),
                Plot.ruleY([0])
            ]
        }
    }
    return <LoadingPlot url={url} options={optionsFn}/>
}

const MonitoringChart = () => {
    const url = "../data/generated/bathing-reporting.json"
    const optionsFn = (Plot, data) => {
        return {
            marginTop: 50,
            marginLeft: 80,
            marginBottom: 50,
            width: Math.min(1150, vw - 50),
            y: {
                label: "↑ Count of CSO",
                grid: true,
            },
            x: {
                label: "Monitoring Operational %"
            },
            marks: [
                Plot.barY(
                    data,
                    {
                        x: "bin",
                        y: "count",
                        fill: "bin",
                        insetLeft: 0.5,
                        insetRight: 0.5,
                        title: d => `${d.bin}% - ${d.count}`
                    }
                ),
                Plot.text(data, { x: "bin", y: 130, text: "count" } ),
            ]
        }
    }
    return <LoadingPlot url={url} options={optionsFn}/>
}



class App extends React.Component {
    render() {
        return <div className="bathing">
            <div className="hero">
                <img src="../assets/poop.png"/>
                <div className="title"><a href="/">Top of the Poops</a></div>
                <img src="../assets/poop.png"/>
            </div>
            <ForkMeHero/>
            <blockquote>Bathing Season Update 2021
            </blockquote>

            <Container>
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <TwitterShare/>
                        <FacebookShare/>
                    </Col>
                </Row>
            </Container>

            <Container>
                <Row>
                    <Col>
                        <h1>Beach Sewage</h1>
                        <p>This map is showing only beach sewage dumps in the summer period for 2022</p>
                        <p>(not at the moment! - its showing all 2021)</p>
                        <Mobile><Alert variant="success"><MapMove/></Alert></Mobile>
                        <CountyMap/>
                    </Col>
                </Row>
            </Container>

            <Container>
                <Row>
                    <Col>
                        <h1>Rainfall</h1>
                        <p>
                            Rainfall in the UK was significantly below average. Here we plot the UK rainfall, showing the average, ± 1 SD, minimum and maximum by
                            month from 1990 to 2021,
                            and the monthly rainfall so far for 2022
                        </p>
                        <p>We can see that the rainfall is way lower than average, and in July 2022 it was a historic low</p>
                        <RainfallChart/>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <h1>Reporting</h1>
                        <p>We still see that the monitoring on the Combined Sewer Overflows isn't working. Here we are only looking at
                        those that cover beach locations - and we can see over 40 locations have monitoring that isn't working at all</p>
                        <p>No CSO that releases to a bathing location is supposed to have monitoring that is operational less than 90% of the time.
                        This is a very low target! - It means that the monitoring could be switched off for 36 days a year, and still meet the target.</p>
                        <MonitoringChart/>
                    </Col>
                </Row>
            </Container>




            <Container>
                <Row>
                    <Col>
                        <h3>Copyright</h3>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <p>(C) 2020, 2021 Top-Of-The-Poops CC-BY-SA 4.0, (C) Openstreetmap contributors, Contains OS
                            data © Crown copyright and database right 2021</p>
                        <p>Contains public sector information licensed under the Open Government Licence v3.0</p>
                        <p>Full Copyright information available at: <a
                            href="https://github.com/top-poop/top-of-the-poops/">our GitHub page</a></p>
                    </Col>
                </Row>

            </Container>
        </div>
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));
