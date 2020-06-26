import { Svue } from "svue";
import { viewer } from './viewer';
import { layout, annotationValid } from './layout';

const LAYOUT = {
  docMargin: 40,  // margin from top to first page, bottom to last
  pageGap: 20,  // margin between pages
  rail: 10,  // max space on left and right on pages
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
          extraHeights: [],
          viewer,
          viewerWidth: 0,
          docHeight: 0,
          viewerScale: 1,
          scrollzoom: null,
          visiblePageNumber: 1,
          sidebarExpanded: false,

          // Show page note insert regions
          showPageNoteInserts: false,
        }
      },
      watch: {
        viewer(viewer) {
          if (viewer.pageAspects != null) this.initAspects();
        },
      },
      computed: {
        document(viewer) {
          return viewer.document;
        },
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
        pages(aspects, extraHeights, layout, document) {
          if (document == null) return [];
          let x = layout.rail;
          let y = layout.docMargin;
          const x2 = x + layout.pageWidth;
          const pages = [];
          for (let i = 0; i < aspects.length; i++) {
            const aspect = aspects[i];
            const height = layout.pageWidth * (aspect + extraHeights[i]);
            pages.push({
              position: [x, y, x2, y + height],
              aspect,
              document, pageNumber: i
            });
            y += height + layout.pageGap;
          }
          return pages;
        },
        containerWidth(layout) {
          return layout.rail * 2 + layout.pageWidth;
        },
        containerHeight(aspects, extraHeights, layout) {
          let height = layout.docMargin * 2;
          for (let i = 0; i < aspects.length; i++) {
            const aspect = aspects[i];
            const extraHeight = extraHeights[i];
            height += layout.pageWidth * (aspect + extraHeight);
            if (i != aspects.length - 1) height += layout.pageGap;
          }
          return height;
        }
      }
    });
  }

  initAspects() {
    this.visiblePageNumber = 1;
    this.extraHeights = this.viewer.pageAspects.map(() => 0);
    this.rawAspects = this.viewer.pageAspects.slice();
  }

  jumpToPage(pageNumber) {
    if (this.scrollzoom == null) return;

    const scrollTop = (this.scrollzoom.components[pageNumber].y - this.layout.pageGap / 4) * this.scrollzoom.transform.matrix[0];
    this.scrollzoom.element.scrollTop = scrollTop;
  }
}

export const doc = new Doc();

// Layout
export async function toggleSidebar() {
  await showSidebar(!layout.showSidebar);
}

export async function showSidebar(show) {
  layout.showSidebar = show;
}

export async function closeSidebarIfFullWidth() {
  if (doc.viewerWidth - layout.sidebarWidth <= 0) {
    // Close sidebar if necessary
    await showSidebar(false);
  }
}

export async function showAnnotation(annotation, scrollIntoView = false) {
  await closeSidebarIfFullWidth();

  if (!annotationValid(annotation)) return;
  layout.annotateMode = "view";
  layout.displayedAnnotation = annotation;

  if (scrollIntoView) {
    await restorePosition(annotation.page);
    await scrollVisibleAnnotationIntoView();
  }
}
