import React, {Component} from 'react';
import Async from './Async';
import Picker from '../components/Picker';

export default class App extends Component {
    state = {
        reddit: 'reactjs',
    };

    handleChange = (nextReddit) => {
        this.setState({reddit: nextReddit});
    };

    render() {
        return (
            <div>
                <Picker value={this.state.reddit} onChange={this.handleChange} options={['reactjs', 'frontend']} />
                <Async reddit={this.state.reddit} />
            </div>
        );
    }
}
