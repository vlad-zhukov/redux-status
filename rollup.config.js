import babel from 'rollup-plugin-babel';
import pkg from './package.json';

process.env.NODE_ENV = 'production';

export default {
    entry: './src/index.js',

    plugins: [babel()],

    external: ['react', 'redux', 'react-redux', 'prop-types', 'hoist-non-react-statics'],

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
