import * as React from 'react';
import {useState} from 'react';
import ReactDOM from 'react-dom';
import {Loading} from "./loading";
import {Button, Card, Col, Container, Row} from "react-bootstrap";
import {ForkMeHero, TitleHero} from "./heroes";
import {Plot} from "./plot";
import {SectionTitle} from "./components";
import {formatNumber, toKebabCase} from "./text";

const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

const plot_height = 600;
const plot_width = Math.max(1150, vw - 50);

const haveLiveData = ["Thames Water"];
const noBeaches = ["Thames Water"]

const companies = [
    "Anglian Water",
    "Dwr Cymru Welsh Water",
    "Northumbrian Water",
    "Severn Trent Water",
    "South West Water",
    "Southern Water",
    "Thames Water",
    "United Utilities",
    "Wessex Water",
    "Yorkshire Water",
]

const CompanySpillsMap = ({company}) => {
    const optionsFn = (Plot, data) => {

        return {
            projection: {
                type: "mercator",
                domain: {
                    type: "MultiPoint",
                    coordinates: [[-6, 49.9], [1.8, 55.9]],
                },
            },
            height: 800,
            r: {range: [1, 15], domain: [0, 8700]},
            marks: [
                Plot.dot(
                    data,
                    {
                        x: "lon",
                        y: "lat",
                        r: "total_spill_hours",
                        fill: d => d["company_name"] == company ? "#f28e2c" : "#cccccc",
                        opacity: 0.7,
                        mixBlendMode: "multiply",
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

const CompanyBeachChart = ({company}) => {

    const optionsFn = (Plot, data) => {

        return {
            marginRight: 70,
            width: plot_width,
            height: 30 * 20,
            color: {
                scheme: "Purples",
            },
            x: {
                grid: true,
                domain: [0, Math.max(...data.map(it => it.total_hours))]
            },
            y: {
                axis: false,
                domain: data
                    .sort((b, a) => a.total_hours === b.total_hours ? 0 : a.total_hours > b.total_hours ? 1 : -1)
                    .map(it => it.bathing)
                    .slice(0, 20)
            },
            marks: [
                Plot.barX(
                    data,
                    {
                        x: "total_hours",
                        y: "bathing",
                        fill: "total_hours"
                    }
                ),
                Plot.text(data, {
                    x: "total_hours",
                    y: "bathing",
                    text: "bathing",
                    textAnchor: "start",
                    fill: "#565656",
                    dx: 5,
                }),
                Plot.text(data, {
                    x: "total_hours",
                    y: "bathing",
                    text: d => `${formatNumber(d.total_hours / (30 * 24), 1)} months - ${formatNumber(d.total_count)} occasions`,
                    textAnchor: "end",
                    fill: "#ffffff",
                    dx: -5,
                }),
                Plot.ruleX([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], {
                    x: d => d * (30 * 24),
                    stroke: '#ff0000aa'
                })
            ]
        }
    }

    const render = (data) => {

        data = data.filter(it => it.company_name == company)

        if (data.length == 0) {
            return <p>{company} didn't pollute any beaches - but this may well be due to its location
                - there simply might not be any nearby to pollute</p>
        }
        return <Plot data={data} options={optionsFn}/>
    }

    return <Loading
        url="data/generated/bathing-sewage.json"
        nullBeforeLoad
        render={data => render(data)}
    />
}


const CompanyRiversChart = ({company}) => {

    const optionsFn = (Plot, data) => {

        data = data.filter(it => it.company_name == company)

        return {
            marginRight: 70,
            width: plot_width,
            height: 30 * 20,
            color: {
                scheme: "Blues",
            },
            x: {
                grid: true,
                domain: [0, Math.max(...data.map(it => it.total_hours))]
            },
            y: {
                axis: false,
                domain: data
                    .sort((b, a) => a.total_hours === b.total_hours ? 0 : a.total_hours > b.total_hours ? 1 : -1)
                    .map(it => it.river_name)
                    .slice(0, 20)
            },
            marks: [
                Plot.barX(
                    data,
                    {
                        x: "total_hours",
                        y: "river_name",
                        fill: "total_hours"
                    }
                ),
                Plot.text(data, {
                    x: "total_hours",
                    y: "river_name",
                    text: "river_name",
                    textAnchor: "start",
                    fill: "#565656",
                    dx: 5,
                }),
                Plot.text(data, {
                    x: "total_hours",
                    y: "river_name",
                    text: d => `${formatNumber(d.total_hours / (30 * 24), 1)} months - ${formatNumber(d.total_count)} occasions`,
                    textAnchor: "end",
                    fill: "#ffffff",
                    dx: -5,
                }),
                Plot.ruleX([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], {
                    x: d => d * (30 * 24),
                    stroke: '#ff0000aa'
                })
            ]
        }
    }

    return <Loading
        url="data/generated/spills-by-river.json"
        nullBeforeLoad
        render={data => <Plot data={data} options={optionsFn}/>}
    />
}

const MetricCard = ({title, metric, children, ...props}) => {
    const clazz = classNames("h-100", "text-center", props.className)
    return <Card className={clazz}>
        <Card.Title>{title}</Card.Title>
        <Card.Body>
            <h2 className="card-metric">{metric}</h2>
            {children}
        </Card.Body>
    </Card>
}
const CompanySummaryInfo = ({hours, count, locations}) => {
    return <Row>
        <Col>
            <MetricCard
                className="l-bg-orange-dark"
                title="Duration"
                metric={<span>{formatNumber(hours)} h</span>}>
                <p>That's the same as a single sewer overflowing continuously
                    for <b>{formatNumber(hours / (24 * 365))}</b> years</p>
            </MetricCard>
        </Col>
        <Col>
            <MetricCard
                className="l-bg-orange-dark"
                title="Incidents"
                metric={formatNumber(count)}>
                <p>On average, <b>{formatNumber(count / 365, 1)}</b> CSOs will overflow every single day</p>
            </MetricCard>
        </Col>
        <Col>
            <MetricCard className="l-bg-orange-dark"
                        title="Locations"
                        metric={formatNumber(locations)}>
                <p>Many CSO locations don't have monitoring at all - so this number is a big underestimate. It could
                    be double this number</p>
            </MetricCard>
        </Col>
    </Row>
}

const CompanySummary = ({company}) => {

    const render = (data) => {
        const item = data
            .filter(it => it.company_name === company)
            .filter(it => it.reporting_year === 2021)[0]

        return <CompanySummaryInfo hours={item.hours} count={item.count} locations={item.location_count}/>
    }

    return <Loading
        url="data/generated/spills-by-company.json"
        nullBeforeLoad
        render={data => render(data)}
    />
}

const BeachesSection = ({company}) => {

    if (noBeaches.includes(company)) {
        return null;
    }

    return <React.Fragment><Container>
        <Row><Col><SectionTitle>Beaches</SectionTitle></Col></Row>
    </Container>

        <Container fluid>
            <Row>
                <Col>
                    <CompanyBeachChart company={company}/>
                </Col>
            </Row>
        </Container>
    </React.Fragment>
}

const CompanyLiveData = ({company, data}) => {

    const total_overflowing_seconds = data.map(it => it.overflowing_duration).reduce( (acc, n) => acc + n);
    const hours = total_overflowing_seconds / ( 60 * 60)
    const count = data.map(it => it.overflowing_count).reduce( (acc, n) => acc + n)
    const days = data.length;

    return <React.Fragment>
        <Container>
            <Row>
                <Col>
                    <MetricCard
                        className="l-bg-blue-dark"
                        title="Duration"
                        metric={<span>{formatNumber(hours)} h</span>}>
                        <p>That's the same as a single sewer overflowing continuously
                            for <b>{formatNumber(hours / (24 * 365))}</b> years</p>
                    </MetricCard>
                </Col>
                <Col>
                    <MetricCard
                        className="l-bg-blue-dark"
                        title="Incidents"
                        metric={formatNumber(count)}>
                        <p>On average, <b>{formatNumber(count / days, 1)}</b> CSOs have overflowed every single day, in the <b>{days}</b> days so far this year</p>
                    </MetricCard>
                </Col>
            </Row>
        </Container>
    </React.Fragment>
}

const CompanyLiveDataSection = ({company}) => {
    if (!haveLiveData.includes(company)) {
        return null;
    }

    const filename = `data/generated/${toKebabCase(company)}-spills-daily.json`


    return <React.Fragment><Container>
        <Row><Col><SectionTitle>How Much Are They Polluting? (2023 so far)</SectionTitle></Col></Row>
    </Container>
        <Loading url={filename}
                 nullBeforeLoad
                 render={data => <CompanyLiveData data={data} company={company}/>}
        />
    </React.Fragment>
}

const NavButton = ({company, current, onClick}) => {
    const clazz = classNames({
        "btn-primary": company == current,
        "btn-secondary": company != current,
    })

    return <Button className={clazz} onClick={() => onClick(company)}>{company}</Button>
}


const NavButtons = ({company, onClick}) => {
    const buttons = companies.map(it => <span><NavButton onClick={onClick} company={it} current={company}/> </span>)

    return buttons;
}

const CompanyApp = ({initial}) => {

    if ( ! initial) {
        initial = noBeaches[0]
    }

    const [company, setCompany] = useState(initial)

    const companySelected = (value) => {
        const params = new URLSearchParams();
        params.append("c", value)
        params.toString()

        window.history.replaceState(
            {},
            `Top Of The Poops | Company | ${value}`,
            `${window.location.pathname}?${params}`
        )
        setCompany(value)
    }

    return <div>
        <Container>

            <TitleHero/>
            <ForkMeHero/>

        </Container>
        <Container fluid>

            <Row className="justify-content-md-center align-items-center">
                <Col className="sewage-map" md={{span: 4, offset: 1}}>
                    <CompanySpillsMap company={company}/>
                </Col>
                <Col md={4}>
                    <h4 className="display-4">{company}</h4>
                </Col>
            </Row>

        </Container>
        <Container>
            <Row>
                <Col><NavButtons company={company} onClick={companySelected}/></Col>
            </Row>
        </Container>
        <Container>

            <Row><Col><SectionTitle>How Much Are They Polluting? (2020 data)</SectionTitle></Col></Row>

            <Row>
                <Col>
                    <CompanySummary company={company}/>
                </Col>
            </Row>
        </Container>

        <CompanyLiveDataSection company={company}/>

        <Container>
            <Row><Col><SectionTitle>Rivers</SectionTitle></Col></Row>
        </Container>

        <Container fluid>
            <Row>
                <Col>
                    <CompanyRiversChart company={company}/>
                </Col>
            </Row>
        </Container>

        <BeachesSection company={company}/>

        <Container>
            <Row><Col><SectionTitle>Shellfish Areas</SectionTitle></Col></Row>
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
                    <p>Full Copyright information available at: <a
                        href="https://github.com/top-poop/top-of-the-poops/">our GitHub page</a></p>
                </Col>
            </Row>

        </Container>
    </div>
}

const urlSearchParams = new URLSearchParams(window.location.search);

const company = urlSearchParams.get("c")

ReactDOM.render(<CompanyApp initial={company}/>, document.getElementById('root'));
