import * as React from 'react';
import ReactDOM from 'react-dom';
import {LoadingPlot} from "./plot";
import {
    BathingSewage,
    ReportingTable,
    ShellfishSewage,
    SpillsByConstituency,
    SpillsByRiver,
} from "./spill-tables";
import {Alert, Card, Col, Container, Jumbotron, Row, Table} from "react-bootstrap";
import {ForkMeHero, TitleHero} from "./heroes";
import {companies} from "./companies";
import {twitterURI} from "./twitter";
import {formatNumber, toKebabCase} from "./text";
import {MapMove, Mobile} from "./maps";
import {FacebookShare, TwitterShare} from "./share";
import {BeachMap, ReportingMap, ShellfishMap} from "./sewage-maps";
import {GeoConstituencyMap, GeoSpillsMap} from "./plot-maps";
import {PlotSpillsDuration, PlotSpillsCumulative, PlotSpillsByCompany} from "./plot-charts";
import {SectionTitle} from "./components";


const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

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
            width: Math.min(1150, vw - 50),
            height: 600,
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
                y: "reporting_year",
            },
            marks: [
                Plot.barY(data, {
                        x: "company_name",
                        y: "count",
                        insetLeft: 0.5,
                        insetRight: 0.5,
                        fill: "company_name",
                        title: d => d.company_name + ` (${d.reporting_year}) ` + formatNumber(d.count),
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
            width: Math.min(1150, vw - 50),
            height: 600,
            x: {
                padding: 0, tickRotate: 45, label: "",
            },
            y: {
                grid: true, label: "number of sites ↑",
            },
            facet: {
                data: data,
                y: "reporting_year",
            },
            marks: [
                Plot.barY(data, {
                    x: "company_name",
                    y: "count",
                    fill: "type",
                    title: d => d.type + ` (${d.reporting_year}) ` + formatNumber(d.count),
                    insetLeft: 0.5,
                    insetRight: 0.5,
                }),
                Plot.ruleY([0]),
            ]
        }
    }
    return <div>
        <div><em>Figure:</em><i>Sites matched to a permit</i></div>
        <LoadingPlot url={url} options={optionsFn}/>
    </div>
}

const FeaturedItem = ({where, title, href}) => {
    return <li><a href={href}>{where}</a> "{title}"</li>
}

class App extends React.Component {
    render() {
        return <div>
            <TitleHero/>
            <ForkMeHero/>
            <Jumbotron fluid>
                <Container>
                    <h5>There were at least <em>470,000</em> "sewage spills" - where sewage is intentionally dumped
                        into waterways - in England and Wales in 2021</h5>
                </Container>
            </Jumbotron>

            <Container fluid>
                <Row className="justify-content-md-center align-items-center">
                    <Col className="sewage-map" md={{span: 4, offset: 1}}>
                        <GeoSpillsMap/>
                    </Col>
                    <Col md={{span: 4}}>
                        <Row>
                            <Col>
                                <p>Here are all the CSOs in England and Wales that 'overflowed' in 2021 - dumping raw or
                                    minimally treated sewage into fragile chalk streams,
                                    rivers, onto beaches and into shellfish areas</p>
                                <p>Each colour represents a different Water Company, the size of each dot relates to how
                                    long
                                    each overflow was polluting</p>
                                <p>
                                    The figures, supplied by the water companies themselves, understate the problem, as
                                    the data
                                    is poorly collected by the Water Companies, with
                                    monitoring
                                    defective or in many cases completely absent. Many recordings of data don't seem to
                                    be
                                    associated with a valid permit, so it is impossible to know where they are.
                                </p>
                            </Col>
                        </Row>
                        <Row>
                            <Col><TwitterShare
                                text="Water companies are dumping #sewage into rivers and bathing areas all over the UK - over 470,000 times in 2021 - it needs to be stopped"/></Col>
                            <Col><FacebookShare/></Col>
                        </Row>
                    </Col>
                </Row>
            </Container>

            <Container>
                <Row>
                    <Col>
                        <SectionTitle>Constituency Sewage</SectionTitle>
                    </Col>
                </Row>

                <Row className="justify-content-md-center">
                    <Col className="sewage-map" md={{offset: 3}}>
                        <GeoConstituencyMap/>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <p>Here is a list of sewage dumps by constituency. How
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
                        <Alert variant="success"><b>Click on the constituency name</b> to see a map of all the sewage dumps in
                            the constituency</Alert>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <SpillsByConstituency/>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <SectionTitle>It's not just a few outliers</SectionTitle>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <p>There aren't just a handful of poorly behaving outlets, its a problem across the board. Here we can see how long each individual CSO
                        was polluting in 2021. You can see that many of them were polluting for long periods. The vertical lines indicate one month of pollution.
                            Many CSOs were polluting for more than a month over the year. A few were polluting for more than half the year!</p>
                        <p>While some water companies are clearly worse than others, there are no <em>good</em> ones - every single water company has some CSOs that are polluting for more than 4 months
                        of the year.</p>
                    </Col>
                </Row>
            </Container>

            <Container fluid>
                <Row className="plot-chart">
                    <Col>
                        <PlotSpillsDuration/>
                    </Col>
                </Row>
            </Container>

            <Container>
                <Row>
                    <Col>
                        <p>&nbsp;</p>
                        <p>Another way of looking at the data is to visualise 'how many CSOs are polluting for longer than a certain time'. All CSOs will be polluting for zero or more hours,
                            and eventually as we increase the time, there will come a point where no CSOs are polluting for that long.</p>
                        <p>From the chart above we can see that some CSOs are polluting for almost the whole year. Using the same scale, we can see below
                        that a significant number of the CSOs are polluting for many months.</p>
                        <p>An an example, looking down the line of '2m' - we can see that Dwr Cymru has 150 CSO's that are polluting for more than two months of the year, while
                        United Utilities has about 95.</p>
                    </Col>
                </Row>
            </Container>

            <Container fluid>
                <Row  className="plot-chart">
                    <Col>
                        <PlotSpillsCumulative/>
                    </Col>
                </Row>
            </Container>

            <Container>
                <Row>
                    <Col><SectionTitle>But, it's getting better, right?</SectionTitle></Col>
                </Row>
                <Row>
                    <Col>
                        <p>Unfortunately, in the years that we have been analysing the data, there hasn't been much progress. We can hope for some evidence of improvement when the 2022 figures come out at the end of March 2023</p>
                        <p>The numbers in this chart are very big, but a total of 850,000 hours is equivalent to a single CSO polluting continuously for <b>97 years</b></p>
                    </Col>
                </Row>
            </Container>

            <Container fluid>
                <Row  className="plot-chart">
                    <Col>
                        <PlotSpillsByCompany/>
                    </Col>
                </Row>
            </Container>


            <Container>
                <Row>
                    <Col>
                        <SectionTitle id="rivers">Into all rivers</SectionTitle>
                    </Col>
                </Row>

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

                <Row>
                    <Col><SectionTitle id="beaches">Seasides</SectionTitle></Col>
                </Row>

                <Row className="justify-content-md-center">
                    <Col md={8}>
                        <Card>
                            <Card.Header className="font-weight-bold">Hours of Sewage By Bathing Area 2021</Card.Header>
                            <Card.Body className="m-0 p-0">
                                <Mobile><Alert variant="success"><MapMove/></Alert></Mobile>
                                <BeachMap/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row><Col>&nbsp;</Col></Row>

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
                    <Col><SectionTitle id="shellfish">Shellfisheries</SectionTitle></Col>
                </Row>

                <Row className="justify-content-md-center">
                    <Col md={8}>
                        <Card>
                            <Card.Header className="font-weight-bold">Hours of Sewage By Shellfish Area
                                2021</Card.Header>
                            <Card.Body className="m-0 p-0">
                                <Mobile><Alert variant="success"><MapMove/></Alert></Mobile>
                                <ShellfishMap/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row><Col>&nbsp;</Col></Row>

                <Row>
                    <Col>
                        <p>Shellfish can become unfit for human consumption when polluted by sewage.</p>
                        <p>Lots of the monitoring is completely broken. See below for more information</p>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <ShellfishSewage/>
                    </Col>
                </Row>

                <Row>
                    <Col><SectionTitle id="data">Data Quality</SectionTitle></Col>
                </Row>

                <Row>
                    <Col>
                        <p>
                            Data quality appears very poor. In our naive understanding, each spill event record should
                            be matched with
                            a 'consent' - however some companies don't seem to match up very well at all.
                        </p>

                        <p>Sometimes the recording or reporting is broken, so that the sewage is only being monitored as
                            certain
                            percentage of the time. Notice that some reporting was active for ZERO percent - this means
                            the reporting was switched off for the whole year. That might be why no sewage was
                            reported.</p>
                    </Col>
                </Row>

                <Row className="justify-content-md-center">
                    <Col md={8}>
                        <Card>
                            <Card.Header className="font-weight-bold">Rivers Reporting Percentages 2021 - Under
                                50%</Card.Header>
                            <Card.Body className="m-0 p-0">
                                <Mobile><Alert variant="success"><MapMove/></Alert></Mobile>
                                <ReportingMap url="data/generated/river-reporting.json" maxReporting={50}/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row><Col>&nbsp;</Col></Row>

                <Row>
                    <Col>
                        <ReportingTable url="data/generated/river-reporting.json"/>
                    </Col>
                </Row>


                <Row className="justify-content-md-center">
                    <Col md={8}>
                        <Card>
                            <Card.Header className="font-weight-bold">Bathing Area Reporting Percentages 2021 - Under
                                90%</Card.Header>
                            <Card.Body className="m-0 p-0">
                                <Mobile><Alert variant="success"><MapMove/></Alert></Mobile>
                                <ReportingMap url="data/generated/beach-location-reporting.json"/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row><Col>&nbsp;</Col></Row>

                <Row>
                    <Col>
                        <ReportingTable url="data/generated/beach-location-reporting.json"/>
                    </Col>
                </Row>

                <Row className="justify-content-md-center">
                    <Col md={8}>
                        <Card>
                            <Card.Header className="font-weight-bold">Shellfish Area Reporting Percentages 2021 - Under
                                90%</Card.Header>
                            <Card.Body className="m-0 p-0">
                                <Mobile><Alert variant="success"><MapMove/></Alert></Mobile>
                                <ReportingMap url="data/generated/shellfish-location-reporting.json"/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row><Col>&nbsp;</Col></Row>

                <Row>
                    <Col>
                        <ReportingTable url="data/generated/shellfish-location-reporting.json"/>
                    </Col>
                </Row>


                <Row><Col><h3>Incomplete Monitoring</h3></Col></Row>

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

                <Row style={{overflow: 'auto'}}>
                    <Col>
                        <SewageDumpsChart/>
                    </Col>
                </Row>

                <Row><Col><h2 id="legality">Legality</h2></Col></Row>

                <Row>
                    <Col>
                        <p>
                            Sometimes reporting happens against permit
                            numbers that appear to be
                            expired. We don't know the reason for this - it could be that they have no legal basis for
                            the sewage dump, or it could be that
                            the Environment Agency have supplied only partial data for the consent data set.
                        </p>
                        <p>
                            To put this another way - if the spill records list 'consents' that don't appear in the
                            consent database, do these consents exist at all.
                        </p>

                        <p>Some sites simply don't have a permit at all</p>

                        <p>Servern Trent and Northumbrian list many sites as "TBC", Dwr Cymru as "N/A", or, tellingly
                            "Unpermitted" </p>
                    </Col>
                </Row>

                <Row style={{overflow: 'auto'}}>
                    <Col>
                        <DataMatch/>
                    </Col>
                </Row>

                <Row><Col><h3 id="companies">Company Contact Information</h3></Col></Row>

                <Row>
                    <Col>
                        <CompaniesTable/>
                    </Col>
                </Row>

                <Row><Col><h3 id="media">Media</h3></Col></Row>

                <Row>
                    <Col>
                        <p>This content is CC-BY-SA 4.0, which requires proper attribution.</p>
                        <p>Please check out our policy on data re-use and attribution at <a
                            href="https://github.com/top-poop/top-of-the-poops">our GitHub page</a> - For media queries
                            please contact "press at top-of-the-poops.org"</p>
                        <p>We've been featured in:</p>
                        <ul>
                            <FeaturedItem
                                href="https://sas.org.uk/waterquality2022/sewage-pollution/sas-x-top-of-the-poops/"
                                where="Surfers Against Sewage"
                                title="Water Quality Report 2022"/>
                            <FeaturedItem
                                href="https://www.greenmatters.com/p/sewage-discharge-map-uk"
                                where="GreenMatters"
                                title="U.K. Water Companies Discharged Scary Amounts of Raw Sewage Into Water in 2021"/>
                            <FeaturedItem
                                href="https://inews.co.uk/news/save-our-rivers-uk-firms-pump-raw-sewage-2143269"
                                where="inews"
                                title="Only 6% of Britain’s rivers on course to be healthy by 2027 as UK’s firms pump more raw sewage"/>
                            <FeaturedItem
                                href="https://www.birminghammail.co.uk/black-country/top-poops-beloved-midlands-river-26284830"
                                where="Birmingham Live"
                                title="Top of the poops - Beloved Midlands river pumped with more sewage than any other"/>
                            <FeaturedItem
                                href="https://www.bbc.co.uk/news/uk-england-leeds-64745380"
                                where="BBC News"
                                title="Yorkshire rivers among worst for sewage discharge, figures show"/>
                            <FeaturedItem
                                href="https://www.itv.com/news/wales/2023-02-20/two-welsh-tourist-hotspots-named-in-worst-sewage-polluted-list"
                                where="ITV News"
                                title="Rhyl and Morfa Nefyn among the worst areas for sewage pollution"/>
                            <FeaturedItem
                                href="https://www.mirror.co.uk/news/uk-news/your-river-top-poops-20-29222405"
                                where="The Mirror"
                                title="UK's 20 most polluted rivers revealed in Top of the Poops league table"/>
                            <FeaturedItem
                                href="https://centralbylines.co.uk/sewage-central-how-our-region-is-being-affected-by-the-water-scandal/"
                                where="Central Bylines"
                                title="Sewage central: how our region is being affected by the water scandal"/>
                            <FeaturedItem
                                href="https://www.lynnnews.co.uk/news/sewage-dumped-into-west-norfolk-rivers-more-than-1-000-times-9270935/"
                                where="Lynn News"
                                title="Sewage dumped into West Norfolk rivers by Anglian Water more than 1,000 times in 2021"/>
                            <FeaturedItem
                                href="https://www.chroniclelive.co.uk/news/north-east-news/chi-onwurah-government-newcastle-sewage-24855226"
                                where="Chronicle Live"
                                title="Chi Onwurah slams Government after data reveals hundreds of sewage dumps have polluted Newcastle's waterways"/>
                            <FeaturedItem
                                href="https://sotn.newstatesman.com/2022/04/mapped-sewage-dumps-and-spills-in-england-and-wales/"
                                where="The New Statesman"
                                title="Mapped: Sewage dumps and spills in England and Wales"/>
                            <FeaturedItem
                                href="https://www.theguardian.com/environment/2022/may/02/untreated-sewage-discharge-england-coastal-bathing-waters-2021"
                                where="The Guardian"
                                title="Raw sewage ‘pumped into English bathing waters 25,000 times in 2021’"/>
                            <FeaturedItem
                                href="https://www.bbc.co.uk/news/uk-england-61194173"
                                where="BBC News"
                                title="Protests over water firms dumping sewage in rivers"/>
                            <FeaturedItem
                                href="https://www.independent.co.uk/news/uk/home-news/sewage-shellfish-pollution-england-uk-b1963688.html"
                                where="The Independent"
                                title="Shellfish areas polluted by sewage tens of thousands of times last year"/>
                        </ul>
                    </Col>
                </Row>

                <Row><Col><h3 id="data">Data Sources & Accuracy</h3></Col></Row>

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
