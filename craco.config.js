/* craco.config.js */
const { when, whenDev, whenProd, whenTest, ESLINT_MODES, POSTCSS_MODES } = require('@craco/craco')
const CracoLessPlugin = require('craco-less')
// const CracoAntDesignPlugin = require('craco-antd')
const CracoVtkPlugin = require('craco-vtk')
// const ReactHotReloadPlugin = require('craco-plugin-react-hot-reload')
// const TerserPlugin = require('terser-webpack-plugin')
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

const pathResolve = pathUrl => path.join(__dirname, pathUrl)

const getProxyConfig = keys => {
  const proxyConfig = dotenv.parse(fs.readFileSync(path.resolve(__dirname, './proxy.env')))
  for (const key of keys) {
    if (proxyConfig[key]) {
      return proxyConfig[key]
    }
  }
}
const genPathRewriteFunc = (curPath, keys) => {
  return (path, req) => {
    const val = getProxyConfig(keys)
    if (!val) {
      return path
    }
    return path.replace(curPath, val)
  }
}

module.exports = {
  webpack: {
    // 别名
    alias: {
      '@': pathResolve('.'),
      src: pathResolve('src'),
      assets: pathResolve('src/assets'),
      common: pathResolve('src/common'),
      components: pathResolve('src/components'),
      hooks: pathResolve('src/hooks'),
      pages: pathResolve('src/pages'),
      store: pathResolve('src/store'),
      utils: pathResolve('src/utils')
      // 此处是一个示例，实际可根据各自需求配置
    },
    plugins: [
      new AntdDayjsWebpackPlugin(),
      ...whenProd(
        () => [
          // new TerserPlugin({
          //   // sourceMap: true, // Must be set to true if using source-maps in production
          //   terserOptions: {
          //     ecma: undefined,
          //     parse: {},
          //     compress: {
          //       warnings: false,
          //       drop_console: true, // 生产环境下移除控制台所有的内容
          //       drop_debugger: true, // 移除断点
          //       pure_funcs: ['console.log'] // 生产环境下移除console
          //     }
          //   }
          // }),
          // new BundleAnalyzerPlugin(),
          // 打压缩包
          new CompressionWebpackPlugin({
            algorithm: 'gzip',
            test: new RegExp('\\.(' + ['js', 'css'].join('|') + ')$'),
            threshold: 1024,
            minRatio: 0.8
          })
        ],
        []
      )
    ]
  },
  babel: {
    plugins: [
      ['import', { libraryName: 'antd', style: true }],
      ['@babel/plugin-proposal-decorators', { legacy: true }] // 用来支持装饰器
    ]
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#1DA57A' },
            javascriptEnabled: true
          }
        }
      }
    },
    {
      plugin: CracoVtkPlugin()
    },
    {
      plugin: new AntdDayjsWebpackPlugin()
    }
    // {
    //   plugin: reactHotReloadPlugin
    // }
    // { plugin: CracoAntDesignPlugin }
  ],
  devServer: {
    port: 9000,
    proxy: {
      '/api': {
        target: 'https://placeholder.com/',
        changeOrigin: true,
        secure: false,
        xfwd: false,
        pathRewrite: genPathRewriteFunc('/api', ['API_PATH_REWRITE']),
        router: () => getProxyConfig(['API_TARGET', 'TARGET'])
      },
      '/saas': {
        target: 'https://placeholder.com/',
        changeOrigin: true,
        secure: false,
        xfwd: false,
        pathRewrite: genPathRewriteFunc('/sass', ['SASS_PATH_REWRITE']),
        router: () => getProxyConfig(['SASS_TARGET', 'TARGET'])
      }
    }
  }
}
