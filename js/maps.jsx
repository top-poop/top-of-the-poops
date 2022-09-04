import {MapContainer, TileLayer, useMap} from "react-leaflet";
import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import ReactDOMServer from 'react-dom/server'
import {Loading} from "./loading";

const Attribution = () => <span>
    Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetmap</a> contributors
    <br/>
    Contains OS data &copy; Crown copyright and database right 2021
</span>

const Tiles = () => {
    const attribution = ReactDOMServer.renderToString(<Attribution/>);
    return <TileLayer
        attribution={attribution}
        url="https://maps.top-of-the-poops.org/styles/v1/{z}/{x}/{y}.png"
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

const Scrolly = () => {
    const map = useMap();

    const [dragging, setDragging] = useState(false);

    useEffect(
        () => {
            map.on("movestart", () => {
                setDragging(true)
            });

            map.on("moveend", () => {
                setDragging(false)
            });

            map.on('focus', function() { map.scrollWheelZoom.enable(); });
            map.on('blur', function() { map.scrollWheelZoom.disable(); });
            map.on('mouseout', () => { map.scrollWheelZoom.disable();});

            map._container.addEventListener("touchmove", (e) => {
                if (dragging) {
                    e.preventDefault()
                }
            })
        },
        [ map ]
    )
    return null;
}

const Map = ({children}) => {
    return <MapContainer
        bounds={ewBounds}
        dragging={!L.Browser.mobile}
        scrollWheelZoom={false}>
        <Tiles/>
        <Scrolly/>
        {children}
    </MapContainer>
}

const Circle = ({item, style, onSelection}) => {

    const map = useMap()

    const circle = L.circleMarker([item.lat, item.lon], style(item));
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
    return <React.Fragment>Use two fingers to move &amp; zoom the map</React.Fragment>
}


export {Map, MapMove, Mobile, LoadingCircles};
