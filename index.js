'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('lodash');

const marked = require('marked');
const toc = require('markdown-toc');
const cheerio = require('cheerio');
const hljs = require('highlight.js');

const rowTemplate = _.template(fs.readFileSync(path.join(__dirname, 'template-row.html')).toString());
const row = (left, right) => rowTemplate({left: left || '', right: right || ''});

const renderMarkdownString = (markdownString) => {
  const intermediaryOutput = marked(markdownString, {
    highlight: (code, lang) => {
      if (!lang || lang === 'plain') { return code; }
      return hljs.highlight(lang, code).value;
    }
  });

  const $ = cheerio.load(`<div id="root">${intermediaryOutput}</div>`);
  const blocks = [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol',
    'blockquote', 'table', 'hr', 'br', 'pre'
  ];
  const collectLeft = ['p', 'blockquote', 'ul', 'ol'];
  const flushRight = ['pre'];

  let stack = [];
  let finalOutput = '';
  // walk all the "root" block level elements, throw anything that can
  // be bunched into the left side of code onto the stack - then flush
  // periodically when we run into code.
  $(`#root > ${blocks.join(',')}`).each((i, el) => {
    const collect = collectLeft.indexOf(el.name) !== -1;
    const flush = flushRight.indexOf(el.name) !== -1;
    let inner = $(el).clone().wrap('<div>').parent().html();

    if (collect) {
      stack.push(inner);
      return;
    }

    if (flush) {
      finalOutput += row(stack.join(''), inner);
      stack = [];
    } else {
      if (stack.length) {
        finalOutput += row(stack.join(''));
      }
      finalOutput += row(inner);
    }

    if (!collect) {
      stack = [];
    }

  });

  if (stack.length) {
    finalOutput += row(stack.join(''));
  }

  return finalOutput;
};


const litdoc = (options) => {
  const title = options.title || 'Documentation';

  const cssPath = options.cssPath || path.join(__dirname, 'base.css');
  const css = options.css || fs.readFileSync(cssPath).toString();

  const templatePath = options.templatePath || path.join(__dirname, 'template.html');
  const template = options.template || fs.readFileSync(templatePath).toString();

  const markdownPath = options.markdownPath || undefined;
  const markdown = options.markdown || fs.readFileSync(markdownPath).toString();

  const outputPath = options.outputPath;

  const renderTemplate = _.template(template);

  const tableOfContent = marked(toc(markdown).content);

  const content = renderMarkdownString(markdown);
  const context = {
    title: title,
    css: css,
    tableOfContent: tableOfContent,
    content: content
  };

  const finalContent = renderTemplate(context);
  if (outputPath) {
    return fs.writeFileSync(outputPath, finalContent);
  } else {
    return finalContent;
  }
};

module.exports = litdoc;
