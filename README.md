## Introduction

`litdoc` is a simple 3 column documentation generator. The most common use case is a single `README.md`. This file itself is a demo:

* [View original Markdown README.md.](https://github.com/zapier/litdoc)
* [View generated HTML documentation.](http://litdoc.org/)


## Installation & Usage

There are two ways to use `litdoc`, locally and globally.


### Local Installation & Usage

If you only need `litdoc` for your current project, we recommend a local installation via `npm`.

```bash
$ npm install litdoc --save-dev
```

You can use it as a CLI tool.

```bash
$ ./node_modules/.bin/litdoc input.md output.html
```

Or you can use it directly in your application, generating the HTML inline.

```js
var litdoc = require('litdoc');

// generate the HTML inline
var documentationHtml = litdoc({
  markdown: '## Hello!\n\nThis is a sample doc.\n\n' +
            '```js\nvar hello = "world"\n```'
});
```

Or, you can optionally read/write to specific paths.

```js
var litdoc = require('litdoc');
var path = require('path');

// reads a markdown file and writes an HTML file
litdoc({
  markdownPath: path.join(__dirname, '../README.md'),
  outputPath: path.join(__dirname, '../index.html')
});
```


### Global Installation & Usage

If you'd prefer to make `litdoc` available across all your projects, you can install it locally with `npm`.

```bash
$ npm install -g litdoc
```

You can use it as a CLI tool from anyplace on your machine.

```bash
$ litdoc input.md output.html
```


## Reference

Below is the reference for the only function `litdoc` exposes.

### litdoc()

* `title` - default `'Documentation'`
* `markdown` - default `undefined` - overrides `markdownPath`
* `markdownPath` - default `undefined`
* `css` - default `undefined` - overrides `cssPath`
* `cssPath` - default `'assets/base.css'` - litdoc provided
* `template` - default `undefined` - overrides `templatePath`
 * this is neat
* `templatePath` - default `'templates/index.html'` - litdoc provided
* `outputPath` - default `undefined`

> You _must_ provide either `markdown` or `markdownPath`.

```js
var litdoc = require('litdoc');

litdoc({
  title: 'Documentation',
  markdown: undefined,
  markdownPath: undefined,
  css: undefined,
  cssPath: 'assets/base.css', // litdoc provided
  template: undefined,
  templatePath: 'templates/index.html', // litdoc provided
  outputPath: undefined,
});
```
