import { setupResizeEvent } from "./iframeSizer.js";
import { APP_URL } from "../config/embed.js";

const embeds = document.querySelectorAll(".DC-embed");
const enhanced = "DC-embed-enhanced";

embeds.forEach((embed) => {
  if (embed.className.indexOf(enhanced) != -1) return;

  // Make sure the embed isn't enhanced twice
  embed.className += " " + enhanced;

  // Obtain the resource
  const resource = embed.querySelector(".DC-embed-resource");
  if (resource == null) return;
  if (resource.href == null) return;

  // Extract all components of the resource
  let hash = resource.href.split("#");
  if (hash.length != 2) return;
  let slugId = hash[0];
  hash = hash[1];
  const parts = slugId.split("/").filter((x) => x.trim().length > 0);
  if (parts.length < 2) return;
  slugId = parts[parts.length - 1];
  let page = hash.split("/");
  if (page.length != 2) return;
  page = parseInt(page[1].substr(1));
  if (page == null || isNaN(page)) return;

  // Clear the container
  while (embed.firstChild) embed.removeChild(embed.firstChild);
  embed.style = `max-width:${embed.style.maxWidth}`;

  // Create the iframe
  const iframe = document.createElement("iframe");
  iframe.style = "border: none; width: 100%;";
  iframe.src = new URL(`documents/${slugId}/pages/${page}`, APP_URL).href;
  setupResizeEvent(iframe);

  embed.appendChild(iframe);
});
