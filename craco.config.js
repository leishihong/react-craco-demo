/* craco.config.js */
/**
 * TODO: 区分环境 —— NODE_ENV
 * - whenDev ☞ process.env.NODE_ENV === 'development'
 * - whenTest ☞ process.env.NODE_ENV === 'test'
 * - whenProd ☞ process.env.NODE_ENV === 'production'
 */
const { when, whenDev, whenProd, whenTest, ESLINT_MODES, POSTCSS_MODES } = require('@craco/craco')
const webpack = require('webpack')
const CracoLessPlugin = require('craco-less')
const CracoAntDesignPlugin = require('craco-antd')
const CracoVtkPlugin = require('craco-vtk')
const WebpackBar = require('webpackbar')
const CircularDependencyPlugin = require('circular-dependency-plugin')
const FastRefreshCracoPlugin = require('craco-fast-refresh')
const TerserPlugin = require('terser-webpack-plugin')
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const DashboardPlugin = require('webpack-dashboard/plugin')
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin')

const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

// 判断编译环境是否为生产
const isBuildAnalyzer = process.env.BUILD_ANALYZER === 'true'

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
    // 别名配置
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
      // webpack构建进度条
      new WebpackBar({ profile: true }),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      // 查看打包的进度
      new SimpleProgressWebpackPlugin(),
      // 时间转换工具采取day替换moment
      new AntdDayjsWebpackPlugin(),
      // // 新增模块循环依赖检测插件
      ...whenDev(
        () => [
          new CircularDependencyPlugin({
            exclude: /node_modules/,
            include: /src/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd()
          }),
          // webpack-dev-server 强化插件
          new DashboardPlugin(),
          new webpack.HotModuleReplacementPlugin()
        ],
        []
      ),
      /**
       * 编译产物分析
       *  - https://www.npmjs.com/package/webpack-bundle-analyzer
       * 新增打包产物分析插件
       */
      ...when(
        isBuildAnalyzer,
        () => [
          new BundleAnalyzerPlugin({
            analyzerMode: 'static', // html 文件方式输出编译分析
            openAnalyzer: false,
            reportFilename: path.resolve(__dirname, `analyzer/index.html`)
          })
        ],
        []
      ),
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
    ],
    //抽离公用模块
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            chunks: 'initial',
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0
          },
          vendor: {
            test: /node_modules/,
            chunks: 'initial',
            name: 'vendor',
            priority: 10,
            enforce: true
          }
        }
      }
    },
    /**
     * 重写 webpack 任意配置
     *  - configure 能够重写 webpack 相关的所有配置，但是，仍然推荐你优先阅读 craco 提供的快捷配置，把解决不了的配置放到 configure 里解决；
     *  - 这里选择配置为函数，与直接定义 configure 对象方式互斥；
     */
    configure: (webpackConfig, { env, paths }) => {
      // paths.appPath='public'
      paths.appBuild = 'dist' // 配合输出打包修改文件目录
      /**
       * 修改 output
       */
      // webpackConfig中可以解构出你想要的参数比如mode、devtool、entry等等，更多信息请查看webpackConfig.json文件
      webpackConfig.output = {
        ...webpackConfig.output,
        // ...{
        //   filename: whenDev(() => 'static/js/bundle.js', 'static/js/[name].js'),
        //   chunkFilename: 'static/js/[name].js'
        // },
        path: path.resolve(__dirname, 'dist'), // 修改输出文件目录
        publicPath: '/'
      }
      /**
       * webpack split chunks
       */
      // webpackConfig.optimization.splitChunks = {
      //   ...webpackConfig.optimization.splitChunks,
      //   ...{
      //     chunks: 'all',
      //     name: true
      //   }
      // }
      // 返回重写后的新配置
      return webpackConfig
    }
  },
  babel: {
    presets: [],
    plugins: [
      // AntDesign 按需加载
      ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }, 'antd'],
      ['@babel/plugin-proposal-decorators', { legacy: true }] // 用来支持装饰器
    ],
    loaderOptions: {},
    loaderOptions: (babelLoaderOptions, { env, paths }) => {
      return babelLoaderOptions
    }
  },
  /**
   * 新增 craco 提供的 plugin
   */
  plugins: [
    // 热更新
    ...whenDev(
      () => [
        {
          plugin: FastRefreshCracoPlugin
        },
        {
          plugin: CracoVtkPlugin()
        },
        {
          plugin: new AntdDayjsWebpackPlugin()
        }
      ],
      []
    ),
    // 方案1、配置Antd主题less
    // {
    //   plugin: CracoLessPlugin,
    //   options: {
    //     lessLoaderOptions: {
    //       lessOptions: {
    //         modifyVars: { '@primary-color': '#1DA57A' },
    //         javascriptEnabled: true
    //       }
    //     }
    //   }
    // },
    // 方案2、配置Antd主题
    // {
    //   plugin: CracoAntDesignPlugin,
    //   options: {
    //     customizeTheme: {
    //       '@primary-color': '#FF061C'
    //     }
    //   }
    // },
    // 方案3、配置Antd主题
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeThemeLessPath: path.join(__dirname, 'antd.customize.less')
      }
    }
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
      '/users': {
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
