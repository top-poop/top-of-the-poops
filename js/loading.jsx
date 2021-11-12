import * as React from "react";

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    }
  }

  async componentDidMount() {
    const r = await fetch(this.props.url);
    const j = await r.json();
    this.setState({data: j});
  }

  render() {
    const childrenWithData = React.Children.map(this.props.children, child =>
      React.cloneElement(child, {data: this.state.data})
    )

    return <div>{childrenWithData}</div>
  }
}

export {Loading}