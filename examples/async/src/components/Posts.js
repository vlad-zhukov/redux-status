import React from 'react';
import PropTypes from 'prop-types';

const Posts = ({posts}) =>
    (<ul>
        {posts.map(post => <li key={post.title.substring(0, 10)}>{post.title}</li>)}
    </ul>);

Posts.propTypes = {
    posts: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Posts;
