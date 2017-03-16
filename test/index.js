var should = require('should');

var litdoc = require('../index');

describe('litdoc', () => {
  it('should render markdown to html', () => {
    var markdown = '# Big Heading\nHi there. [Click Me](http://example.com).\n\nSecond paragraph.';
    var html = litdoc({markdown: markdown})
    html.should.containEql('<h1 id="big-heading">Big Heading</h1>');
    html.should.containEql('<p>Hi there. <a href="http://example.com">Click Me</a>.</p>');
    html.should.containEql('<p>Second paragraph.</p>');
  });
});
