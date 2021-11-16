import * as React from 'react';
import ReactDOM from 'react-dom';
import {LoadingPlot} from "./plot";
import {BathingSewage, ShellfishSewage, SpillsByConstituency, SpillsByRiver, SpillsByWaterType} from "./spill-tables";
import {Col, Container, Row, Table} from "react-bootstrap";

const formatNumber = n => n.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});

const toKebabCase = str =>
    str &&
    str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('-');


class Loading extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
        }
    }

    async componentDidMount() {
        const r = await fetch(this.props.url);
        const j = await r.json();
        this.setState({data: j});
    }

    render() {
        const childrenWithData = React.Children.map(this.props.children, child =>
            React.cloneElement(child, {data: this.state.data})
        )

        return <div>{childrenWithData}</div>
    }
}

const CompaniesTable = ({data}) => {
    return <Table className="company-contact">
        <thead>

        </thead>
        <tbody>
        {data.map(row => {
            return <tr key={row.name}>
                <td className="logo">
                    <img alt="Logo of company" src={`assets/logos/${toKebabCase(row.name)}.png`}/>
                </td>
                <td>{row.name}</td>
                <td>{row.address.line1} {row.address.line2} {row.address.line3} </td>
                <td>{row.address.town}</td>
                <td>{row.address.postcode}</td>
                <td><a href="tel:{row.phone}">{row.phone}</a></td>
                <td><a href={row.web}>{row.web}</a></td>
            </tr>
        })
        }
        </tbody>
    </Table>
}

const SewageDumpsChart = () => {
    const url = "data/generated/spills-by-company.json"
    const optionsFn = (Plot, data) => {
        return {
            marginTop: 50,
            marginLeft: 100,
            marginBottom: 150,
            width: 1000,
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
            width: 1000,
            height: 500,
            x: {
                padding: 0, tickRotate: 45, label: "",
            },
            y: {
                grid: true, label: "count of sewage dumps ↑",
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

class App extends React.Component {
    render() {
        return <div>
            <div className="hero">
                <img src="assets/poop.png"/>
                <div className="title">Top of the Poops</div>
                <img src="assets/poop.png"/>
            </div>

            <div className="fork-me-wrapper">
                <div className="fork-me">
                    <a className="fork-me-link" href="https://github.com/top-poop/top-of-the-poops">
                        <span className="fork-me-text">Source Code On GitHub</span>
                    </a>
                </div>
            </div>

            <blockquote>
                There were at least <em>500,000</em> "sewage spills" - where sewage is intentionally dumped
                into waterways - in England and Wales in 2020
            </blockquote>

            <Container fluid>
                <Row>
                    <Col>
                        <p>
                            Each spill is feeding raw or partially treated sewage into rivers, watersheds or into the
                            sea. Combined, they add up to
                            at least
                            <em>3.9 million</em> hours (that's the equivalent of
                            <em>445</em> years!) - in only
                            a single year.
                        </p>
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
                <Row>
                    <Col>
                        <SewageDumpsChart/>
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

                <Row>
                    <Col>
                        <p>We would like clean beaches - but sewage spills are happening all the time at beach
                            locations.</p>
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

                <Row>
                    <Col>
                        <p>Shellfish can become unfit for human consumption when polluted by sewage.</p>
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
                            Northumbrian Water lists 519 as 'Permit Anomaly'
                        </p>

                    </Col>
                </Row>

                <Row>
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
                        <Loading url="data/static/companies.json">
                            <CompaniesTable/>
                        </Loading>
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
                            we're grateful to know of any errors - although we belive the interpretation to be pretty
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
            </Container>
        </div>
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));
