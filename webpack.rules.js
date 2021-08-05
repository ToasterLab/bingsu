module.exports = [
  // Add support for native node modules
  {
    test: /\.node$/,
    use: `node-loader`,
  },
  {
    exclude: /(node_modules|\.webpack)/,
    test: /\.tsx?$/,
    use: {
      loader: `ts-loader`,
      options: {
        transpileOnly: true,
      },
    },
  },
]
