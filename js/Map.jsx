import * as React from 'react';
import {useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {Loading} from "./loading";
import {Alert, Col, Container, Form, FormGroup, Row, Table} from "react-bootstrap";
import {ForkMeHero, TitleHero} from "./heroes";

import {GeoJSON, MapContainer, Marker, TileLayer, Tooltip, useMap} from "react-leaflet";
import Select from "react-select";
import {useSortBy, useTable} from "react-table";
import {formatNumber, renderNumericCell, toKebabCase} from "./text";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error) {    // Update state so the next render will show the fallback UI.
        return {hasError: true};
    }

    componentDidCatch(error, errorInfo) {    // You can also log the error to an error reporting service
        console.log(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {      // You can render any custom fallback UI
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

const Tiles = () => <TileLayer
    attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>, Contains OS data &copy; Crown copyright and database right 2021'
    url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
    id='mapbox/outdoors-v10'
    accessToken="pk.eyJ1IjoidGltZTR0ZWEiLCJhIjoiY2t2Y2g0aXFsMHl4NzMxcGd3djcyOG1qNCJ9.YCoFgOmL5dqrJ9ZD7ozJKQ"
/>

const ConstituencyGeo = ({constituency }) => {
    const map = useMap()
    const ref = useRef()

    if (constituency == null) {
        return null;
    } else {
        return <Loading nullBeforeLoad url={`data/generated/constituencies/${toKebabCase(constituency)}.json`}>
            <GeoJSON key={constituency} ref={ref} eventHandlers={{
                add: () => { map.fitBounds(ref.current.getBounds()) }
            }}/>
        </Loading>
    }
}

const SewageMarkers = ({dumps}) => {
    return <React.Fragment>
        {dumps.map(it => <Marker
                key={`${it.lat}-${it.lon}-${it.site_name}`}
                position={[it.lat, it.lon]}>
                <Tooltip>{it.site_name}<br/>{it.receiving_water}<br/>({formatNumber(it.spill_count)} Dumps
                    / {formatNumber(it.total_spill_hours)} Hours)</Tooltip>
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
    ]

    return <MyTable columns={columns} data={dumps}/>
}

const What = ({data}) => {

    const [con, setCon] = useState(null)

    const constituencies = Array.from(new Set(data.map(it => it.constituency)))

    const constituencyChoices = constituencies.map(it => ({value: it, label: it}))

    const constituency = con == null ? null : con.value

    const relevant = constituency == null ? [] : data.filter(it => it.constituency === constituency)

    return <Container>
        <Row>
            <Col md={8}>
                <ErrorBoundary>
                    <MapContainer
                        center={[54.622978, -1.977539]}
                        zoom={6}
                        dragging={!L.Browser.mobile}
                        scrollWheelZoom={true}>
                        <Tiles/>
                        <ConstituencyGeo constituency={constituency}/>
                        <SewageMarkers dumps={relevant}/>
                    </MapContainer>
                </ErrorBoundary>
            </Col>
            <Col>
                <Form>
                    <FormGroup>
                        <Form.Label>Constituency</Form.Label>
                        <Select options={constituencyChoices} onChange={setCon}/>
                    </FormGroup>
                    {constituency == null ? <Alert variant="primary">Select a constituency</Alert> : null}
                </Form>
            </Col>
        </Row>
        <Row>
            <Col>
                <DumpTable dumps={relevant}/>
            </Col>
        </Row>
    </Container>
}

const MapApp = () => {
    return <div>
        <TitleHero/>
        <ForkMeHero/>
        <Alert variant="success">
            <Alert.Heading>We're working on it</Alert.Heading>
            <p>
                This is a basic view of the data - we're working on making it more sophisticated. We wanted to give you
                the data
                as soon as possible..
            </p>
            <p>Select the constituency from the drop-down - you can type in the box to search</p>
        </Alert>
        <Loading url="data/generated/spills-all.json">
            <What/>
        </Loading>
    </div>

}

ReactDOM.render(<MapApp/>, document.getElementById('root'));
