import { setupResizeEvent } from './iframeSizer';
import { queryBuilder } from '@/util/url';

function injectIframe(url, options, container) {
  const parts = url.split('/').slice(-2);
  if (parts.length != 2) return;
  if (parts[0] != 'documents') return;
  const slugId = parts[1];
  const slugIdParts = slugId.split('-');
  if (slugIdParts.length != 2) return;
  const id = slugIdParts[0];
  const slugExtension = slugIdParts[1];
  const slugParts = slugExtension.split('.');
  if (slugParts.length < 1) return;
  const slug = slugParts[0];

  // Create the iframe
  const iframe = document.createElement('iframe');

  // Ported from https://github.com/documentcloud/document-viewer/blob/master/public/javascripts/DV/helpers/construction.js
  if (options.responsive) {
    if (!options.height) {
      const windowHeight = window.innerHeight;
      const toSubtract = options.responsiveOffset == null ? 100 : options.responsiveOffset;
      options.height = windowHeight - toSubtract;
    }
  }

  const queryParams = {};
  let urlPostfix = '';
  let widthOption = '100%';

  // Height option
  if (options.height != null) {
    iframe.height = options.height;
  } else {
    iframe.height = '100%';
  }
  // Width option
  if (options.width != null) {
    iframe.width = options.width;
    widthOption = `${options.width}px`;
  }
  // Sidebar, text, and pdf options
  if (options.sidebar != null) {
    queryParams['sidebar'] = options.sidebar ? 1 : 0;
  }
  if (options.text == false) {
    queryParams['text'] = 0;
  }
  if (options.pdf == false) {
    queryParams['pdf'] = 0;
  }
  // Page option
  if (options.page != null) {
    if (options.note != null) {
      // Note option (must have page defined)
      urlPostfix = `#document/p${options.page}/a${options.note}`;
    } else {
      urlPostfix = `#document/p${options.page}`;
    }
  }

  iframe.style = `border: none; width: ${widthOption}; border: solid 1px #aaa`;
  iframe.src = queryBuilder(`${process.env.APP_URL}documents/${id}-${slug}`, queryParams) + urlPostfix;
  setupResizeEvent(iframe);

  container.appendChild(iframe);
}

window.DV = {
  load: function (url, options) {
    const containerId = options['container'];
    if (containerId != null) {
      const container = document.querySelector(containerId);
      if (container != null && container.children.length == 0) {
        injectIframe(url, options, container);
      }
    }
  }
}
