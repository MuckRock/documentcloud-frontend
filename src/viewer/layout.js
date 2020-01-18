import { Svue } from "svue";

export const layout = new Svue({
  data() {
    return {
      headerHeight: 63,
      sidebarWidth: 350,
      footerHeight: 47,

      action: null,
      rawRedaction: null,
      rawPendingRedactions: []
    };
  },
  computed: {
    redacting(action) {
      return action == "redact";
    },
    annotating(action) {
      return action == "annotate";
    },
    pageCrosshair(redacting, annotating) {
      return redacting || annotating;
    },
    currentRedaction(redacting, rawRedaction) {
      if (!redacting || rawRedaction == null) return null;

      const start = {
        x: Math.min(rawRedaction.start.x, rawRedaction.end.x),
        y: Math.min(rawRedaction.start.y, rawRedaction.end.y)
      };
      const end = {
        x: Math.max(rawRedaction.start.x, rawRedaction.end.x),
        y: Math.max(rawRedaction.start.y, rawRedaction.end.y)
      };

      console.log({ start, end });

      return {
        pageNumber: rawRedaction.pageNumber,
        start: start,
        end: end,
        width: end.x - start.x,
        height: end.y - start.y
      };
    },
    pendingRedactions(redacting, rawPendingRedactions) {
      if (!redacting) return null;
      return rawPendingRedactions;
    },
    allRedactions(currentRedaction, pendingRedactions) {
      if (currentRedaction == null) return pendingRedactions;
      return [...pendingRedactions, currentRedaction];
    }
  }
});

export function redact() {
  layout.rawRedaction = null;
  layout.rawPendingRedactions = [];
  layout.action = "redact";
}

export function annotate() {
  layout.action = "annotate";
}

export function pageDragStart(pageNumber, x, y) {
  if (layout.redacting) {
    layout.rawRedaction = {
      pageNumber,
      start: { x, y },
      end: { x, y }
    };
  }
}

export function pageDragMove(pageNumber, x, y) {
  if (layout.redacting) {
    layout.rawRedaction = { ...layout.rawRedaction, pageNumber, end: { x, y } };
  }
}

export function pageDragEnd(pageNumber, x, y) {
  if (layout.redacting) {
    layout.rawRedaction = { ...layout.rawRedaction, pageNumber, end: { x, y } };
    pushRedaction();
  }
}

function pushRedaction() {
  layout.rawPendingRedactions.push(layout.currentRedaction);
  layout.rawRedaction = null;
}
