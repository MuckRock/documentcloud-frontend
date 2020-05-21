import { Svue } from "svue";

const LAYOUT = {
  docMargin: 20,  // margin from top to first page, bottom to last
  pageGap: 20,  // margin between pages
  rail: 69,  // max space on left and right on pages
  pageWidth: 700,  // the width of a page,
  pageBoundsWhenZoomed: 5,  // amount of padding when zoomed in past a page's width
};

const DEFAULT_ASPECT = 11 / 8.5; // letter size paper

export const doc = new Svue({
  data() {
    return {
      layout: LAYOUT,
      defaultAspect: DEFAULT_ASPECT,
      rawAspects: [
        0.5, 0.8, 1.2
      ],  // list of aspect ratios for each page
    }
  },
  computed: {
    // Aspects
    averageAspect(rawAspects, defaultAspect) {
      let sum = 0;
      let count = 0;
      for (let i = 0; i < rawAspects.length; i++) {
        const aspect = rawAspects[i];
        if (aspect != null) {
          sum += aspect;
          count++;
        }
      }
      if (count != 0) return sum / count;
      return defaultAspect;
    },
    aspects(rawAspects, averageAspect) {
      return rawAspects.map(aspect => aspect == null ? averageAspect : aspect);
    },

    // Positions / Sizes
    pagePositions(aspects, layout) {
      let x = layout.rail;
      let y = layout.docMargin;
      const x2 = x + layout.pageWidth;
      const positions = [];
      for (let i = 0; i < aspects.length; i++) {
        const aspect = aspects[i];
        const height = layout.pageWidth * aspect;
        positions.push([x, y, x2, y + height]);
        y += height + layout.pageGap;
      }
      return positions;
    },
    containerWidth(layout) {
      return layout.rail * 2 + layout.pageWidth;
    },
    containerHeight(aspects, layout) {
      let height = layout.docMargin * 2;
      for (let i = 0; i < aspects.length; i++) {
        const aspect = aspects[i];
        height += layout.pageWidth * aspect;
        if (i != aspects.length - 1) height += layout.pageGap;
      }
      return height;
    }
  }
});
