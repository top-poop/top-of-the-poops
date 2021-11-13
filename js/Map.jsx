import * as React from 'react';
import {useState} from 'react';
import ReactDOM from 'react-dom';
import {Loading} from "./loading";
import {Col, Container, Form, FormGroup, Row, Table} from "react-bootstrap";
import {ForkMeHero, TitleHero} from "./heroes";

import {MapContainer, Marker, TileLayer} from "react-leaflet";
import Select from "react-select";
import {useGlobalFilter, usePagination, useSortBy, useTable} from "react-table";


function MyTable({columns, data, ...props}) {
  const {
    getTableProps, getTableBodyProps, headerGroups, prepareRow,
    page, canPreviousPage, canNextPage, pageOptions, pageCount,
    gotoPage, nextPage, previousPage, setPageSize,
    rows,
    preGlobalFilteredRows, setGlobalFilter,
    state: {pageIndex, pageSize, globalFilter},
  } = useTable(
    {
      columns,
      data,
    },
  )

  return <div className="table-wrapper">
    <Table {...getTableProps()} {...props}>
      <thead>
      {headerGroups.map(headerGroup => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map(column => (
            <th {...column.getHeaderProps()}>
              {column.render('title')}
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

const What = ({data}) => {

  const [con, setCon] = useState(null)
  const [map, setMap] = useState(null)

  const constituencies = Array.from(new Set(data.map(it => it.constituency)))

  const options = constituencies.map(it => ({value: it, label: it}))

  const columns = [
    {title: "Company", accessor: "company_name"},
    {title: "Waterway", accessor: "receiving_water"},
  ]

  const relevant = con == null ? [] : data.filter(it => it.constituency === con.value)

  const rows = con == null ? <div></div> : <MyTable columns={columns} data={relevant}/>

  const bbox = bboxFrom(relevant)

  if ( map != null && con != null ) map.fitBounds(bbox);

  return <Container fluid>
    <Row>
      <Col>
        <MapContainer
          center={[51.505, -0.09]}
          zoom={18}
          whenCreated={setMap}
          scrollWheelZoom={false}>
          <TileLayer
            attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>, Contains OS data &copy; Crown copyright and database right 2021'
            url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
            id='mapbox/outdoors-v10'
            accessToken="pk.eyJ1IjoidGltZTR0ZWEiLCJhIjoiY2t2Y2g0aXFsMHl4NzMxcGd3djcyOG1qNCJ9.YCoFgOmL5dqrJ9ZD7ozJKQ"
          />
          {relevant.map(it => <Marker key={it.lat + ' ' + it.lon} position={[it.lat, it.lon]}/>)}
        </MapContainer>
      </Col>
      <Col>
        <Form>
          <FormGroup>
            <Form.Label>Constituency</Form.Label>
            <Select options={options} onChange={setCon}/>
          </FormGroup>
        </Form>
        {rows}
      </Col>
    </Row>
  </Container>
}

const MapApp = () => {
  return <div>
    <TitleHero/>
    <ForkMeHero/>
    <Loading url="data/generated/spills-all.json">
      <What/>
    </Loading>
  </div>

}

ReactDOM.render(<MapApp/>, document.getElementById('root'));
