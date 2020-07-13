import { Svue } from "svue";
import { viewer } from './viewer';
import { tick } from 'svelte';
import { layout, annotationValid, startSearch, clearSearch } from './layout';

const LAYOUT = {
  docMargin: 40,  // margin from top to first page, bottom to last
  pageGap: 20,  // margin between pages
  rail: 10,  // max space on left and right on pages
  pageWidth: 700,  // the width of a page,
  pageBoundsWhenZoomed: 5,  // amount of padding when zoomed in past a page's width
};

const DEFAULT_IMAGE_ASPECT = 11 / 8.5; // letter size paper
const DEFAULT_TEXT_ASPECT = 11 / 8.5;

class Doc extends Svue {
  constructor() {
    super({
      data() {
        return {
          layout: LAYOUT,
          allDefaultAspects: {
            image: DEFAULT_IMAGE_ASPECT,
            text: DEFAULT_TEXT_ASPECT,
          },
          allRawAspects: { image: [], text: [] },  // list of aspect ratios for each page
          allExtraHeights: { image: [], text: [] },
          viewer,
          texts: [],
          viewerWidth: 0,
          docHeight: 0,
          viewerScale: 1,
          scrollzoom: null,
          simpleDocElem: null,
          visiblePageNumber: 1,
          sidebarExpanded: false,
          textJump: null,
          mode: 'image',

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
        defaultAspect(mode, allDefaultAspects) {
          return allDefaultAspects[mode];
        },
        rawAspects(mode, allRawAspects) {
          return allRawAspects[mode] || [];
        },
        extraHeights(mode, allExtraHeights) {
          return allExtraHeights[mode] || [];
        },
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
    this.texts = this.viewer.pageAspects.map(() => null);
    this.allExtraHeights = {
      image: this.viewer.pageAspects.map(() => 0),
      text: this.viewer.pageAspects.map(() => 0),
    };
    this.allRawAspects = {
      image: this.viewer.pageAspects.slice(),
      text: this.viewer.pageAspects.map(() => null),
    };
  }

  setExtraHeight(pageNumber, extraHeight) {
    doc.allExtraHeights[doc.mode][pageNumber] = extraHeight;
    doc.allExtraHeights = doc.allExtraHeights;  // trigger update
  }

  setPageAspect(pageNumber, aspect) {
    doc.allRawAspects[doc.mode][pageNumber] = aspect;
    doc.allRawAspects = doc.allRawAspects;  // trigger update
  }

  jumpToPage(pageNumber) {
    if (this.mode == 'image') {
      if (this.scrollzoom == null) return;

      const scrollTop = (this.scrollzoom.components[pageNumber].y - this.layout.pageGap / 4) * this.scrollzoom.transform.matrix[0];
      if (this.scrollzoom.element != null) this.scrollzoom.element.scrollTop = scrollTop;
    } else if (this.mode == 'text') {
      if (doc.simpleDocElem != null) doc.simpleDocElem.scrollTop = 0;
      document.getElementById(`${pageNumber + 1}`).scrollIntoView();
    }
  }

  jumpToTextJump() {
    if (this.textJump != null) {
      this.jumpToPage(this.textJump);
      this.textJump = null;
    }
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

export async function restorePosition(pageNumber) {
  doc.jumpToPage(pageNumber);
}

export async function changeMode(mode) {
  await closeSidebarIfFullWidth();

  // No effect when mode is same
  if (mode == doc.mode) return;

  // Change the mode while preserving position.
  const position = doc.visiblePageNumber - 1;

  if (mode == 'text' && doc.mode == 'image') {
    doc.textJump = position;
  }
  doc.mode = mode;

  if (mode != 'text') {
    await tick();
    restorePosition(position);
  }

  // Deselect any text
  if (window.getSelection) window.getSelection().removeAllRanges();
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

let modeBeforeSearch = 'image';

export async function initiateSearch(query) {
  if (await startSearch(query)) {
    modeBeforeSearch = doc.mode;
    await changeMode("search");
  }
}

export async function exitSearch() {
  clearSearch();
  if (modeBeforeSearch != null) {
    await changeMode(modeBeforeSearch);
  }
}
