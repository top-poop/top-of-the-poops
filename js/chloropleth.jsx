import {GeoJSON, useMap} from "react-leaflet";
import * as React from "react";
import {useMemo, useRef} from "react";
import {Loading} from "./loading";
import {v4 as uuid} from 'uuid';

const ChloroGeoData = ({data, style, onMouseOverFeature}) => {
    const map = useMap()
    const ref = useRef()
    const id = uuid()

    const mouseOverFeature = (feature) => {
        if (onMouseOverFeature) {
            onMouseOverFeature(feature)
        }
    }

    const onEachFeature = (feature, layer) => {
        layer.on({
            mouseover: e => mouseOverFeature(feature),
            mouseout: e => mouseOverFeature(null)
        })
    }

    return useMemo(() => <GeoJSON key={id}
                                  data={data}
                                  ref={ref}
                                  style={style}
                                  eventHandlers={{
                                      add: () => {
                                          map.fitBounds(ref.current.getBounds())
                                      }
                                  }}
                                  onEachFeature={onEachFeature}
    />, [data, ref, map])
}

const ChloroGeo = ({url, style, onMouseOverFeature}) => {
    return <Loading nullBeforeLoad
                    url={url}
                    render={
                        (data) => <ChloroGeoData
                            data={data}
                            style={style}
                            onMouseOverFeature={onMouseOverFeature}
                        />
                    }/>
}

const Legend = ({children}) => {
    return <div className="legend leaflet-bottom leaflet-left">
        {children}
    </div>
}

const InfoBox = ({children}) => {
    return <div className="info leaflet-top leaflet-right">
        {children}
    </div>
}

export {ChloroGeo, Legend, InfoBox};