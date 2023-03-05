import * as React from "react";
import {formatNumber} from "./text";
import {useState} from "react";
import {LoadingCircles, Map} from "./maps";
import {ChloroGeo, InfoBox, Legend} from "./chloropleth";
import {Loading} from "./loading";


const spillMax = 80000;
const spillColours = [
    '#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84',
    '#fc8d59', '#ef6548', '#d7301f', '#990000'
]
const beachMax = 5500;
const beachColours = ['#e66101', '#fdb863', '#b2abd2', '#5e3c99']

const reportingColours = ['#5e3c99', '#b2abd2', '#fdb863', '#e66101'];


const colourScale = (colours, maxValue) => {

    const scale = colours.length / maxValue

    return (n) => {
        return colours[Math.min(scale * n, colours.length - 1).toFixed()];
    }
}

const spillsStyle = (feature) => {
    const fillColor = colourScale(spillColours, spillMax)(feature.properties.total_hours);

    return {
        fillColor: fillColor,
        weight: 1,
        opacity: 0.7,
        color: '#333',
        dashArray: '3',
        fillOpacity: 0.6
    }
}

const beachStyle = (beach) => {
    const n = beach.total_spill_hours;
    const colour = colourScale(beachColours, beachMax)(n)
    return {
        color: colour,
        fillColor: colour,
        fillOpacity: 0.5,
        radius: 10,
    }
}

const reportingStyle = (reporting) => {
    const n = reporting.reporting_percent;
    const colour = colourScale(reportingColours, 100)(n)
    return {
        color: colour,
        fillColor: colour,
        fillOpacity: 0.5,
        radius: 10,
    }
}

const MapLegend = ({colours, max, children}) => {

    const count = colours.length
    const step = max / count

    const scale = colourScale(colours, max)

    const things = [...Array(colours.length).keys()].map(n => {
        return <React.Fragment key={`legend-${n}`}>
            <i style={{background: scale(n * step)}}> </i> {formatNumber(n * step)} - {formatNumber((n + 1) * step)}
            <br/>
        </React.Fragment>
    })
    return <React.Fragment>
        <div>{children}</div>
        {things}
    </React.Fragment>;
}


const ConstituencyInfo = ({feature}) => {
    return <React.Fragment>
        <b>{feature.properties.name}</b>
        <br/>{formatNumber(feature.properties.total_hours, 2)} hours of sewage, from {feature.properties.cso_count} outlets
    </React.Fragment>
}

const ConstituencyMap = () => {

    const [feature, setFeature] = useState()

    const info = feature ? <ConstituencyInfo feature={feature}/> :
        <React.Fragment>Hover over/Tap on a constituency</React.Fragment>

    return <Map>
        <ChloroGeo url="data/generated/chloropleth/chloro.json" style={spillsStyle} onMouseOverFeature={setFeature}/>
        <Legend>
            <MapLegend colours={spillColours} max={spillMax}/>
        </Legend>
        <InfoBox>
            {info}
        </InfoBox>
    </Map>
}


const BeachInfo = ({beach}) => {
    return <React.Fragment>
        <b>{beach.bathing}</b>
        <br/>{formatNumber(beach.total_spill_hours, 2)} hours of sewage
    </React.Fragment>
}

const BeachMap = () => {

    const [ beach, setBeach ] = useState()

    const info = beach ? <BeachInfo beach={beach}/> :
        <React.Fragment>Hover over/Tap on a beach / bathing area</React.Fragment>

    return <Map>
        <LoadingCircles
            url="data/generated/beach-location-totals.json"
            style={beachStyle}
            onSelection={setBeach}
        />
        <Legend>
            <MapLegend colours={beachColours} max={beachMax}/>
        </Legend>
        <InfoBox>
            {info}
        </InfoBox>
    </Map>
}

const ShellfishInfo = ({location}) => {
    return <React.Fragment>
        <b>{location.shellfishery}</b>
        <br/>{formatNumber(location.total_spill_hours, 2)} hours of sewage
    </React.Fragment>
}


const ShellfishMap = () => {

    const [ location, setLocation ] = useState()

    const info = location ? <ShellfishInfo location={location}/> :
        <React.Fragment>Hover over/Tap on a location</React.Fragment>

    return <Map>
        <LoadingCircles url="data/generated/shellfish-location-totals.json"
                        style={beachStyle}
                        onSelection={setLocation}
        />
        <Legend>
            <MapLegend colours={beachColours} max={beachMax}/>
        </Legend>
        <InfoBox>
            {info}
        </InfoBox>
    </Map>
}

const ReportingInfo = ({report}) => {
    return <React.Fragment>
        <b>{report.location}</b>
        <br/>{report.discharge_site_name}
        <br/>Reporting working: {formatNumber(report.reporting_percent, 2)}%
        <br/>Excuse: {report.excuses}
    </React.Fragment>
}

const ReportingMap = ({url, maxReporting}) => {

    const [ location, setLocation ] = useState()

    const info = location ? <ReportingInfo report={location}/> :
        <React.Fragment>Hover over/Tap on a location</React.Fragment>

    return <Map>
        <LoadingCircles
            url={url}
            style={reportingStyle}
            onSelection={setLocation}
        />
        <Legend>
            <MapLegend colours={reportingColours} max={maxReporting ? maxReporting : 100}>
                Reporting Working Percentage
            </MapLegend>
        </Legend>
        <InfoBox>
            {info}
        </InfoBox>
    </Map>
}


export { ReportingMap, ConstituencyMap, ShellfishMap, BeachMap }