import { setupResizeEvent } from './iframeSizer';
import { queryBuilder } from '@/util/url';

function logInvalidQuery(options, container) {
  const q = options.q;
  console.error(`Query ${q} is not supported`);
  const iframe = document.createElement('iframe');
  iframe.src = queryBuilder(`${process.env.EMBED_URL}project404`, { projectQuery: q, toc: 0 });

  // Set up style
  let style = 'border:solid 1px #aaa;';
  style += (options.width != null ? 'width:' + options.width + 'px;' : 'width:100%;');
  style += (options.height != null ? 'height:' + options.height + 'px;' : 'height:100%;max-height:' + (Math.max(window.innerHeight - 100, 500)) + 'px;');

  iframe.style = style;
  iframe.title = options.title != null ? options.title + ' (Hosted by DocumentCloud)' : 'DocumentCloud Project Embed';
  iframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox';

  container.appendChild(iframe);
}

function injectIframe(options, container) {
  const q = options.q;
  if (q == null) return;

  const projectId = /^projectid: ?([0-9]+)(.*?) *$/.exec(q);
  if (projectId == null) return logInvalidQuery(options, container);

  // Derive project slug-id
  const id = projectId[1];
  let slug = projectId[2];
  if (slug.startsWith('-')) slug = slug.substr(1);
  let slugId;
  if (slug.trim() == '') {
    slugId = id;
  } else {
    slugId = [slug, id].join('-');
  }

  // Set up query params
  const queryParams = {
    embed: 1,
  };
  if (options.title != null && options.title.trim().length > 0) {
    queryParams.title = options.title;
  }
  if (options.order != null && options.order != 'score') {
    queryParams.order = options.order;
  }
  if (options.per_page != null) {
    queryParams.perpage = options.per_page;
  }
  if (options.search_bar != null) {
    queryParams.searchbar = options.search_bar ? 1 : 0;
  }

  // Set up style
  let style = 'border:solid 1px #aaa;';
  style += (options.width != null ? 'width:' + options.width + 'px;' : 'width:100%;');
  style += (options.height != null ? 'height:' + options.height + 'px;' : 'height:100%;max-height:' + (Math.max(window.innerHeight - 100, 500)) + 'px;');

  // Set up iframe
  const iframe = document.createElement('iframe');
  iframe.src = queryBuilder(`${process.env.EMBED_URL}projects/${slugId}`, queryParams);
  iframe.style = style;
  iframe.title = options.title != null ? options.title + ' (Hosted by DocumentCloud)' : 'DocumentCloud Project Embed';
  iframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox';
  setupResizeEvent(iframe);

  container.appendChild(iframe);
}

// Set up embed loader
window.dc = window.dc || {};
window.dc.embed = window.dc.embed || {};
window.dc.embed.load = function (_, options) {
  const containerId = options['container'];
  if (containerId != null) {
    const container = document.querySelector(containerId);
    if (container != null && container.children.length == 0) {
      injectIframe(options, container);
    }
  }
}
