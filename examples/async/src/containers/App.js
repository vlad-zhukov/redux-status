import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {reduxStatus} from 'redux-status';
import {fetchPostsIfNeeded} from '../actions';
import Picker from '../components/Picker';
import Posts from '../components/Posts';

class App extends Component {
    static propTypes = {
        status: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
        setStatus: PropTypes.func.isRequired,
        dispatch: PropTypes.func.isRequired,
    };

    componentDidMount() {
        const {dispatch, setStatus} = this.props;
        dispatch(fetchPostsIfNeeded(setStatus));
    }

    componentWillReceiveProps(nextProps) {
        const {dispatch, status, setStatus} = nextProps;
        if (status.selectedReddit !== this.props.status.selectedReddit) {
            dispatch(fetchPostsIfNeeded(setStatus));
        }
    }

    handleChange = (nextReddit) => {
        this.props.setStatus({selectedReddit: nextReddit});
    };

    handleRefreshClick = (e) => {
        e.preventDefault();

        const {dispatch, setStatus} = this.props;
        setStatus(s => ({
            [s.selectedReddit]: {...s[s.selectedReddit], didInvalidate: true},
        }));
        dispatch(fetchPostsIfNeeded(setStatus));
    };

    renderPosts = () => {
        const {status} = this.props;
        const {posts, isFetching} = status[status.selectedReddit] || {};

        const isEmpty = !posts || (posts && posts.length === 0);

        if (isEmpty) {
            return isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>;
        }
        return (
            <div style={{opacity: isFetching ? 0.5 : 1}}>
                <Posts posts={posts} />
            </div>
        );
    };

    render() {
        const {status} = this.props;
        const {isFetching, lastUpdated} = status[status.selectedReddit] || {};
        return (
            <div>
                <Picker value={status.selectedReddit} onChange={this.handleChange} options={['reactjs', 'frontend']} />
                <p>
                    {lastUpdated &&
                        <span>
                            Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
                            {' '}
                        </span>}
                    {!isFetching &&
                        <button onClick={this.handleRefreshClick}>
                            Refresh
                        </button>}
                </p>
                {this.renderPosts()}
            </div>
        );
    }
}

export default reduxStatus({
    name: 'AsyncApp',
    initialValues: {
        selectedReddit: 'reactjs',
    },
})(App);
