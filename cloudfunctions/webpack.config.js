const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    user: './user/index.ts',
    specialist: './specialist/index.ts',
    device: './device/index.ts',
    system: './system/index.ts'
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@common': path.resolve(__dirname, '../common')
    }
  },
  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, 'dist')
  }
};