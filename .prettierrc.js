module.exports = {
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    printWidth: 100,
    overrides: [
      {
        files: '*.wxml',
        options: {
          parser: 'xml',
          xmlWhitespaceSensitivity: 'ignore',
          xmlSelfClosingSpace: true
        }
      }
    ]
  };