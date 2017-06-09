process.env.NODE_ENV = 'development';

const babel = require('rollup-plugin-babel');
const pkg = require('./package.json');

export default {
    entry: './src/index.js',

    plugins: [babel()],

    external: ['react', 'redux', 'react-redux', 'prop-types'],

    targets: [
        {
            dest: pkg.main,
            format: 'cjs',
            sourceMap: true,
        },
        {
            dest: pkg.module,
            format: 'es',
            sourceMap: true,
        },
    ],
};
