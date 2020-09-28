import Page from '@/embed/page/Page';

const embeds = document.querySelectorAll('.DC-embed');
const enhanced = 'DC-embed-enhanced';

embeds.forEach(embed => {
  if (embed.className.indexOf(enhanced) != -1) return;

  // Make sure the embed isn't enhanced twice
  embed.className += ' ' + enhanced;
  embed.style.font = '400 10pt/14pt Source Sans Pro,-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';

  // Obtain the resource
  const resource = embed.querySelector('.DC-embed-resource');
  if (resource == null) return;
  if (resource.href == null) return;

  // Extract all components of the resource
  let hash = resource.href.split('#');
  if (hash.length != 2) return;
  let slugId = hash[0];
  hash = hash[1];
  const parts = slugId.split('/');
  if (parts.length < 2) return;
  slugId = parts[parts.length - 1];
  const id = slugId.split('-')[0];
  let page = hash.split('/');
  if (page.length != 2) return;
  page = parseInt(page[1].substr(1));
  if (page == null || isNaN(page)) return;

  // Replace image with an image container
  const img = embed.querySelector('img');
  const container = document.createElement('div');
  container.className = 'dc-embed-container';
  container.style.display = 'inline-block';
  container.style.position = 'relative';
  container.style.lineHeight = '0';
  container.style.margin = img.style.margin;
  img.style.margin = '';
  img.parentElement.replaceChild(container, img);
  container.appendChild(img);

  // Inject Svelte componet
  new Page({
    target: container,
    props: {
      id,
      slugId,
      page
    }
  });
});
