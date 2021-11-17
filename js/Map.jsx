import * as React from 'react';
import {useState} from 'react';
import ReactDOM from 'react-dom';
import {Loading} from "./loading";
import {Alert, Col, Container, Form, FormGroup, Row, Table} from "react-bootstrap";
import {ForkMeHero, TitleHero} from "./heroes";

import {GeoJSON, MapContainer, Marker, TileLayer, Tooltip} from "react-leaflet";
import Select from "react-select";
import {useSortBy, useTable} from "react-table";


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

const bboxFrom = (rows) => {
  let [min_lat, min_lon] = [ Infinity, Infinity]
  let [max_lat, max_lon] = [ -Infinity, -Infinity]
  rows.forEach(it => {
    if (it.lat < min_lat) min_lat = it.lat
    if (it.lon < min_lon) min_lon = it.lon
    if (it.lat > max_lat) max_lat = it.lat
    if (it.lon > max_lon) max_lon = it.lon
  })
  return [[min_lat, min_lon],[ max_lat, max_lon]]
}

const toKebabCase = str =>
    str &&
    str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('-');

const formatNumber = n => n.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});

const What = ({data}) => {

  const [con, setCon] = useState(null)
  const [map, setMap] = useState(null)

  const constituencies = Array.from(new Set(data.map(it => it.constituency)))

  const constituencyChoices = constituencies.map(it => ({value: it, label: it}))

  const columns = [
    {title: "Company", accessor: "company_name"},
    {title: "Waterway", accessor: "receiving_water"},
    {title: "Site", accessor: "site_name"},
    {title: "Sewage Dumps", accessor: "spill_count"},
    {title: "Hours", accessor: "total_spill_hours"},
  ]

  const relevant = con == null ? [] : data.filter(it => it.constituency === con.value)

  const rows = con == null ? <div></div> : <MyTable columns={columns} data={relevant}/>

  const geo = con == null ? null : <Loading nullBeforeLoad url={`data/generated/constituencies/${toKebabCase(con.value)}.json`}>
    <GeoJSON key={con.value} data={data}/>
  </Loading>

  const bbox = bboxFrom(relevant)

  if ( map != null && con != null ) map.fitBounds(bbox);

  return <Container fluid>
    <Row>
      <Col md={8}>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={18}
          whenCreated={setMap}
          dragging={!L.Browser.mobile}
          scrollWheelZoom={true}>
          <TileLayer
            attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>, Contains OS data &copy; Crown copyright and database right 2021'
            url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
            id='mapbox/outdoors-v10'
            accessToken="pk.eyJ1IjoidGltZTR0ZWEiLCJhIjoiY2t2Y2g0aXFsMHl4NzMxcGd3djcyOG1qNCJ9.YCoFgOmL5dqrJ9ZD7ozJKQ"
          />
          {geo}
          {relevant.map(it => <Marker
              key={`${it.lat}-${it.lon}-${it.site_name}`}
              position={[it.lat, it.lon]}>
                <Tooltip>{it.site_name}<br/>{it.receiving_water}<br/>({formatNumber(it.spill_count)} Dumps / {formatNumber(it.total_spill_hours)} Hours)</Tooltip>
              </Marker>
          )}
        </MapContainer>
      </Col>
      <Col>
        <Form>
          <FormGroup>
            <Form.Label>Constituency</Form.Label>
            <Select options={constituencyChoices} onChange={setCon}/>
          </FormGroup>
          { con == null ? <Alert variant="primary">Select a constituency</Alert> : null }
        </Form>
      </Col>
    </Row>
    <Row>
      <Col>
        {rows}
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
        This is a basic view of the data - we're working on making it more sophisticated. We wanted to give you the data
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
