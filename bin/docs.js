#!/usr/bin/env node
var path = require('path');
var litdoc = require('../index');
litdoc({
  title: 'litdoc Documentation & Demo',
  markdownPath: path.join(__dirname, '../README.md'),
  outputPath: path.join(__dirname, '../index.html')
});
