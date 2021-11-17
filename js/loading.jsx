import * as React from "react";

class Loading extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loaded: false
        }
    }

    async componentDidMount() {
        await this.loadUrl();
    }

    async loadUrl() {
        const r = await fetch(this.props.url);
        const j = await r.json();
        console.log(`loaded ${this.props.url}`)
        this.setState({loaded: true, data: j});
    }

    async componentDidUpdate(prevProps) {
        if (this.props.url !== prevProps.url) {
            console.log(`loading ${this.props.url}`)
            this.setState({loaded: false})
            await this.loadUrl();
        }
    }

    render() {
        if (!this.state.loaded && this.props.nullBeforeLoad) {
            return null
        }

        const childrenWithData = React.Children.map(this.props.children, child =>
            React.cloneElement(child, {data: this.state.data})
        )

        return <React.Fragment>{childrenWithData}</React.Fragment>
    }
}

export {Loading}