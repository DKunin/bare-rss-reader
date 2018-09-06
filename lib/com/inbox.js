const html = require('choo/html');
const raw = require('nanohtml/raw')

module.exports = function(state, emit) {
  return html`<div class="inbox">
    ${state.inbox.length === 0
      ? html`<div class="intro">
      <p>Add a dat:// RSS xml file as a source to get started.</p>
    </div>`
      : ''}
    ${state.inbox
      .slice(0, 20)
      .map(item => {
        var url = fixUrl(item.link, item.origin);
        return html`<div class="item">
        <div class="source">
          <a href=${url} target="_blank">${item.title}</a>
        </div>
        <div class="description">
          ${raw(item.description || item.content)}
        </div>
        <div class="pubdate">
          ${item.pubdate || item.pubDate}
        </div>
      </div>`;
      })}
  </div>`;
};

function fixUrl(link, sourceOrigin) {
  if (!sourceOrigin) {
    return '';
  }
  if (link && link.href) {
    link = link.href;
  }
  // make sure the link is the dat address
  if (!link.startsWith('dat://')) {
    try {
      var urlp = new URL(link);
      link = urlp.pathname + urlp.hash;
    } catch (e) {}
  }
  // make sure the link has an origin
  if (link.startsWith('/')) {
    if (sourceOrigin.endsWith('/')) {
      return sourceOrigin + link.slice(1);
    }
    return sourceOrigin + link;
  }
  return link;
}
