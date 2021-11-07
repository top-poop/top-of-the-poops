// https://github.com/iddan/plot-react/blob/main/src/PlotFigure.tsx
import React, {useEffect, useRef} from "react";
import * as ohqPlot from "@observablehq/plot";

const Plot = ({options}) => {
  const ref = useRef(null);

  useEffect(() => {
    const plot = ohqPlot.plot(options);
    if (ref.current) {
      if (ref.current.children[0]) {
        ref.current.children[0].remove();
      }
      ref.current.appendChild(plot);
    }
  }, [ref, options]);

  return <div ref={ref}/>;
};

class LoadingPlot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
    }
  }

  async componentDidMount() {
    const r = await fetch(this.props.url);
    const j = await r.json();
    this.setState({data: j});
  }

  render() {
    if (this.state.data == null) {
      return <div>{this.props.children}</div>
    } else {
      return <Plot options={this.props.options(ohqPlot, this.state.data)}/>
    }
  }
}


export { Plot, LoadingPlot };