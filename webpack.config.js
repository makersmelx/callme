const path = require('path');

const ROOT_PATH = path.resolve(__dirname);
const SRC_PATH = path.resolve(ROOT_PATH, 'src');
const DIST_PATH = path.join(__dirname, 'dist');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: path.join(SRC_PATH, 'main.js'),
  mode: isProduction ? 'production' : 'development',
  target: 'node',
  devServer: {
    compress: true,
    port: 8000,
    hot: true,
    contentBase: false,
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        // For node binary relocations, include ".node" files as well here
        test: /\.(m?js|node)$/,
        // it is recommended for Node builds to turn off AMD support
        parser: { amd: false },
        use: {
          loader: '@vercel/webpack-asset-relocator-loader',
          options: {
            // optional, base folder for asset emission (eg assets/name.ext)
            outputAssetBase: 'assets',
            // optional, restrict asset emissions to only the given folder.
            filterAssetBase: process.cwd(),
            // optional, permit entire __dirname emission
            // eg `const nonAnalyzable = __dirname` can emit everything in the folder
            emitDirnameAll: false,
            // optional, permit entire filterAssetBase emission
            // eg `const nonAnalyzable = process.cwd()` can emit everything in the cwd()
            emitFilterAssetBaseAll: false,
            // optional, custom functional asset emitter
            // takes an asset path and returns the replacement
            // or returns false to skip emission
            // eslint-disable-next-line no-shadow,no-unused-vars,no-bitwise
            customEmit: (path, { id, isRequire }) => false
              | './ssmlAudio/*',
            // optional, a list of asset names already emitted or
            // defined that should not be emitted
            existingAssetNames: [],
            wrapperCompatibility: false, // optional, default
            // build for process.env.NODE_ENV = 'production'
            production: isProduction, // optional, default is undefined
            cwd: process.cwd(), // optional, default
            debugLog: false, // optional, default
          },
        },
      },
    ],
  },
  output: {
    filename: 'main.js',
    path: DIST_PATH,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: [SRC_PATH, 'node_modules'],
  },
};
