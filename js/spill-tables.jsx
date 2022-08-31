import {LoadingTable} from "./tables";
import * as React from "react";
import {tweetURI} from "./twitter";
import {companiesMap} from "./companies";
import {formatNumber, renderNumericCell, renderPercentCell} from "./text";

// oddly, react-table built-in compare, does stringy number compare (without sign)
function compareNumeric(rowA, rowB, columnId) {
    let [a, b] = [rowA.values[columnId], rowB.values[columnId]]
    return a === b ? 0 : a > b ? 1 : -1
}

const renderDeltaCell = ({value}) => {
    const text = renderNumericCell({value: Math.abs(value)})
    const clazz = classNames({
        "delta-positive": value >= 1,
        "delta-negative": value <= -1,
        "delta-zero": value < 1 && value > -1,
        "delta": true
    })
    return <span className={clazz}>{text}</span>
}

const ShellfishSewage = () => {
    const url = "data/generated/shellfish-sewage.json"
    const columns = [
        {title: "Company", accessor: "company_name"},
        {title: "Shellfishery Area", accessor: "shellfishery"},
        {title: "Sewage Incidents", accessor: "total_count", Cell: renderNumericCell, Footer: sumColumn},
        {
            title: "Incidents Change",
            accessor: "spills_increase",
            Cell: renderDeltaCell,
            sortType: compareNumeric,
            Footer: sumDeltaColumn
        },
        {title: "Hours of Sewage", accessor: "total_hours", Cell: renderNumericCell, Footer: sumColumn},
        {
            title: "Hours Change",
            accessor: "hours_increase",
            Cell: renderDeltaCell,
            sortType: compareNumeric,
            Footer: sumDeltaColumn
        },
    ]
    return <LoadingTable url={url} columns={columns}/>
}


const BathingSewage = () => {
    const url = "data/generated/bathing-sewage.json"
    const columns = [
        {title: "Company", accessor: "company_name"},
        {title: "Beach", accessor: "bathing"},
        {title: "Sewage Incidents", accessor: "total_count", Cell: renderNumericCell, Footer: sumColumn},
        {
            title: "Incidents Change",
            accessor: "spills_increase",
            Cell: renderDeltaCell,
            sortType: compareNumeric,
            Footer: sumDeltaColumn
        },
        {title: "Hours of Sewage", accessor: "total_hours", Cell: renderNumericCell, Footer: sumColumn},
        {
            title: "Hours Change",
            accessor: "hours_increase",
            Cell: renderDeltaCell,
            sortType: compareNumeric,
            Footer: sumDeltaColumn
        },
    ]
    return <LoadingTable url={url} columns={columns}/>
}

const SpillsByRiver = () => {
    const url = "data/generated/spills-by-river.json"
    const columns = [
        {title: "Company", accessor: "company_name"},
        {title: "River", accessor: "river_name"},
        {title: "Sewage Incidents", accessor: "total_count", Cell: renderNumericCell, Footer: sumColumn},
        {
            title: "Incidents Change",
            accessor: "spills_increase",
            Cell: renderDeltaCell,
            sortType: compareNumeric,
            Footer: sumDeltaColumn
        },
        {title: "Hours of Sewage", accessor: "total_hours", Cell: renderNumericCell, Footer: sumColumn},
        {
            title: "Hours Change",
            accessor: "hours_increase",
            Cell: renderDeltaCell,
            sortType: compareNumeric,
            Footer: sumDeltaColumn
        },
    ]
    return <LoadingTable url={url} columns={columns}/>
}

const SpillsByWaterType = () => {
    const url = "data/generated/spills-by-water-type.json"
    const columns = [
        {title: "Water Type", accessor: "water_type"},
        {
            title: "Sewage Incidents",
            accessor: "total_count",
            Cell: renderNumericCell,
            sortType: compareNumeric,
            Footer: sumColumn
        },
        {
            title: "Incidents Change",
            accessor: "spills_increase",
            Cell: renderDeltaCell,
            sortType: compareNumeric,
            Footer: sumDeltaColumn
        },
        {
            title: "Overflow Hours",
            accessor: "total_hours",
            Cell: renderNumericCell,
            sortType: compareNumeric,
            Footer: sumColumn
        },
        {
            title: "Overflow Hours Change",
            accessor: "hours_increase",
            Cell: renderDeltaCell,
            sortType: compareNumeric,
            Footer: sumDeltaColumn
        },
    ]
    return <LoadingTable url={url} columns={columns}/>
}


const ReportingTable = ({url}) => {
    const columns = [
        {title: "Constituency", accessor: "pcon20nm", Cell: renderConstituencyCell},
        {title: "Location", accessor: "location"},
        {title: "Site", accessor: "discharge_site_name"},
        {title: "Reporting %", accessor: "reporting_percent", Cell: renderPercentCell},
        {title: "Spills Counted", accessor: "spill_count", Cell: renderNumericCell},
        {title: "Excuses", accessor: "excuses"},
    ]
    return <LoadingTable url={url} columns={columns}/>
}

const tweetTextFromRow = (row) => {
    const constituency = row.original.constituency

    const spills = row.original.total_spills;
    const events = formatNumber(spills)
    const company = row.original.company
    const mp = row.original.twitter_handle

    const companyTwitter = companiesMap.get(company).twitter

    if (spills > 20) {
        return `Horrified that ${constituency} had ${events} sewage dumps in 2021 - by ${company} ${companyTwitter} - ${mp} - are you taking action?\n\n`
    } else {
        return `Even though ${constituency} had few notified sewage dumps in 2021, there were more than 400,000 in England & Wales. ${mp} are you taking action?\n\n`
    }
}

const An = ({...props}) => {
    return <a target="_blank" rel="noopener noreferrer" {...props}>{props.children}</a>
}

const renderTwitterCell = ({row}) => {
    const uri = "https://top-of-the-poops.org"
    const text = tweetTextFromRow(row)
    const tags = ["sewage"]
    const via = "sewageuk"
    const handle = row.original.twitter_handle

    const icon_size = 24

    const content = <img width={icon_size} height={icon_size} alt="tweet icon" src="assets/icons/twitter.svg"/>
    return handle ?
        <An className="mp-info" href={tweetURI({uri: uri, text: text, tags: tags, via: via})}>{content}</An> :
        <span></span>
}

const renderInfoCell = ({row}) => {
    const icon_size = 24
    return <An className="mp-info" href={row.original.mp_uri}><img width={icon_size} height={icon_size} alt="info icon"
                                                                   src="assets/icons/info-circle-fill.svg"/></An>
}

const renderRankCell = ({row}) => {
    return row.index + 1
}

const renderConstituencyCell = ({value}) => {
    const p = new URLSearchParams()
    p.set("c", value)
    const url = `map.html?${p}`
    return <div className="mp-info"><a href={url}>{value}</a></div>
}

const sumColumn = (info) => {
    const myColumn = info.column.id

    const total = React.useMemo(() => info.rows.reduce((sum, row) => row.values[myColumn] + sum, 0), [info.rows])

    return formatNumber(total)
}

const sumDeltaColumn = (info) => {
    const myColumn = info.column.id

    const total = React.useMemo(() => info.rows.reduce((sum, row) => row.values[myColumn] + sum, 0), [info.rows])

    return renderDeltaCell({value: total})
}

const SpillsByConstituency = () => {
    const spillsByConstituencyURL = "data/generated/spills-by-constituency.json"
    const columns = [
        {title: "Rank", id: "rank", Cell: renderRankCell},
        {title: "Constituency", accessor: "constituency", Cell: renderConstituencyCell},
        {title: "MP Name", accessor: "mp_name"},
        {title: "Tweet", id: "twitter", Cell: renderTwitterCell},
        {title: "Party", accessor: "mp_party"},
        {title: "Info", id: "info", Cell: renderInfoCell},
        {title: "Company", accessor: "company"},
        {
            title: "Sewage Dumps",
            accessor: "total_spills",
            Cell: renderNumericCell,
            sortType: compareNumeric,
            Footer: sumColumn
        },
        {
            title: "Change",
            accessor: "spills_increase",
            Cell: renderDeltaCell,
            sortType: compareNumeric,
            Footer: sumDeltaColumn
        },
        {
            title: "Hours of Sewage",
            accessor: "total_hours",
            Cell: renderNumericCell,
            sortType: compareNumeric,
            Footer: sumColumn
        },
        {
            title: "Change",
            accessor: "hours_increase",
            Cell: renderDeltaCell,
            sortType: compareNumeric,
            Footer: sumDeltaColumn
        },
    ]
    return <LoadingTable className="mp-info" url={spillsByConstituencyURL} columns={columns}/>
}

export {SpillsByWaterType, SpillsByConstituency, SpillsByRiver, ShellfishSewage, BathingSewage, ReportingTable}