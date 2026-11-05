let id = 0;

export class Page {
  id = ++id;

  // Zero-indexed page position in the document
  index = $state(0);
  width = $state(0);
  height = $state(0);

  oneIndexedPageNumber = $derived(this.index + 1);
  aspectRatio = $derived(this.width / this.height);
  orientation = $derived(this.width > this.height ? "horizontal" : "vertical");

  constructor({
    index,
    width,
    height,
  }: {
    index: number;
    width: number;
    height: number;
  }) {
    this.index = index;
    this.width = width;
    this.height = height;
  }

  copy() {
    return new Page({
      index: this.index,
      width: this.width,
      height: this.height,
    });
  }
}
