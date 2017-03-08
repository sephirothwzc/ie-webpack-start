const base  = require('../base/base'),
      files = require('../base/files');

module.exports = (dev) => {
  let Config = {
    //noParse: /jquery|vue/, // 忽略某些查找的库，提高构建速度
    rules: [
      {
        test: /\.jsx$|\.js$/,
        enforce: "pre",
        exclude: [files.staticPath],
        use: ['happypack/loader?id=ES3']
      },
      {
        test: /\.(js|jsx)$/,
        exclude: [],
        include: [files.staticPath],
        use: 'babel-loader'
      },
      {
        test: /\.(js|jsx)$/,
        exclude: [files.staticPath],
        include: [files.viewPath, files.jsPath, files.htmlPath],
        use: ['happypack/loader?id=JSX']
      },
      {
        test: /\.(html)$/,
        include: [files.htmlPath],
        use: ['happypack/loader?id=HTML']
      },
      {
        test: /\.(html)$/,
        exclude: [files.htmlPath],
        use: 'text-loader'
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg)$/,
        include: [files.imgPath, files.viewPath],
        use: ['happypack/loader?id=IMAGE']
      },

      {
        test: /\.(svg|ico|woff|eot|ttf)$/,
        include: [files.fontPath, files.viewPath],
        use: [
          {
            loader: 'url-loader',
            query: {
              limit: 1,
              publicPath: '../../',
              name: 'assets/[name]-[hash:8].[ext]'
            }
          }
        ]
      }
    ]
  };

  /**
   * css
   * 区分开发模式和生产模式，方便无刷新样式开发
   * */

  let cssLoader = {
    loader: 'css-loader',
    query: {
      modules: false,
      outputStyle: 'expanded',
      sourceMap: dev,
      sourceMapContents: dev
    }
  };

  function testLoader(test, loader, path) {
    Config.rules.push({ // 独立CSS文件
      test: test, // 标准的CSS编译
      include: path,
      use: loader ? [
          'style-loader',
          cssLoader,
          loader,
          'postcss-loader'
        ] : [
          'style-loader',
          cssLoader,
          'postcss-loader'
        ]
    })
  }

  function Loader(test, loader, path = [files.viewPath, files.cssPath]) {
    Config.rules.push({ // 独立CSS文件
      test: test, // 标准的CSS编译
      include: path,
      loaders: require('extract-text-webpack-plugin').extract({
        fallback: 'style-loader',
        use: loader ? [cssLoader, loader, 'postcss-loader'] : [cssLoader, 'postcss-loader']
      })
    })
  }

  if (dev) {
    testLoader(/\.(css|pcss)$/, false, [files.viewPath]);
    testLoader(/\.(sass|scss)$/, 'sass-loader', [files.viewPath]);
    testLoader(/\.(less)$/, 'less-loader', [files.viewPath]);
    Loader(/\.(css|pcss)$/, false, [files.cssPath]);
    Loader(/\.(sass|scss)$/, 'sass-loader', [files.cssPath]);
    Loader(/\.(less)$/, 'less-loader', [files.cssPath]);
  } else {

    Loader(/\.(css|pcss)$/, false);
    Loader(/\.(sass|scss)$/, 'sass-loader');
    Loader(/\.(less)$/, 'less-loader');

  }

  return Config;
};