import * as React from 'react';
import {useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {Loading} from "./loading";
import {Alert, Card, Col, Container, Form, FormGroup, Row, Table} from "react-bootstrap";
import {ForkMeHero, TitleHero} from "./heroes";

import {GeoJSON, MapContainer, Marker, Tooltip, useMap} from "react-leaflet";
import Select from "react-select";
import {useSortBy, useTable} from "react-table";
import {formatNumber, renderNumericCell, renderPercentCell, toKebabCase} from "./text";
import {Map, MapMove, Mobile} from "./maps";

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

const ConstituencyGeo = ({constituency }) => {
    const map = useMap()
    const ref = useRef()

    if (constituency == null) {
        return null;
    } else {
        return <Loading
            nullBeforeLoad
            url={`data/generated/constituencies/${toKebabCase(constituency)}.json`}
            render={(data) => <GeoJSON data={data} key={constituency} ref={ref} eventHandlers={{
                add: () => { map.fitBounds(ref.current.getBounds()) }
            }}/>}
        />
    }
}

const markerIcon = (colour) => {
    return L.icon({
        iconUrl: `assets/icons/leaflet/marker-icon-${colour}.png`,
        iconRetinaUrl: `assets/icons/leaflet/marker-icon-2x-${colour}.png`,
        iconAnchor: [ 5, 55],
        popupAnchor: [ 10, -44],
        iconSize: [25, 41 ]
    })
}

const SewageMarkers = ({dumps}) => {

    const blueIcon = markerIcon("blue");
    const redIcon = markerIcon("red");

    return <React.Fragment>
        {dumps.map(it => <Marker
                key={`${it.lat}-${it.lon}-${it.site_name}`}
                position={[it.lat, it.lon]}
                icon={ it.reporting_percent < 50 ? redIcon : blueIcon }
            >
                <Tooltip>{it.site_name}<br/>{it.receiving_water}<br/>{formatNumber(it.spill_count)} Dumps
                    / {formatNumber(it.total_spill_hours)} Hours / Reporting {formatNumber(it.reporting_percent, 2)}%</Tooltip>
            </Marker>
        )}
    </React.Fragment>
}

const DumpTable = ({dumps}) => {

    const columns = [
        {title: "Company", accessor: "company_name"},
        {title: "Waterway", accessor: "receiving_water"},
        {title: "Site", accessor: "site_name"},
        {title: "Sewage Dumps", accessor: "spill_count", Cell: renderNumericCell},
        {title: "Hours", accessor: "total_spill_hours", Cell: renderNumericCell},
        {title: "Reporting Active %", accessor: "reporting_percent", Cell: renderPercentCell},
    ]

    return <div className="table-responsive">
        <MyTable columns={columns} data={dumps}/>
    </div>
}

const TotalsCard = ( { constituency, rows }) => {
    if ( constituency == null ) {
        return null;
    }

    const sites = formatNumber(rows.length)
    const spills = formatNumber(rows.reduce( ( acc, it ) => acc + it.spill_count, 0))
    const hours = formatNumber(rows.reduce( ( acc, it ) => acc + it.total_spill_hours, 0))

    return <Card>
        <Card.Header>Totals for {constituency}</Card.Header>
        <Card.Body>
            <Card.Title>{sites} Sites</Card.Title>
            <Card.Text>
                <p>{spills} sewage dumps</p>
                <p>{hours} hours duration</p>
            </Card.Text>
        </Card.Body>
    </Card>
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

    const constituencyChoices = constituencies.map(it => ({value: it, label: it}))

    const relevant = constituency == null ? [] : data.filter(it => it.constituency === constituency)

    return <Container>
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
                <Container>
                    <Row>
                        <Col>
                            <Alert variant="success">Select the constituency from the drop-down - you can type in the box to search</Alert>
                            <Form>
                                <FormGroup>
                                    <Form.Label>Constituency</Form.Label>
                                    <Select
                                        defaultValue={ { value: constituency, label: constituency } }
                                        options={constituencyChoices}
                                        onChange={constituencySelected}
                                    />
                                </FormGroup>
                                {constituency == null ? <Alert variant="primary">Select a constituency</Alert> : null}
                            </Form>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <TotalsCard constituency={constituency} rows={relevant}/>
                        </Col>
                    </Row>
                </Container>
            </Col>
        </Row>
        <Row>
            <Col>
                <DumpTable dumps={relevant}/>
            </Col>
        </Row>
    </Container>
}

const MapApp = ( { constituency }) => {
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
