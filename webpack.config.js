const path = require('path');

module.exports = {
  entry: './src/index.tsx', // Входная точка
  output: {
    path: path.resolve(__dirname, 'dist'), // Путь для выходного файла
    filename: 'bundle.js', // Имя выходного файла
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // Расширения, которые Webpack будет обрабатывать
    fallback: {
      crypto: require.resolve('crypto-browserify'), // Полифил для crypto
      buffer: require.resolve('buffer'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Обработка TypeScript файлов
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devtool: 'source-map', // Для удобства отладки
  mode: 'development', // Или 'production'
};
