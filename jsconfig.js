module.export = {
  compilerOptions: {
    baseUrl: './',
    paths: {
      '/*': ['./*'],
      'src/*': ['src/*'],
      'assets/*': ['src/assets/*'],
      'common/*': ['src/common/*'],
      'components/*': ['src/components/*'],
      'hooks/*': ['src/hooks/*'],
      'pages/*': ['src/pages/*'],
      'store/*': ['src/store/*'],
      'utils/*': ['src/utils/*']
    },
    experimentalDecorators: true
  },
  exclude: ['node_modules', 'build']
}
