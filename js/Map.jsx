import * as React from 'react';
import {useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {Loading} from "./loading";
import {Alert, Card, Col, Container, Form, FormGroup, Row, Table} from "react-bootstrap";
import {ForkMeHero, TitleHero} from "./heroes";

import {GeoJSON, Marker, Tooltip, useMap} from "react-leaflet";
import Select from "react-select";
import {useSortBy, useTable} from "react-table";
import {formatNumber, renderNumericCell, renderPercentCell, toKebabCase} from "./text";
import {Map, MapMove, Mobile} from "./maps";
import {LiveData} from "./live";
import {FacebookShare, TwitterShare} from "./share";
import {companiesMap} from "./companies";
import live_available from '../web/data/generated/live/constituencies/available.json' assert {type: 'json'};


class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error) {
        return {hasError: true};
    }

    componentDidCatch(error, errorInfo) {
        console.log(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }
        return this.props.children;
    }
}

function MyTable({columns, data, ...props}) {
    const {
        getTableProps, headerGroups, prepareRow,
        rows,
    } = useTable(
        {
            columns,
            data,
        },
        useSortBy
    )

    return <div className="table-wrapper">
        <Table {...getTableProps()} {...props}>
            <thead>
            {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                            {column.render('title')}
                            <span>
                {column.isSorted
                    ? column.isSortedDesc
                        ? ' ↓'
                        : ' ↑'
                    : ''}
                </span>
                        </th>
                    ))}
                </tr>
            ))}
            </thead>
            <tbody>
            {rows.map((row, i) => {
                prepareRow(row)
                return (
                    <tr {...row.getRowProps()}>
                        {row.cells.map(cell => <td {...cell.getCellProps()}>{cell.render('Cell')}</td>)}
                    </tr>
                )
            })
            }
            </tbody>
        </Table>
    </div>
}

const ConstituencyGeo = ({constituency}) => {
    const map = useMap()
    const ref = useRef()

    if (constituency == null) {
        return null;
    } else {
        return <Loading
            nullBeforeLoad
            url={`data/generated/constituencies/${toKebabCase(constituency)}.json`}
            render={(data) => <GeoJSON data={data} key={constituency} ref={ref} eventHandlers={{
                add: () => {
                    map.fitBounds(ref.current.getBounds())
                }
            }}/>}
        />
    }
}

const markerIcon = (colour) => {
    return L.icon({
        iconUrl: `assets/icons/leaflet/marker-icon-${colour}.png`,
        iconRetinaUrl: `assets/icons/leaflet/marker-icon-2x-${colour}.png`,
        iconAnchor: [5, 55],
        popupAnchor: [10, -44],
        iconSize: [25, 41]
    })
}

const SewageMarkers = ({dumps}) => {

    const blueIcon = markerIcon("blue");
    const redIcon = markerIcon("red");

    return <React.Fragment>
        {dumps.map(it => <Marker
                key={`${it.lat}-${it.lon}-${it.site_name}`}
                position={[it.lat, it.lon]}
                icon={it.total_spill_hours > hoursInMonth ? redIcon : blueIcon}
            >
                <Tooltip>{it.site_name}<br/>{it.receiving_water}<br/>{formatNumber(it.spill_count)} Dumps
                    / {formatNumber(it.total_spill_hours)} Hours /
                    Reporting {formatNumber(it.reporting_percent, 2)}%</Tooltip>
            </Marker>
        )}
    </React.Fragment>
}

const hoursInMonth = 730;
const hoursInWeek = 168;

const SpillHours = ({value}) => {
    const text = renderNumericCell({value: value});
    const clazz = classNames({
        "spill-hours-huge": value >= hoursInMonth,
        "spill-hours-large": value >= 0.5 * hoursInMonth,
        "spill-hours-zero": value < 0.5,
        "spill-hours": true
    })

    if ( value > hoursInMonth * 1.5 ) {
        return <span className={clazz}>{text} h ({formatNumber(value / hoursInMonth, 1 )} months)</span>
    }
    if ( value > hoursInMonth / 2) {
        return <span className={clazz}>{text} h ({formatNumber(value / hoursInWeek, 1 )} weeks)</span>
    }
    else {
        return <span className={clazz}>{text} h</span>
    }
}

const renderHoursCell = ({value}) => {
    return <SpillHours value={value}/>
}

const DumpTable = ({dumps}) => {

    const columns = [
        {title: "Company", accessor: "company_name"},
        {title: "Waterway", accessor: "receiving_water"},
        {title: "Site", accessor: "site_name"},
        {title: "Sewage Dumps", accessor: "spill_count", Cell: renderNumericCell},
        {title: "Duration", accessor: "total_spill_hours", Cell: renderHoursCell},
        {title: "Reporting Active %", accessor: "reporting_percent", Cell: renderPercentCell},
    ]

    return <div className="table-responsive">
        <MyTable columns={columns} data={dumps}/>
    </div>
}

const TotalsCard = ({constituency, sites, companies, spills, hours}) => {
    return <Card>
        <Card.Header>Totals for {constituency} in 2021</Card.Header>
        <Card.Body>
            <Card.Title>{formatNumber(sites)} Sites polluted by {companies.join(", ")}</Card.Title>
            <Card.Text>
                {formatNumber(spills)} sewage dumps<br/>
                <SpillHours value={hours}/> duration<br/>
            </Card.Text>
        </Card.Body>
    </Card>
}

const ActionCard = ({constituency, sites, companies, spills, hours}) => {

    const company_twitters = companies.map(it => companiesMap.get(it).twitter).join(" ");

    const text = `${constituency} polluted by ${company_twitters} for ${formatNumber(hours)} hours in 2021. Take action.`

    return <Card>
        <Card.Header>Take Action </Card.Header>
        <Card.Body>
            <Card.Text>
                <FacebookShare/>
                <TwitterShare text={text}/>
            </Card.Text>
        </Card.Body>
    </Card>
}

const NavCard = () => {
    return <Card>
        <Card.Header>Explore </Card.Header>
        <Card.Body>
            For information on pollution by <b><Card.Link href="/">River</Card.Link></b>, <b><Card.Link href="/">Beach</Card.Link></b> or see the worst pollution hot-spots see our <Card.Link href="/">Homepage</Card.Link>
        </Card.Body>
    </Card>
}

const Totals = ({constituency, rows}) => {
    if (constituency == null) {
        return null;
    }

    const sites = rows.filter(it => it.spill_count > 0).length
    const spills = rows.reduce((acc, it) => acc + it.spill_count, 0)
    const hours = rows.reduce((acc, it) => acc + it.total_spill_hours, 0)

    const companies = [...new Set(rows.map(it => it.company_name))]

    return <React.Fragment>
        <TotalsCard constituency={constituency} companies={companies} sites={sites} spills={spills} hours={hours}/>
        <ActionCard constituency={constituency} companies={companies} sites={sites} spills={spills} hours={hours}/>
        <NavCard/>
    </React.Fragment>
}

const live_map = new Set(live_available)

const dropdownLabelFor = (constituency) => {
    if (live_map.has(constituency)) {
        return `✔ ${constituency}`
    } else {
        return `- ${constituency}`
    }
}
const ConstituencyDropDown = ({constituency, constituencies, ...props}) => {

    const constituencyChoices = constituencies.map(it => ({value: it, label: dropdownLabelFor(it)}))

    return <Select
        defaultValue={{value: constituency, label: dropdownLabelFor(constituency)}}
        options={constituencyChoices}
        {...props}
    />
}

const What = ({initial, data}) => {

    const [constituency, setCon] = useState(initial)

    console.log(`Initial = ${initial} Constituency = ${constituency}`)

    const constituencySelected = (e) => {
        const value = e.value;
        const params = new URLSearchParams();
        params.append("c", value)
        params.toString()

        window.history.replaceState(
            {},
            `Top Of The Poops | Map | ${value}`,
            `${window.location.pathname}?${params}`
        )
        setCon(value)
    }

    const constituencies = Array.from(new Set(data.map(it => it.constituency)))

    const relevant = constituency == null ? [] : data.filter(it => it.constituency === constituency)

    return <Container fluid>
        <Row>
            <Col md={8}>
                <Mobile><Alert variant="success"><MapMove/></Alert></Mobile>
                <ErrorBoundary>
                    <Map>
                        <ConstituencyGeo constituency={constituency}/>
                        <SewageMarkers dumps={relevant}/>
                    </Map>
                </ErrorBoundary>
            </Col>
            <Col>
                <Row>
                    <Col>
                        <Alert variant="success">Select the constituency from the drop-down - you can type in the
                            box to search</Alert>
                        <Form>
                            <FormGroup>
                                <Form.Label>Constituency</Form.Label>
                                <ConstituencyDropDown
                                    constituency={constituency}
                                    constituencies={constituencies}
                                    onChange={constituencySelected}
                                />
                                <Form.Text>✔ means we have experimental daily data for 2023</Form.Text>
                            </FormGroup>
                            {constituency == null ? <Alert variant="primary">Select a constituency</Alert> : null}
                        </Form>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Totals constituency={constituency} rows={relevant}/>
                    </Col>
                </Row>
            </Col>
        </Row>
        <Row className="mt-3">
            <Col>
                <LiveData constituency={constituency}/>
            </Col>
        </Row>

        <Row><Col>&nbsp;</Col></Row>
        <Row><Col><h3 id="table">Pollution Summary 2021</h3></Col></Row>

        <Row>
            <Col>
                <p>Here are all the reported sewage overflow totals for {constituency} in 2021. Sometimes sewage can be being dumped for <b>months</b> at a time.</p>
            </Col>
        </Row>

        <Row className="mt-3">
            <Col>
                <DumpTable dumps={relevant}/>
            </Col>
        </Row>

        <Row><Col><h3 id="data">Data Sources & Accuracy</h3></Col></Row>

        <Row>
            <Col>
                <p>
                    Experimental derived data from <a href="https://data.thameswater.co.uk/s/">Thames Water</a> API, Some data may be missing or inaccurate.
                    This uses Environment Agency rainfall data from the real-time data API (Beta) - Rainfall data is delayed by up to two days.
                </p>
                <p>
                    This website is intended to provide an accurate representation of the Environment Agency
                    data. The data is hard to use, and thus some errors may have been made. If you find something that is incorrect,
                    please raise an issue at <a href="https://github.com/top-poop/top-of-the-poops/issues">the GitHub issues
                    page</a> and we'll endeavour to fix it quickly.
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
}

const MapApp = ({constituency}) => {
    return <div>
        <TitleHero/>
        <ForkMeHero/>
        <Loading url="data/generated/spills-all.json"
                 render={(data) => <What data={data} initial={constituency}/>}
        />
    </div>
}

const urlSearchParams = new URLSearchParams(window.location.search);

const constituency = urlSearchParams.get("c")

ReactDOM.render(<MapApp constituency={constituency}/>, document.getElementById('root'));
