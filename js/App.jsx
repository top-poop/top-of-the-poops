import * as React from 'react';
import {useState} from 'react';
import ReactDOM from 'react-dom';
import {LoadingPlot} from "./plot";
import {BathingSewage, ShellfishSewage, SpillsByConstituency, SpillsByRiver, SpillsByWaterType} from "./spill-tables";
import {Alert, Card, Col, Container, Row, Table} from "react-bootstrap";
import {ForkMeHero, TitleHero} from "./heroes";
import {companies} from "./companies";
import {tweetURI, twitterURI} from "./twitter";
import {formatNumber, toKebabCase} from "./text";
import {LoadingCircles, Map, MapMove, Mobile} from "./maps";
import {ChloroGeo, InfoBox, Legend} from "./chloropleth";


const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

const spillMax = 80000;
const spillColours = ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000']
const beachMax = 5500;
const beachColours = ['#e66101', '#fdb863', '#b2abd2', '#5e3c99']

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
        weight: 1,
        opacity: 0.7,
        color: '#333',
        dashArray: '3',
        fillOpacity: 0.6
    }
}

const beachStyle = (beach) => {
    const n = beach.total_spill_hours;
    const beachColour = colourScale(beachColours, beachMax)(n)
    return {
        color: beachColour,
        fillColor: beachColour,
        fillOpacity: 0.5,
        radius: Math.log(n) * 500,
    }
}

const MapLegend = ({colours, max}) => {

    const count = colours.length
    const step = max / count

    const scale = colourScale(colours, max)

    const things = [...Array(colours.length).keys()].map(n => {
        return <React.Fragment key={`legend-${n}`}>
            <i style={{background: scale(n * step)}}> </i> {formatNumber(n * step)} - {formatNumber((n + 1) * step)}
            <br/>
        </React.Fragment>
    })
    return <React.Fragment>{things}</React.Fragment>;
}

const CompaniesTable = () => {
    return <div className="table-responsive">
        <Table className="company-contact">
            <tbody>
            {companies.map(row => {
                const twitterLink = twitterURI(row.twitter)
                const telLink = `tel:${row.phone}`

                return <tr key={row.name}>
                    <td className="logo">
                        <img alt="Logo of company" src={`assets/logos/${toKebabCase(row.name)}.png`}/>
                    </td>
                    <td>{row.name}</td>
                    <td>{row.address.line1}<br/>{row.address.line2}<br/>{row.address.line3}<br/>{row.address.town}<br/>{row.address.postcode}
                    </td>
                    <td><a href={telLink}>{row.phone}</a></td>
                    <td><a href={row.web}>{row.web}</a></td>
                    <td><a href={twitterLink}>{row.twitter}</a></td>
                </tr>
            })
            }
            </tbody>
        </Table>
    </div>
}

const SewageDumpsChart = () => {
    const url = "data/generated/spills-by-company.json"
    const optionsFn = (Plot, data) => {
        return {
            marginTop: 50,
            marginLeft: 75,
            marginBottom: 150,
            width: vw - 10,
            height: 500,
            x: {
                padding: 0,
                tickRotate: 45,
                label: "",
            },
            y: {
                grid: true,
                label: "count of sewage spills ↑",
            },
            facet: {
                data: data,
                x: "reporting_year",
            },
            marks: [
                Plot.barY(data, {
                        x: "company_name",
                        y: "count",
                        insetLeft: 0.5,
                        insetRight: 0.5,
                        fill: "company_name",
                        title: d => d.company_name + " " + formatNumber(d.count),
                    }
                ),
                Plot.ruleY([0])
            ]
        }
    }
    return <LoadingPlot url={url} options={optionsFn}/>
}

const DataMatch = () => {
    const url = "data/generated/data-match-by-company.json"
    const optionsFn = (Plot, data) => {
        return {
            marginTop: 50,
            marginLeft: 100,
            marginBottom: 150,
            width: vw,
            height: 500,
            x: {
                padding: 0, tickRotate: 45, label: "",
            },
            y: {
                grid: true, label: "count of sewage dumps ↑",
            },
            facet: {
                data: data,
                x: "reporting_year",
            },
            marks: [
                Plot.barY(data, {
                    x: "company_name",
                    y: "count",
                    fill: "type",
                    title: d => d.type + " " + formatNumber(d.count),
                    insetLeft: 0.5,
                    insetRight: 0.5,
                }),
                Plot.ruleY([0]),
            ]
        }
    }
    return <div>
        <div><em>Figure:</em><i>Sewage dumps matched to a permit</i></div>
        <LoadingPlot url={url} options={optionsFn}/>
    </div>
}

const ConstituencyInfo = ({feature}) => {
    return <React.Fragment>
        <b>{feature.properties.name}</b>
        <br/>{formatNumber(feature.properties.total_hours, 2)} hours of sewage
    </React.Fragment>
}

const ConstituencyMap = () => {

    const [feature, setFeature] = useState()

    const info = feature ? <ConstituencyInfo feature={feature}/> :
        <React.Fragment>Hover over/Tap on a constituency</React.Fragment>

    return <Map>
        <ChloroGeo url="data/generated/chloropleth/chloro.json" style={spillsStyle} onMouseOverFeature={setFeature}/>
        <Legend>
            <MapLegend colours={spillColours} max={spillMax}/>
        </Legend>
        <InfoBox>
            {info}
        </InfoBox>
    </Map>
}


const BeachInfo = ({beach}) => {
    return <React.Fragment>
        <b>{beach.bathing}</b>
        <br/>{formatNumber(beach.total_spill_hours, 2)} hours of sewage
    </React.Fragment>
}

const BeachMap = () => {

    const [ beach, setBeach ] = useState()

    const info = beach ? <BeachInfo beach={beach}/> :
        <React.Fragment>Hover over/Tap on a beach / bathing area</React.Fragment>

    return <Map>
        <LoadingCircles
            url="data/generated/beach-location-totals.json"
            style={beachStyle}
            onSelection={setBeach}
        />
        <Legend>
            <MapLegend colours={beachColours} max={beachMax}/>
        </Legend>
        <InfoBox>
            {info}
        </InfoBox>
    </Map>
}

const FacebookShare = () => {
    // No tracking - https://sharingbuttons.io/
    return <React.Fragment>
        <a className="resp-sharing-button__link"
           href="https://facebook.com/sharer/sharer.php?u=https%3A%2F%2Ftop-of-the-poops.org" target="_blank"
           rel="noopener" aria-label="Share on Facebook">
            <div className="resp-sharing-button resp-sharing-button--facebook resp-sharing-button--large">
                <div aria-hidden="true" className="resp-sharing-button__icon resp-sharing-button__icon--solid">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                            d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                    </svg>
                </div>
                Share on Facebook
            </div>
        </a>
    </React.Fragment>
}

const TwitterShare = () => {
    // No tracking - https://sharingbuttons.io/
    const uri = tweetURI({
        uri: "https://top-of-the-poops.org",
        text: "Water companies are dumping #sewage into rivers and bathing areas all over the UK - over 470,000 times in 2021 - it needs to be stopped",
        tags: ["sewage"],
        via: "sewageuk"
    })

    return <React.Fragment>
        <a className="resp-sharing-button__link"
           href={uri}
           target="_blank" rel="noopener" aria-label="Share on Twitter">
            <div className="resp-sharing-button resp-sharing-button--twitter resp-sharing-button--large">
                <div aria-hidden="true" className="resp-sharing-button__icon resp-sharing-button__icon--solid">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                            d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/>
                    </svg>
                </div>
                Share on Twitter
            </div>
        </a>
    </React.Fragment>

}

class App extends React.Component {
    render() {
        return <div>
            <TitleHero/>
            <ForkMeHero/>
            <blockquote>
                There were at least <em>470,000</em> "sewage spills" - where sewage is intentionally dumped
                into waterways - in England and Wales in 2021
            </blockquote>

            <Container fluid>
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <TwitterShare/>
                        <FacebookShare/>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <p>
                            Each spill is feeding raw or partially treated sewage into rivers, watersheds or into the
                            sea. Combined, they add up to
                            at least <em>3.4 million</em> hours (that's the equivalent of <em>388</em> years!) - in only
                            a single year.
                        </p>
                        <p>While this headline number is reduced since 2020, it's not by much!</p>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <p>
                            This is an underestimate, as the data is poorly collected by the Water Companies, with
                            monitoring
                            defective or in many cases completely absent. Many recordings of data don't seem to be
                            associated with a valid permit, so
                            it is impossible to know where they are.
                        </p>

                        <p>We don't have data for Scotland or Northern Ireland - we're looking
                            to find this information, and will add it when we can. This means that the picture for the
                            UK as a whole will be considerably worse.</p>
                    </Col>
                </Row>

                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <Card>
                            <Card.Header className="font-weight-bold">Hours of Sewage By Constituency 2021</Card.Header>
                            <Card.Body className="m-0 p-0">
                                <ConstituencyMap/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <h2>Affects the whole Country</h2>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <p>This pollution affects the whole country. Here is a list of sewage dumps by constituency. How
                            does your
                            constituency fare?
                            You can search by typing the name into the search box.
                            Maybe you want to tell your MP about it?</p>

                        <p>Click on the <img src="assets/icons/twitter.svg"/> icon in the table below to send a tweet to
                            the relevant MP -
                            not all MPs have Twitter - or alternatively
                            click on the <img src="assets/icons/info-circle-fill.svg"/> icon to find out more about
                            their voting history</p>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Alert variant="success">
                            <p>Click on the constituency name to see a map of all the sewage dumps in the
                                constituency</p>
                        </Alert>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <SpillsByConstituency/>
                    </Col>
                </Row>

                <Row><Col><h2>Into all water courses</h2></Col></Row>
                <Row>
                    <Col>
                        <p>Sewage overflows happen into all types of water system. Freshwater suddenly doesn't sound so
                            fresh.</p>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <SpillsByWaterType/>
                    </Col>
                </Row>

                <Row><Col><h2>Into all rivers</h2></Col></Row>
                <Row>
                    <Col>
                        <p>Some rivers seem to receive more sewage than others. You can find your local river.</p>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <SpillsByRiver/>
                    </Col>
                </Row>

                <Row><Col><h2>Seasides</h2></Col></Row>

                <Mobile>
                    <Alert variant="success">
                        <MapMove/>
                    </Alert>
                </Mobile>

                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <Card>
                            <Card.Header className="font-weight-bold">Hours of Sewage By Bathing Area 2021</Card.Header>
                            <Card.Body className="m-0 p-0">
                                <BeachMap/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <p>We would like clean beaches - but sewage spills are happening all the time at beach
                            locations. <br/> Above you can see a map of England and Wales with all sewage spills into
                            "bathing locations" mapped out.
                            The table below allows a search and shows the totals by beach - which may consist of
                            multiple sewage spill locations on the map</p>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <BathingSewage/>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <h2>Shellfisheries</h2>
                    </Col>
                </Row>

                <Mobile>
                    <Alert variant="success">
                        <MapMove/>
                    </Alert>
                </Mobile>

                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <Card>
                            <Card.Header className="font-weight-bold">Hours of Sewage By Shellfish Area
                                2021</Card.Header>
                            <Card.Body className="m-0 p-0">
                                <Map>
                                    <LoadingCircles url="data/generated/shellfish-location-totals.json"
                                                    style={beachStyle}/>
                                    <Legend>
                                        <MapLegend colours={beachColours} max={beachMax}/>
                                    </Legend>
                                </Map>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <p>Shellfish can become unfit for human consumption when polluted by sewage.</p>
                        <p>In the 2021 data, there is no information for "Ravenglass", as the monitoring was broken for
                            the whole year.</p>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <ShellfishSewage/>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <h2>Data Quality</h2>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <p>
                            Data quality appears very poor. In our naive understanding, each spill event record should
                            be matched with
                            a 'consent' - however some companies don't seem to match up very well at all.
                        </p>

                        <p>
                            In particular, United Utilities registers very many sewage dump incidents against permit
                            numbers that appear to be
                            expired. We don't know the reason for this - it could be that they have no legal basis for
                            the sewage dump, or it could be that
                            the Environment Agency have supplied only partial data for the consent data set.
                        </p>

                        <p>
                            To put this another way - if the spill records list 'consents' that don't appear in the
                            consent database,
                            do these consents exist at all. Even more obviously, Severn Trent Water lists 1199 spill
                            events as 'No Known Permit', and
                            Northumbrian Water lists 519 as 'Permit Anomaly', and Welsh Water lists over 2,000 spills as
                            "Unpermitted"
                        </p>

                    </Col>
                </Row>

                <Row style={{overflow: 'auto'}}>
                    <Col>
                        <SewageDumpsChart/>
                    </Col>
                </Row>

                <Row style={{overflow: 'auto'}}>
                    <Col>
                        <DataMatch/>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <h3>Incomplete Monitoring</h3>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <p>
                            Monitoring is incomplete for many events. Quite a few of the sewage dump sites report their
                            monitoring as 'zero percent'. This means that even for this incomplete data - we know the
                            real picture is way worse.
                            They were completely unmonitored, for various reasons.
                        </p>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <h3>Company Contact Information</h3>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <CompaniesTable/>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <h3>Media</h3>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <p>Please check out our policy on data re-use and attribution at <a
                            href="https://github.com/top-poop/top-of-the-poops">our GitHub page</a></p>
                        <p>We've been featured in:

                            <ul>
                                <li><a href="https://sotn.newstatesman.com/2022/04/mapped-sewage-dumps-and-spills-in-england-and-wales/">The New Statesman</a> "Mapped: Sewage dumps and spills in England and Wales" </li>
                                <li><a href="https://www.theguardian.com/environment/2022/may/02/untreated-sewage-discharge-england-coastal-bathing-waters-2021">The Guardian</a> "Raw sewage ‘pumped into English bathing waters 25,000 times in 2021’"</li>
                                <li><a href="https://www.bbc.co.uk/news/uk-england-61194173">BBC News</a> "Protests over water firms dumping sewage in rivers"</li>
                                <li><a href="https://www.independent.co.uk/news/uk/home-news/sewage-shellfish-pollution-england-uk-b1963688.html">The Independent</a> "Shellfish areas polluted by sewage tens of thousands of times last year"</li>
                            </ul>
                             </p>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <h3>Data Sources & Accuracy</h3>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <p>
                            This website is intended to provide an accurate representation of the Environment Agency
                            data. The data is
                            hard
                            to use, and thus some errors may have been made. If you find something that is incorrect,
                            please raise an
                            issue
                            at <a href="https://github.com/top-poop/top-of-the-poops/issues">the GitHub issues
                            page</a> and we'll endeavour to fix it quickly.
                        </p>
                        <p>The data for Welsh Water is supplied to us in a different format, and we have processed this
                            as best we can,
                            we're grateful to know of any errors - although we believe the interpretation to be pretty
                            accurate. The Welsh Water data is inconsistent as to whether it refers to rivers as "River"
                            or "Afon"
                            and we have converted them as consistently as possible to "River". This is purely to aid
                            collation by name</p>
                        <p>
                            All the data sources are listed on the <a
                            href="https://github.com/top-poop/top-of-the-poops/">source
                            code</a> website
                        </p>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <h3>Copyright</h3>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <p>(C) 2020, 2021 Top-Of-The-Poops CC-BY-SA 4.0, (C) Openstreetmap contributors, Contains OS
                            data © Crown copyright and database right 2021</p>
                        <p>Full Copyright information available at: <a
                            href="https://github.com/top-poop/top-of-the-poops/">our GitHub page</a></p>
                    </Col>
                </Row>

            </Container>
        </div>
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));
