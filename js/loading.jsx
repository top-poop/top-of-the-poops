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

        return <React.Fragment>{this.props.render(this.state.data)}</React.Fragment>
    }
}

export {Loading}