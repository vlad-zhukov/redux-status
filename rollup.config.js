import babel from 'rollup-plugin-babel';
import {list as babelHelpersList} from 'babel-helpers'; // eslint-disable-line
import pkg from './package.json';

const externalHelpersWhitelist = babelHelpersList.filter(helperName => helperName !== 'asyncGenerator');

export default {
    input: './src/index.js',
    plugins: [babel({externalHelpersWhitelist})],
    external: Object.keys(pkg.dependencies).concat(Object.keys(pkg.peerDependencies)),
    sourcemap: true,
    output: [
        {
            file: pkg.main,
            format: 'cjs',
        },
        {
            file: pkg.module,
            format: 'es',
        },
    ],
};
