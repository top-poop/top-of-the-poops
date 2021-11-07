import * as React from 'react';
import ReactDOM from 'react-dom';
import {LoadingTable} from './tables'
import {LoadingPlot} from "./plot";

const formatNumber = n => n.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});

const renderNumericCell = ({value}) => formatNumber(value)

const renderMPCell = ({value, row}) => {
  return <a href={row.original.mp_uri}>{value}</a>
}

const ShellfishSewage = () => {
  const url = "data/generated/shellfish-sewage.json"
  const columns = [
    {title: "Company", accessor: "company_name"},
    {title: "Shellfishery Area", accessor: "shellfishery"},
    {title: "Hours of Sewage", accessor: "total_hours", Cell: renderNumericCell},
  ]
  return <LoadingTable url={url} columns={columns}/>
}


const BathingSewage = () => {
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
        There were at least <span id="total-count">...</span> "sewage spills" - where sewage is intentionally dumped
        into waterways - in the UK in 2020
      </blockquote>

      <div>
        Each spill is feeding raw or partially treated sewage into rivers, watersheds or into the sea for at least <span
        id="total-hours">...</span> hours (that's the equivalent of <span
        id="total-years">..</span> years!) continuously.
      </div>

      <div>
        This is an underestimate, as the data is poorly collected by the Water Companies, with monitoring defective or
        in
        many cases completely absent. Many recordings of data don't seem to be associated with a valid permit, so it is
        impossible to know where they are.
      </div>

      <div className="center">
        <div id="graph-spills-count"></div>
      </div>

      <div className="center">
        <div id="graph-spills-hours"></div>
      </div>

      <h3>Affects the whole Country</h3>

      <div>
        This pollution affects the whole country. Here are the top 10 constituencies by hours of spill events, that
        we've managed to match.
      </div>

      <div className="center">
        <SpillsByConstituency/>
      </div>

      <h3>Into all water courses</h3>

      <div>Sewage overflows happen into all types of water system. Freshwater suddenly doesn't sound so fresh.</div>

      <div className="center">
        <SpillsByWaterType/>
      </div>

      <h3>Into all rivers</h3>

      <div>Some rivers seem to receive more sewage than others</div>

      <div className="center">
        <SpillsByRiver/>
      </div>

      <h3>Seasides</h3>

      <div>We would like clean beaches - but sewage spills are happening all the time at beach locations.</div>

      <div className="center">
        <BathingSewage/>
      </div>

      <h3>Shellfisheries</h3>

      <div>Shellfish can become unfit for human consumption when polluted by sewage.</div>

      <div className="center">
        <ShellfishSewage/>
      </div>

      <h3>Data Quality</h3>

      <div>
        Data quality appears very poor. In our naive understanding, each spill event record should be matched with a
        'consent' - however
        some companies don't seem to match up very well at all. In this graph the "matched" values are overstated due to
        multiple 'consent'
        records existing with the same id.
      </div>

      <div>
        To put this another way - if the spill records list 'consents' that don't appear in the consent database, do
        these consents
        exist at all. Even more obviously, Severn Trent Water lists 1199 spill events as 'No Known Permit', and
        Northumbrian Water lists
        519 as 'Permit Anomaly'
      </div>

      <div className="center">
        <DataMatch/>
      </div>

      <h3>Incomplete Monitoring</h3>

      <div>
        Monitoring is incomplete for many events. These graphs show how complete the monitoring is for the various spill
        events, as a percentage of time that the spill was happening. Notice how quite a few events
        have <i>zero</i> percent
        monitoring. They were completely unmonitored, for various reasons.
      </div>

      <div id="graph-reporting"></div>

      <div>
        More information to come... just exploring the surface of this data right now... please add suggestions (see
        issues
        link at the bottom of the page)
      </div>

      <h3>Company Contact Information</h3>
      <div id="company-contacts"></div>

      <h3>Data Sources & Accuracy</h3>

      <div>
        This website is intended to provide an accurate representation of the Environment Agency data. The data is hard
        to use, and thus some errors may have been made. If you find something that is incorrect, please raise an issue
        at<a href="https://github.com/top-poop/top-of-the-poops/issues">the GitHub issues page</a>
        and we'll endeavour to fix it quickly.
      </div>

      <div>
        All the data sources are listed on the <a href="https://github.com/top-poop/top-of-the-poops/">source
        code</a> website
      </div>
    </div>
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));
