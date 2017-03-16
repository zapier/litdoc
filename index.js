'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('lodash');

var dedent = require('dedent');
var marked = require('marked');
var toc = require('markdown-toc');
var cheerio = require('cheerio');
var hljs = require('highlight.js');

var rowTemplate = _.template(fs.readFileSync(path.join(__dirname, 'templates/row.jst')).toString());
/*
  Render down a "row", which is what we're doing to get the column
  appearance along with bootstrap grids, both left (docs) and right (comments).
*/
var row = function row(left, right) {
  return rowTemplate({ left: left || '', right: right || '' });
};

var prepCodeBlock = function(block) {
  return ('```js\n' + block + '\n```')
    .replace(/\`\`\`/g, '\`\`\`');
};
var prepCommentBlock = function(block) {
   // TODO: unwrap /* // */ and dedent
  return dedent(block
    .replace(/\/\/ ?/gm, '') // only beginning of lines?
    .replace(/\/\*/gm, '') // only first?
    .replace(/\*\//gm, '')); // only last?
};
var startsComment = function(line) {
  return line.trim().indexOf('/*') === 0;
};
var endsComment = function(line) {
  return line.trim().indexOf('*/') !== -1;
};
var isComment = function(line, commentsInStack) {
  line = line.trim();
  return (
    commentsInStack || // continuation of a big comment
    line.length > 50 || // big comments only
    line.indexOf('// #') === 0 // markdown header
  ) && line.indexOf('//') === 0;
};

// ## Javascript To Markdown
//
// A fairly silly javascript "parser" that just walks line to line looking
// for comments. Honestly we should use `acorn` or the maybe `highlight.js`
// but sadly they mangle code or don't expose their lexers - respectively.
var javascriptToMarkdown = function(javascriptString) {
  return javascriptString
    .trim()
    .split('\n')
    .reduce(function(state, line, i, arr) {
      // var first = i === 0;
      var last = arr.length - 1 === i;

      if (startsComment(line)) {
        state.isMultilineComment = true;
      }

      // we'd push/handle the stack here
      var lineIsComment = state.isMultilineComment || isComment(line, state.commentStack.length !== 0);
      var lineIsCode = !lineIsComment;
      if (lineIsCode) {
        state.codeStack.push(line);
      } else {
        state.commentStack.push(line);
      }

      if (endsComment(line)) {
        state.isMultilineComment = false;
      }


      // flush everything!
      if (state.commentStack.length && (lineIsCode || last)) {
        var commentBlock = prepCommentBlock(state.commentStack.join('\n'));
        state.output = state.output.concat([commentBlock]);
        state.commentStack = [];
      }
      if (state.codeStack.length && (lineIsComment || last)) {
        var codeBlock = prepCodeBlock(state.codeStack.join('\n'));
        state.output = state.output.concat([codeBlock]);
        state.codeStack = [];
      }

      return state;
    }, {output: [], codeStack: [], commentStack: [], isMultilineComment: false})
    .output
    .join('\n\n')
    .trim();
};

/*
## Markdown To HTML

Renders Markdown into our "flavor" of row/bootstrap based HTML, which
will then be injected into the index.jst.
*/
var markdownToHTML = function(markdownString) {
  var intermediaryOutput = marked(markdownString, {
    highlight: function highlight(code, lang) {
      if (!lang || lang === 'plain') {
        return code;
      }
      return hljs.highlight(lang, code).value;
    }
  });

  var $ = cheerio.load('<div id="root">' + intermediaryOutput + '</div>');
  var blocks = [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre',
    'ul', 'ol', 'blockquote', 'table', 'hr', 'br'
  ];
  var blocksSelector = blocks.map(function(s) { return '#root > ' + s; }).join(',');
  var collectLeft = ['p', 'blockquote', 'ul', 'ol'];
  var flushRight = ['pre'];

  var stack = [];
  var finalOutput = '';
  /*
    Using `cherio`, we walk all the "root" block level elements, throw anything that can
    be bunched into the left side of code onto the stack - then flush
    periodically when we run into code sections. This could be refactored into a reduce.
  */
  $(blocksSelector).each(function (i, el) {
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


/*
## litdoc Export

The exported function that takes an options object and does all the magic.
See the normal documentation for usage instructions.
*/
var litdoc = function litdoc(options) {
  var title = options.title || 'Documentation';

  var cssPath = options.cssPath || path.join(__dirname, 'assets/base.css');
  var css = options.css || fs.readFileSync(cssPath).toString();

  var templatePath = options.templatePath || path.join(__dirname, 'templates/index.jst');
  var template = options.template || fs.readFileSync(templatePath).toString();

  var markdown;
  var markdownPath = options.markdownPath || undefined;
  if (markdownPath) {
    markdown = fs.readFileSync(markdownPath).toString();
    if (_.endsWith(markdownPath, '.js')) {
      markdown = javascriptToMarkdown(markdown);
    }
  } else if (options.markdown) {
    markdown = options.markdown;
  } else {
    throw new Error('Must specify `markdown` or `markdownPath` option');
  }

  var outputPath = options.outputPath;

  // Do the actual work!
  var renderHTMLTemplate = _.template(template);

  var tableOfContent = marked(toc(markdown).content);

  var content = markdownToHTML(markdown);
  var context = {
    title: title,
    css: css,
    tableOfContent: tableOfContent,
    content: content
  };
  var finalContent = renderHTMLTemplate(context);

  if (outputPath) {
    return fs.writeFileSync(outputPath, finalContent);
  } else {
    return finalContent;
  }
};

module.exports = litdoc;
