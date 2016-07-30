## Introduction

`litdoc` is a simple 3 column documentation generator. The most common use case is a single `README.md`. This file itself is a demo:

* [View orignal Markdown README.md.](https://github.com/zapier/litdoc)
* [View generated HTML documentation.](https://zapier.github.io/litdoc/)


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

Or you can use it directly in your application.

```js
const litdoc = require('litdoc');

const documentationHtml = litdoc({
  markdown: '## Hello!\n\nThis is a sample doc.\n\n' +
            '```js\nconst hello = "world"\n```'
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

* `title` - default `"Documentation"`
* `css` - default `undefined`
* `cssPath` - default `"base.css"` - litdoc provided
* `template` - default `undefined`
* `templatePath` - default `"template.html"` - litdoc provided
* `markdown` - default `undefined`
* `markdownPath` - default `undefined`
* `outputPath` - default `undefined`

> You _must_ provide either `markdown` or `markdownPath`.

```js
const litdoc = require('litdoc');

litdoc({
  title: 'Documentation',
  css: undefined,
  cssPath: 'base.css', // litdoc provided
  template: undefined,
  templatePath: 'template.html', // litdoc provided
  markdown: undefined,
  markdownPath: undefined,
  outputPath: undefined,
});
```
