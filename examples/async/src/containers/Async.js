import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {reduxStatusAsync, propTypes} from 'redux-status';
import Posts from '../components/Posts';

class Async extends PureComponent {
    static propTypes = {
        reddit: PropTypes.string.isRequired,
        status: PropTypes.objectOf(propTypes.promiseState).isRequired,
        refresh: PropTypes.func.isRequired,
    };

    renderPosts = () => {
        const {reddit, status} = this.props;
        const {value, pending, refreshing} = status[reddit];
        const isLoading = pending || refreshing;

        if (!value) {
            return isLoading ? <h2>Loading...</h2> : <h2>Empty.</h2>;
        }
        return (
            <div style={{opacity: isLoading ? 0.5 : 1}}>
                <Posts posts={value} />
            </div>
        );
    };

    render() {
        const {reddit, status, refresh} = this.props;
        const {pending, refreshing, lastUpdated} = status[reddit];
        return (
            <div>
                <p>
                    {lastUpdated &&
                        <span>
                            Last updated at {new Date(lastUpdated).toLocaleTimeString()}.{' '}
                        </span>}
                    {!pending && !refreshing && <button onClick={refresh}>Refresh</button>}
                </p>
                {this.renderPosts()}
            </div>
        );
    }
}

export default reduxStatusAsync({
    name: 'Async',
    values: props => ({
        [props.reddit]: {
            args: [props.reddit],
            promise: reddit =>
                fetch(`https://www.reddit.com/r/${reddit}.json`).then(res => res.json()).then(res => res.data.children),
            maxAge: 10000,
            maxArgs: 1,
        },
    }),
})(Async);
