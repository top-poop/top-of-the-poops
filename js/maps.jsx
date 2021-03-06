import {MapContainer, TileLayer, useMap} from "react-leaflet";
import * as React from "react";
import {useMemo} from "react";
import ReactDOMServer from 'react-dom/server'
import {Loading} from "./loading";

const Attribution = () => <span>
    Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetmap</a> contributors
    <br/>
    Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>
    <br/>
    Contains OS data &copy; Crown copyright and database right 2021
</span>

const Tiles = () => {
    const attribution = ReactDOMServer.renderToString(<Attribution/>);
    return <TileLayer
        attribution={attribution}
        tileSize={512}
        zoomOffset={-1}
        url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
        id='time4tea/cl1rst81z002814mv6pxjvytb'
        accessToken="pk.eyJ1IjoidGltZTR0ZWEiLCJhIjoiY2t2Y2g0aXFsMHl4NzMxcGd3djcyOG1qNCJ9.YCoFgOmL5dqrJ9ZD7ozJKQ"
    />
}

const Debug = () => {

    const map = useMap()

    map.on("move", (e) => console.log(`Location: ${JSON.stringify(map.getBounds())} Zoom: ${map.getZoom()}`))

    return null;
}

const ewBounds = [
    [49.95121990866204, -5.7788],
    [56.0474995832989, 1.7138671875000002]
]

const Map = ({children}) => {
    return <MapContainer
        bounds={ewBounds}
        dragging={!L.Browser.mobile}
        scrollWheelZoom={true}>
        <Tiles/>
        {children}
    </MapContainer>
}

const Circle = ({item, style, onSelection}) => {

    const map = useMap()

    const circle = L.circle([item.lat, item.lon], style(item));
    if (onSelection) {
        circle.on({
            mouseover: () => onSelection(item),
            mouseout: () => onSelection(null)
        })
    }
    circle.addTo(map)
    return null
}

const Circles = ({data, style, onSelection}) => {
    return useMemo(() => <React.Fragment>
        {data.map(it => <Circle key={`item-${it.id}`} item={it} style={style} onSelection={onSelection}/>)}
    </React.Fragment>, [data])
}

const LoadingCircles = ({url, style, onSelection}) => {
    return <Loading nullBeforeLoad
                    url={url}
                    render={(data) => <Circles data={data} style={style} onSelection={onSelection}/>}
    />
}

const Mobile = ({children}) => {
    if (L.Browser.mobile) {
        return children
    }
    return null;
}

const MapMove = () => {
    return <p>Use two fingers to move &amp; zoom the map</p>
}


export {Map, MapMove, Mobile, LoadingCircles};
