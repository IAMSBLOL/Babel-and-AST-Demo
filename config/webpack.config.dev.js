const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');
const paths = require('./config-utils/path');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
// const fs = require('fs')
process.env.NODE_ENV = process.env.ENV = 'development';

const baseConfigFn = require('./webpack.config.base');

const baseConfig = baseConfigFn('development')

const webpackDevClientEntry = require.resolve(
  'react-dev-utils/webpackHotDevClient'
);
const reactRefreshOverlayEntry = require.resolve(
  'react-dev-utils/refreshOverlayInterop'
);

const devConfig = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  output: {
    path: paths.appBuild,
    // bundle
    filename: 'static/js/bundle.js',
    // 块
    chunkFilename: 'static/js/[name].chunk.js',
    devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },

  // optimization: {
  //   // 不压缩
  //   minimize: false,
  //   //
  //   splitChunks: {
  //     chunks: 'all',
  //     name: false,
  //   },
  //   runtimeChunk: {
  //     name: (entrypoint) => `runtime~${entrypoint.name}`,
  //   },

  // },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    // 热更新 关闭的话注意注释babel配置的热更新垫片
    new ReactRefreshWebpackPlugin({
      overlay: {
        entry: webpackDevClientEntry,
        // The expected exports are slightly different from what the overlay exports,
        // so an interop is included here to enable feedback on module-level errors.
        module: reactRefreshOverlayEntry,
        // Since we ship a custom dev client and overlay integration,
        // the bundled socket handling logic can be eliminated.
        sockIntegration: false,
      },
    }),
  ],
};
const mergeDevConfig = merge(baseConfig, devConfig);

// 如果你怀疑自己的配置有问题，可以搞出来看看
// fs.writeFile('message.js', JSON.stringify(mergeDevConfig), { }, (err) => {
//   console.log(err)
// });
module.exports = mergeDevConfig
