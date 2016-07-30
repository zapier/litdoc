#!/usr/bin/env node
const path = require('path');
const generate = require('../index');
generate({
  title: 'litdoc Documentation & Demo',
  markdownPath: path.join(__dirname, '../README.md'),
  outputPath: path.join(__dirname, '../index.html')
});
