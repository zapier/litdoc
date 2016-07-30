'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('lodash');

var marked = require('marked');
var toc = require('markdown-toc');
var cheerio = require('cheerio');
var hljs = require('highlight.js');

var rowTemplate = _.template(fs.readFileSync(path.join(__dirname, 'template-row.html')).toString());
var row = function row(left, right) {
  return rowTemplate({ left: left || '', right: right || '' });
};

var renderMarkdownString = function renderMarkdownString(markdownString) {
  var intermediaryOutput = marked(markdownString, {
    highlight: function highlight(code, lang) {
      if (!lang || lang === 'plain') {
        return code;
      }
      return hljs.highlight(lang, code).value;
    }
  });

  var $ = cheerio.load('<div id="root">' + intermediaryOutput + '</div>');
  var blocks = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'blockquote', 'table', 'hr', 'br', 'pre'];
  var collectLeft = ['p', 'blockquote', 'ul', 'ol'];
  var flushRight = ['pre'];

  var stack = [];
  var finalOutput = '';
  // walk all the "root" block level elements, throw anything that can
  // be bunched into the left side of code onto the stack - then flush
  // periodically when we run into code.
  $('#root > ' + blocks.join(',')).each(function (i, el) {
    var collect = collectLeft.indexOf(el.name) !== -1;
    var flush = flushRight.indexOf(el.name) !== -1;
    var inner = $(el).clone().wrap('<div>').parent().html();

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

var litdoc = function litdoc(options) {
  var title = options.title || 'Documentation';

  var cssPath = options.cssPath || path.join(__dirname, 'base.css');
  var css = options.css || fs.readFileSync(cssPath).toString();

  var templatePath = options.templatePath || path.join(__dirname, 'template.html');
  var template = options.template || fs.readFileSync(templatePath).toString();

  var markdownPath = options.markdownPath || undefined;
  var markdown = options.markdown || fs.readFileSync(markdownPath).toString();

  var outputPath = options.outputPath;

  var renderTemplate = _.template(template);

  var tableOfContent = marked(toc(markdown).content);

  var content = renderMarkdownString(markdown);
  var context = {
    title: title,
    css: css,
    tableOfContent: tableOfContent,
    content: content
  };

  var finalContent = renderTemplate(context);
  if (outputPath) {
    return fs.writeFileSync(outputPath, finalContent);
  } else {
    return finalContent;
  }
};

module.exports = litdoc;
