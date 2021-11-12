import * as React from 'react';
import ReactDOM from 'react-dom';
import {Loading} from "./loading";
import {Col, Row} from "react-bootstrap";
import {ForkMeHero, TitleHero} from "./heroes";

const What = ({data}) => {
  return <Row>
    <Col>
      <p>Yo {data.length} </p>
    </Col>
    <Col>
      <p>Yo</p>
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
