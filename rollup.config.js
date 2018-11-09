import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default [
    {
        input: __dirname + '/src/longlist.js',
        plugins: [
            nodeResolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**'
            })
        ],
        external: ['san'],
        output: [
            {
                format: 'umd',
                name: 'LongList',
                file: 'dist/san-long-list.js',
                globals: {
                    san: 'san'
                }
            }
        ]
    },
    {
        input: __dirname + '/src/longlist.js',
        plugins: [
            nodeResolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**'
            }),
            uglify.uglify()
        ],
        external: ['san'],
        output: [
            {
                format: 'umd',
                name: 'LongList',
                file: 'dist/san-long-list.min.js',
                globals: {
                    san: 'san'
                }
            }
        ]
    }
];
