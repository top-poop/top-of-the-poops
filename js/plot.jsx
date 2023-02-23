// https://github.com/iddan/plot-react/blob/main/src/PlotFigure.tsx
import React, {useEffect, useRef} from "react";
import * as ohqPlot from "@observablehq/plot";

const PrivatePlot = ({options}) => {
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

  return <div className="observable-plot-container" ref={ref}/>;
};

class LoadingPlot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      data: null,
    }
  }

  async componentDidUpdate(prevProps) {
    if ( prevProps.url !== this.props.url) {
      this.setState({loaded: false, data: null})
      const r = await fetch(this.props.url);
      const j = await r.json();
      this.setState({loaded: true, data: j});
    }
  }

  async componentDidMount() {
    const r = await fetch(this.props.url);
    const j = await r.json();
    this.setState({loaded: true, data: j});
  }

  render() {
    if (! this.state.loaded) {
      return <div style={{height: 500}}></div>
    } else {
      return <PrivatePlot options={this.props.options(ohqPlot, this.state.data)}/>
    }
  }
}

const Plot = ({options, data}) => {
  if ( data != null ) {
    return <PrivatePlot options={options(ohqPlot, data)}/>
  }
  return null;
}


export { Plot, LoadingPlot };