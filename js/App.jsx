import * as React from 'react';
import ReactDOM from 'react-dom';
import {LoadingTable} from './tables'

const formatNumber = n => n.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});

const renderNumericCell = ({value}) => formatNumber(value)

const renderMPCell = ({value, row}) => {
  return <a href={row.original.mp_uri}>{value}</a>
}

const BathingSewage = () =>{
  const url = "data/generated/bathing-sewage.json"
  const columns = [
    {title: "Company", accessor: "company_name"},
    {title: "Beach", accessor: "bathing"},
    {title: "Hours of Sewage", accessor: "total_hours", Cell: renderNumericCell},
  ]
  return <LoadingTable url={url} columns={columns}/>
}

const SpillsByRiver = () => {
  const url = "data/generated/spills-by-river.json"
  const columns = [
    {title: "Company", accessor: "company_name"},
    {title: "River", accessor: "river_name"},
    {title: "Sewage Incidents", accessor: "total_count", Cell: renderNumericCell},
    {title: "Hours of Sewage", accessor: "total_hours", Cell: renderNumericCell},
  ]
  return <LoadingTable url={url} columns={columns}/>
}

const SpillsByWaterType = () => {
  const url = "data/generated/spills-by-water-type.json"
  const columns = [
    {title: "Water Type", accessor: "water_type"},
    {title: "Sewage Incidents", accessor: "total_count", Cell: renderNumericCell},
    {title: "Hours of Sewage", accessor: "total_hours", Cell: renderNumericCell},
  ]
  return <LoadingTable url={url} columns={columns}/>
}

const SpillsByConstituency = () => {
  const spillsByConstituencyURL = "data/generated/spills-by-constituency.json"
  const columns = [
    {title: "Constituency", accessor: "constituency"},
    {title: "MP Name", accessor: "mp_name", Cell: renderMPCell},
    {title: "Party", accessor: "mp_party"},
    {title: "Company", accessor: "company"},
    {title: "Sewage Incidents", accessor: "total_spills", Cell: renderNumericCell},
    {title: "Hours of Sewage", accessor: "total_hours", Cell: renderNumericCell},
  ]
  return <LoadingTable url={spillsByConstituencyURL} columns={columns}/>
}

class App extends React.Component {
  render() {
    return <div>
      <BathingSewage/>
      <SpillsByRiver/>
      <SpillsByWaterType/>
      <SpillsByConstituency/>
    </div>
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
