import * as React from 'react';
import ReactDOM from 'react-dom';
import {Loading} from "./loading";
import {Col, Row} from "react-bootstrap";
import {ForkMeHero, TitleHero} from "./heroes";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const What = ({data}) => {

  const constituencies = new Set(data.map( it => it.constituency))

  return <Row>
    <Col>
      <MapContainer center={[51.505, -0.09]} zoom={18} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
          id='mapbox/outdoors-v10'
          accessToken="pk.eyJ1IjoidGltZTR0ZWEiLCJhIjoiY2t2Y2g0aXFsMHl4NzMxcGd3djcyOG1qNCJ9.YCoFgOmL5dqrJ9ZD7ozJKQ"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </Col>
    <Col>
      <p>Yo {data.length}</p>
    </Col>
  </Row>
}

const MapApp = () => {
  return <div>
    <TitleHero/>
    <ForkMeHero/>
    <Loading url="data/generated/spills-all.json">
      <What/>
    </Loading>
  </div>

}

ReactDOM.render(<MapApp/>, document.getElementById('root'));
