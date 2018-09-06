const FeedMe = require('feedme');
const RSSParser = require('rss-parser');
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
let parser = new RSSParser();

module.exports = (state, emitter) => {
  state.sources = [];

  emitter.on('DOMContentLoaded', () => {
    // load saved sources
    try {
      var sources = JSON.parse(localStorage.sources);
      sources.forEach(s => emitter.emit('add-source', s));
    } catch (e) {
      // no sources yet! add defaults
      emitter.emit('add-source', 'dat://pfrazee.hashbase.io/feed.xml');
      emitter.emit('add-source', 'dat://taravancil.com/index.xml');
      emitter.emit('add-source', 'dat://don-marti-dmarti.hashbase.io/feed.xml');
      emitter.emit('add-source', 'dat://tmcw.hashbase.io/rss.xml');
      emitter.emit('add-source', 'dat://simple-sengming.hashbase.io/rss.xml');
    }
  });

  emitter.on('add-source', async sourceUrl => {
    // add in loading state
    var urlp = new URL(sourceUrl);
    var source = {
      url: sourceUrl,
      origin: urlp.origin
    };
    state.sources.push(source);
    saveSources(state.sources);
    emitter.emit('render');

    // load content
    try {
      if (sourceUrl.includes('dat:')) {
        source.feed = await readSource(sourceUrl);
      } else {
        source.feed = await parser.parseURL(CORS_PROXY + sourceUrl);
      }

      source.feed.items.forEach(item => {

        item.origin = source.feed.origin;
      });
    } catch (e) {
      console.error('Error loading feed', source, e);
      source.error = e;
    }
    emitter.emit('source-added');
  });

  emitter.on('remove-source', sourceUrl => {
    state.sources = state.sources.filter(s => s.url !== sourceUrl);
    saveSources(state.sources);
    emitter.emit('source-removed');
  });
};

async function readSource(url) {
  var res = await fetch(url);
  var feedContent = await res.text();
  // var urlp = new URL(url)
  // var archive = new DatArchive(await DatArchive.resolveName(urlp.hostname))
  // var feedContent = await archive.readFile(urlp.pathname, 'utf8')

  // parse
  var parser = new FeedMe(true);
  parser.write(feedContent);
  return parser.done();
}

function saveSources(sources) {
  localStorage.sources = JSON.stringify(sources.map(s => s.url));
}
