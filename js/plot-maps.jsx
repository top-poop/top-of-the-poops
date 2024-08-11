import {Loading} from "./loading";
import * as React from "react";
import {Plot} from "./plot";
import {formatNumber} from "./text";

const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)


const GeoSpillsMap = ({company}) => {
    const optionsFn = (Plot, data) => {

        if ( company != null ) {
            data = data.filter(d => d["company_name"] == company)
        }

        return {
            projection: {
                type: "mercator",
                domain: {
                    type: "MultiPoint",
                    coordinates: [[-6, 49.9], [1.8, 58.9]],
                },
            },
            width: 1000,
            height: 1400,
            r: {range: [1, 15], domain: [0, 7000]},
            marks: [
                Plot.dot(
                    data,
                    {
                        x: "lon",
                        y: "lat",
                        r: (d) =>  d['reporting_percent'] == 0.0 ? 1000 : d['total_spill_hours'],
                        fill: "company_name",
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

const GeoConstituencyMap = () => {

    const optionsFn = (Plot, data) => {
        return {
            projection: {
                type: "mercator",
                domain: {
                    type: "MultiPoint",
                    coordinates: [[-6,49.9],[1.8,55.9]],
                },
            },
            height: 800,
            color: {
                // legend: true,
                scheme: "reds",
            },
            marks: [
                Plot.geo(data, {
                    fill: d=> d.properties.total_hours,
                    title: d => `${d.properties.name}: ${formatNumber(d.properties.total_hours)} hours of sewage`,
                    stroke: "black",
                    strokeOpacity: 0.5,
                }),
            ]
        }
    }

    return <Loading
        url="data/generated/chloropleth/chloro.json"
        nullBeforeLoad
        render={data => <Plot data={data} options={optionsFn}/>}
    />
}

export {GeoSpillsMap, GeoConstituencyMap}