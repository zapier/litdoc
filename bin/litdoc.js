#!/usr/bin/env node
const path = require('path');
const generate = require('../index');

const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('Only two arguments allowed:\n\n  litdoc input.md output.html');
} else {
  const markdownPath = path.join(process.cwd(), args[0]);
  const outputPath = path.join(process.cwd(), args[1]);
  console.log(`Reading "${markdownPath}"...`);
  console.log(`Writing "${outputPath}"...`);
  generate({
    markdownPath: markdownPath,
    outputPath: outputPath
  });
  console.log('  ...success!');
}
