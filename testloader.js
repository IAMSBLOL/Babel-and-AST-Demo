const generate = require('@babel/generator').default;
const fs = require('fs')
// const parser = require('@babel/parser')
const babel = require('@babel/core');
const injectCaller = require('./testBabelFile');
const types = require('@babel/types')
const template = require('@babel/template').default;

const traverse = require('@babel/traverse').default

// const { promisify } = require('util');

const transform = babel.parseAsync

module.exports = async function (content, inputSourceMap, meta) {
  const filename = this.resourcePath;
  let loaderOptions = this.getOptions()

  if (
    Object.prototype.hasOwnProperty.call(loaderOptions, 'sourceMap') &&
        !Object.prototype.hasOwnProperty.call(loaderOptions, 'sourceMaps')
  ) {
    loaderOptions = Object.assign({}, loaderOptions, {
      sourceMaps: loaderOptions.sourceMap,
    });
    delete loaderOptions.sourceMap;
  }

  const programmaticOptions = Object.assign({}, loaderOptions, {
    filename,
    inputSourceMap: inputSourceMap || undefined,

    sourceMaps:
            loaderOptions.sourceMaps === undefined
              ? this.sourceMap
              : loaderOptions.sourceMaps,

    sourceFileName: filename,
  });

  delete programmaticOptions.customize;
  delete programmaticOptions.cacheDirectory;
  delete programmaticOptions.cacheIdentifier;
  delete programmaticOptions.cacheCompression;
  delete programmaticOptions.metadataSubscribers;

  if (!babel.loadPartialConfig) {
    throw new Error(
      'babel-loader ^8.0.0-beta.3 requires @babel/core@7.0.0-beta.41, but ' +
            `you appear to be using "${babel.version}". Either update your ` +
            '@babel/core version, or pin you babel-loader version to 8.0.0-beta.2',
    );
  }

  // babel.loadPartialConfigAsync is available in v7.8.0+
  const { loadPartialConfigAsync = babel.loadPartialConfig } = babel;
  const config = await loadPartialConfigAsync(
    injectCaller(programmaticOptions, this.target),
  );

  const result = await transform(content, config.options)

  let traceValue = null
  let traceHandle = null
  traverse(result, {

    JSXOpeningElement (path) {
      const isTrace = path.get('attributes')

      for (const o of isTrace) {
        if (o.node.name.name === '$trace') {
          traceValue = o.node.value.value

          for (const so of isTrace) {
            if (so.node.name.name === 'onClick') {
              traceHandle = so.node.value.expression.name
              console.log(traceValue, traceHandle)

              traverse(result, {
                enter (epath) {
                  if (epath.isVariableDeclarator()) {
                    if (epath.node.id.name === traceHandle) {
                      //  generate(epath.node, {}).code
                      // JSON.stringify(epath.node, null, 2)
                      const buildRequire = template(`console.log(%%traceValue%%);`);

                      const ast = buildRequire({
                        traceValue: `'${traceValue}'`,
            
                      });
                      console.log(generate(ast).code);
                    
                      epath.node.init.body = ast
                      fs.writeFile('./message.js', generate(epath.node, {}).code, (err) => {
                        if (err) throw err;
                      });
                    }
                  }
                },

              })
            }
          }
          o.remove()
        }
      }
    },

  });

  traceValue = null
  traceHandle = null
  return generate(result, {}).code
};
