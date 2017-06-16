import {selectors} from 'redux-status';

const fetchPosts = (reddit, setStatus) => () => {
    setStatus(s => ({
        [reddit]: {
            ...s[reddit],
            isFetching: true,
            didInvalidate: false,
        },
    }));
    return fetch(`https://www.reddit.com/r/${reddit}.json`).then(response => response.json()).then((json) => {
        setStatus(s => ({
            [reddit]: {
                ...s[reddit],
                isFetching: false,
                didInvalidate: false,
                posts: json.data.children.map(child => child.data),
                lastUpdated: Date.now(),
            },
        }));
    });
};

const shouldFetchPosts = (status) => {
    const reddit = status[status.selectedReddit];

    if (!reddit) {
        return true;
    }
    if (reddit.isFetching) {
        return false;
    }
    return reddit.didInvalidate;
};

// eslint-disable-next-line consistent-return, import/prefer-default-export
export const fetchPostsIfNeeded = setStatus => (dispatch, getState) => {
    const status = selectors.getStatusValue('AsyncApp')(getState());
    if (shouldFetchPosts(status)) {
        return dispatch(fetchPosts(status.selectedReddit, setStatus));
    }
};
