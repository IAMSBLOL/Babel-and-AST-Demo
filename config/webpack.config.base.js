const paths = require('./config-utils/path');
const getClientEnvironment = require('./config-utils/env');
const fs = require('fs');
const resolve = require('resolve');
const path = require('path')
const webpack = require('webpack');
// const modules = require('./config-utils/modules');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const babelOptions = require(paths.appBabelrc)

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

const useTypeScript = fs.existsSync(paths.appTsConfig);

const reactRefreshOverlayEntry = require.resolve(
  'react-dev-utils/refreshOverlayInterop'
);

// const babelrc = fs.readFileSync();

module.exports = function (webpackEnv) {
  const isEnvProduction = webpackEnv === 'production';
  const isEnvDevelopment = webpackEnv === 'development';

  const CSS_MODULE_LOCAL_IDENT_NAME = '[local]___[hash:base64:5]';

  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        options: paths.publicUrlOrPath.startsWith('.')
          ? { publicPath: '../../' }
          : {},
      },
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        loader: require.resolve('postcss-loader'),
      },
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push(
        {
          loader: require.resolve('resolve-url-loader'),
          options: {
            sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
            root: paths.appSrc,
          },
        },
        {
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: true,
            lessOptions: {
              javascriptEnabled: true
            }
          },
        }
      );
    }
    return loaders;
  };

  return {
    // context: paths.appPath,
    entry: [
      paths.appIndexJs,
    ],
    output: {
      pathinfo: true,
      publicPath: paths.publicUrlOrPath,
      // fix: allow globalObject to be expression
      // https://github.com/webpack/webpack/pull/12927
      // https://github.com/webpack/webpack/issues/12924
      globalObject: '(typeof self !== \'undefined\' ? self : this)',
      // webpack 5 废弃
      // jsonpFunction: `webpackJsonp${appPackageJson.name}`,
    },
    bail: isEnvProduction,
    resolve: {
      alias: {

        '@src': paths.appSrc,
      },

      extensions: paths.moduleFileExtensions
        .map(ext => `.${ext}`)
        .filter(ext => useTypeScript || !ext.includes('ts')),

      modules: ['node_modules', paths.appNodeModules],
      plugins: [
        PnpWebpackPlugin,
        // 就是为了防止用户引入src目录之外的文件导致不可预期的结果。因为babel都是通过src目录内文件进行入口转义的
        new ModuleScopePlugin(paths.appSrc, [
          paths.appPackageJson,
          reactRefreshOverlayEntry,
        ]),

      ],
    },
    module: {
      strictExportPresence: true,
      rules: [
        // { parser: { requireEnsure: false } },
        {
          oneOf: [
            // css 就不搞模块化了吧，没这个必要？
            {
              test: /\.css$/,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction
                  ? shouldUseSourceMap
                  : isEnvDevelopment,
              }),
              sideEffects: true,
            },
            {
              test: /\.module\.less$/,

              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction
                    ? shouldUseSourceMap
                    : isEnvDevelopment,
                  modules: {
                    localIdentName: CSS_MODULE_LOCAL_IDENT_NAME,
                  },
                },
                'less-loader'
              ),
            },
            {
              test: /\.less$/,
              exclude: [
                /\.module\.less$/,
              ],
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction
                    ? shouldUseSourceMap
                    : isEnvDevelopment,
                },
                'less-loader'
              ),
              sideEffects: true,
            },
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: paths.appSrc,

              use: [

                {
                  loader: require.resolve('babel-loader'),
                  options: {
                    ...babelOptions,
                    cacheDirectory: true,
                    // See #6846 for context on why cacheCompression is disabled
                    cacheCompression: false,
                    compact: isEnvProduction,

                  },
                },
                {
                  loader: require.resolve('../testloader.js'),
                  options: {
                    ...babelOptions,
                    // cacheDirectory: true,
                    // See #6846 for context on why cacheCompression is disabled
                    // cacheCompression: false,
                    compact: isEnvProduction,

                  },
                },
              ]
            },
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('babel-preset-react-app/dependencies'),
                    { helpers: true },
                  ],
                ],
                cacheDirectory: true,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,

                // Babel sourcemaps are needed for debugging into node_modules
                // code.  Without the options below, debuggers like VSCode
                // show incorrect code and set breakpoints on the wrong lines.
                sourceMaps: shouldUseSourceMap,
                inputSourceMap: shouldUseSourceMap,
              },
            },
            {
              test: [/\.avif$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: '10000',
                mimetype: 'image/avif',
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: '10000',
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            {
              loader: require.resolve('file-loader'),
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
          ]
        }
      ]
    },
    plugins: [
      new NodePolyfillPlugin(),
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml,
          },
          isEnvProduction
            ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              },
            }
            : undefined
        )
      ),

      new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: paths.publicUrlOrPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          const entrypointFiles = entrypoints.main.filter(
            fileName => !fileName.endsWith('.map')
          );

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      }),
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
      new webpack.DefinePlugin(env.stringified),
      new ESLintPlugin({
        // Plugin options
        extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
        formatter: require.resolve('react-dev-utils/eslintFormatter'),
        eslintPath: require.resolve('eslint'),
        failOnError: true,
        context: paths.appSrc,
        cache: true,
        cacheLocation: path.resolve(
          paths.appNodeModules,
          '.cache/.eslintcache'
        ),
        // ESLint class options
        cwd: paths.appPath,
        resolvePluginsRelativeTo: __dirname,
        baseConfig: {
          extends: [paths.appEslintlrc],
        },
      }),
      new ForkTsCheckerWebpackPlugin({
        typescript: resolve.sync('typescript', {
          basedir: paths.appNodeModules,
        }),
        // 开发环境是否同步ts错误阻塞
        // 花了时间但是确保开发时一定没人提交错误的代码---目前时异步的，一般来说不会出啥问题吧
        // async: isEnvDevelopment,
        async: false,
        checkSyntacticErrors: true,
        resolveModuleNameModule: process.versions.pnp
          // eslint-disable-next-line node/no-path-concat
          ? `${__dirname}/pnpTs.js`
          : undefined,
        resolveTypeReferenceDirectiveModule: process.versions.pnp
          // eslint-disable-next-line node/no-path-concat
          ? `${__dirname}/pnpTs.js`
          : undefined,
        tsconfig: paths.appTsConfig,
        reportFiles: [
          // This one is specifically to match during CI tests,
          // as micromatch doesn't match
          // '../cra-template-typescript/template/src/App.tsx'
          // otherwise.
          '../**/src/**/*.{ts,tsx}',
          '**/src/**/*.{ts,tsx}',
          '!**/src/**/__tests__/**',
          '!**/src/**/?(*.)(spec|test).*',
          '!**/src/setupProxy.*',
          '!**/src/setupTests.*',
        ],
        silent: true,
        // The formatter is invoked directly in WebpackDevServerUtils during development
        formatter: isEnvProduction ? typescriptFormatter : undefined,
      }),
    ]
  };
}
