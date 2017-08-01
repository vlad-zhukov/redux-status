import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {reduxStatus, propTypes} from 'redux-status';
import Picker from '../components/Picker';
import Posts from '../components/Posts';

class App extends Component {
    static propTypes = {
        status: PropTypes.shape({
            reddit: PropTypes.string,
            reactjs: PropTypes.shape(propTypes.promiseState),
            frontend: PropTypes.shape(propTypes.promiseState),
        }).isRequired,
        setStatus: PropTypes.func.isRequired,
        refresh: PropTypes.func.isRequired,
    };

    constructor(props, context) {
        super(props, context);

        this.handleChange = (nextReddit) => {
            this.props.setStatus({reddit: nextReddit});
        };
    }

    render() {
        const {status, refresh} = this.props;
        const {pending, refreshing, value, lastUpdated} = status[status.reddit];
        const isFetching = pending || refreshing;

        return (
            <div>
                <Picker
                    value={this.props.status.reddit}
                    onChange={this.handleChange}
                    options={['reactjs', 'frontend']}
                />
                <p>
                    {lastUpdated &&
                        <span>
                            Last updated at {new Date(lastUpdated).toLocaleTimeString()}.{' '}
                        </span>}
                    {!isFetching && <button onClick={refresh}>Refresh</button>}
                </p>
                {!value // eslint-disable-line no-nested-ternary
                    ? isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>
                    : <div style={{opacity: isFetching ? 0.5 : 1}}>
                        <Posts posts={value} />
                    </div>}
            </div>
        );
    }
}

export default reduxStatus({
    name: 'Async',
    initialValues: {
        reddit: 'reactjs',
    },
    asyncValues: props => ({
        [props.status.reddit]: {
            args: [props.status.reddit],
            promise: reddit =>
                fetch(`https://www.reddit.com/r/${reddit}.json`).then(res => res.json()).then(res => res.data.children),
            maxAge: 10000,
            maxArgs: 1,
        },
    }),
})(App);
