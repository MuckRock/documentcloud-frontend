import { setupResizeEvent } from "./iframeSizer.js";
import { APP_URL } from "../config/config.js";

const enhanced = "DC-embed-enhanced";

function loadNote(src) {
  const parts = src.split("/").slice(-3);
  if (parts.length != 3) return;
  const slugId = parts[0];
  const slugIdParts = slugId.split("-");
  const id = slugIdParts[0];
  const noteId = parts[2].replace(/[^0-9]/g, "");

  document.querySelectorAll(`#DC-note-${noteId}`).forEach((noteElem) => {
    if (noteElem.className.indexOf(enhanced) != -1) return;
    noteElem.className += " " + enhanced;

    // Clear the container
    while (noteElem.firstChild) noteElem.removeChild(noteElem.firstChild);
    noteElem.style = `max-width:${noteElem.style.maxWidth}`;

    // Create the iframe
    const iframe = document.createElement("iframe");
    iframe.style = "border: none; width: 100%;";
    iframe.src = `${APP_URL}documents/${id}/annotations/${noteId}`;
    setupResizeEvent(iframe);

    noteElem.appendChild(iframe);
  });
}

if (window["dc"] == null) window["dc"] = {};
if (window["dc"]["embed"] == null) window["dc"]["embed"] = {};
if (window["dc"]["embed"]["loadNote"] == null)
  window["dc"]["embed"]["loadNote"] = loadNote;
