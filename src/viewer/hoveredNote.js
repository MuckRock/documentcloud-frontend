import { layout } from "./layout";

export function hoveredNote(el, note) {
  let mouseover = () => {
    layout.hoveredNote = note;
  };

  let mouseout = () => {
    layout.hoveredNote = null;
  };

  el.addEventListener("mouseover", mouseover);
  el.addEventListener("mouseout", mouseout);

  return {
    update(note) {
      el.removeEventListener("mouseover", mouseover);
      el.removeEventListener("mouseout", mouseout);

      mouseover = () => {
        layout.hoveredNote = note;
      };

      mouseout = () => {
        layout.hoveredNote = null;
      };

      el.addEventListener("mouseover", mouseover);
      el.addEventListener("mouseout", mouseout);
    },

    destroy: () => {
      el.removeEventListener("mouseover", mouseover);
      el.removeEventListener("mouseout", mouseout);
    },
  };
}
