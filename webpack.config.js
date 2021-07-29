const HtmlWebpackPlugin = require(`html-webpack-plugin`)
const path = require(`path`)

const electronConfiguration = {
  entry: `./src/main.ts`,
  mode: `development`,
  module: {
    rules: [{
      include: /src/,
      test: /\.ts$/,
      use: [{ loader: `ts-loader` }],
    }],
  },
  output: {
    filename: `main.js`,
    path: __dirname + `/dist`,
  },
  resolve: {
    extensions: [`.ts`, `.js`],
  },
  target: `electron-main`,
}

const preloadConfiguration = {
  entry: `./src/electron/preload.ts`,
  mode: `development`,
  module: {
    rules: [{
      include: /src/,
      test: /\.ts$/,
      use: [{ loader: `ts-loader` }],
    }],
  },
  output: {
    filename: `preload.js`,
    path: __dirname + `/dist`,
  },
  resolve: {
    extensions: [`.ts`, `.js`],
  },
  target: `electron-preload`,
}

const reactConfiguration = {
  devServer: {
    compress: true,
    contentBase: path.join(__dirname, `dist/renderer.js`),
    port: 9000,
  },
  devtool: `source-map`,
  entry: `./src/renderer.tsx`,
  mode: `development`,
  module: {
    rules: [
      {
        include: /src/,
        test: /\.ts(x?)$/,
        use: [{ loader: `ts-loader` }],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          `style-loader`,
          `css-loader`,
          `sass-loader`,
        ],
      },
    ],
  },
  output: {
    filename: `renderer.js`,
    path: __dirname + `/dist`,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: `./src/index.html`,
    }),
  ],
  resolve: {
    extensions: [`.tsx`, `.ts`, `.js`],
  },
  target: `electron-renderer`,
}
module.exports = [
  electronConfiguration,
  preloadConfiguration,
  reactConfiguration,
]