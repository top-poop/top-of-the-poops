

import {TileLayer} from "react-leaflet";
import * as React from "react";
import ReactDOMServer from 'react-dom/server'

const Attribution = () => <span>
    Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetmap</a> contributors
    <br/>
    Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>
    <br/>
    Contains OS data &copy; Crown copyright and database right 2021
</span>

// 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors<br/>Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a> Contains OS data &copy; Crown copyright and database right 2021'

const Tiles = () => {
    const attribution = ReactDOMServer.renderToString(<Attribution/>);
    return <TileLayer
        attribution={attribution}
        url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
        id='mapbox/light-v10'
        accessToken="pk.eyJ1IjoidGltZTR0ZWEiLCJhIjoiY2t2Y2g0aXFsMHl4NzMxcGd3djcyOG1qNCJ9.YCoFgOmL5dqrJ9ZD7ozJKQ"
    />
}

export {Tiles};
