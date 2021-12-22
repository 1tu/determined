import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: './src/index.ts',

	output: {
		file: './dist/index.js',
		format: 'umd',
		name: 'determined'
	},

	// prettier-ignore
	plugins: [
		// commonjs(),
		nodeResolve({ browser: true }),
		// eslint(),
		typescript()
	]
};
