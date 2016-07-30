#!/usr/bin/env node
'use strict';

var path = require('path');
var generate = require('../index');

var args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('Only two arguments allowed:\n\n  litdoc input.md output.html');
} else {
  var markdownPath = path.join(process.cwd(), args[0]);
  var outputPath = path.join(process.cwd(), args[1]);
  console.log('Reading "' + markdownPath + '"...');
  console.log('Writing "' + outputPath + '"...');
  generate({
    markdownPath: markdownPath,
    outputPath: outputPath
  });
  console.log('  ...success!');
}