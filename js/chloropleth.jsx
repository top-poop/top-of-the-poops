import {GeoJSON, useMap} from "react-leaflet";
import * as React from "react";
import {useRef} from "react";
import {Loading} from "./loading";
import ReactDOMServer from 'react-dom/server'
import { v4 as uuid } from 'uuid';

const ChloroGeo = ({url, style}) => {
    const map = useMap()
    const ref = useRef()
    const id = uuid()

    return <Loading nullBeforeLoad url={url}>
        <GeoJSON key={id}
                 ref={ref}
                 style={style}
                 eventHandlers={{
                     add: () => {
                         map.fitBounds(ref.current.getBounds())
                     }
                 }}/>
    </Loading>
}

const Legend = ({content}) => {
    const map = useMap()

    const legend = L.control({position: "topright"});

    legend.onAdd = () => {
        const div = L.DomUtil.create("div", "info legend");
        div.innerHTML = ReactDOMServer.renderToString(content)
        return div
    }

    legend.addTo(map);

    return null;
}


export {ChloroGeo, Legend};