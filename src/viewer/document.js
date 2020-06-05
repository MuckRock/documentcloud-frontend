import { Svue } from "svue";
import { viewer } from './viewer';

const LAYOUT = {
  docMargin: 20,  // margin from top to first page, bottom to last
  pageGap: 20,  // margin between pages
  rail: 69,  // max space on left and right on pages
  pageWidth: 700,  // the width of a page,
  pageBoundsWhenZoomed: 5,  // amount of padding when zoomed in past a page's width
};

const DEFAULT_ASPECT = 11 / 8.5; // letter size paper

class Doc extends Svue {
  constructor() {
    super({
      data() {
        return {
          layout: LAYOUT,
          defaultAspect: DEFAULT_ASPECT,
          rawAspects: [],  // list of aspect ratios for each page
          viewer,
        }
      },
      watch: {
        viewer(viewer) {
          if (viewer.pageAspects != null) this.initAspects();
        },
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
        pages(aspects, layout, viewer) {
          let x = layout.rail;
          let y = layout.docMargin;
          const x2 = x + layout.pageWidth;
          const pages = [];
          for (let i = 0; i < aspects.length; i++) {
            const aspect = aspects[i];
            const height = layout.pageWidth * aspect;
            pages.push({
              position: [x, y, x2, y + height],
              document: viewer.document, pageNumber: i
            });
            y += height + layout.pageGap;
          }
          return pages;
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
  }

  initAspects() {
    this.rawAspects = this.viewer.pageAspects.slice();
  }
}

export const doc = new Doc();
