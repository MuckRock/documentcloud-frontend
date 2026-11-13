let id = 0;

export class Page {
  id = ++id;

  // Zero-indexed page position in the document
  index = $state(0);
  width = $state(0);
  height = $state(0);

  rotation = $state(0);

  oneIndexedPageNumber = $derived(this.index + 1);
  aspectRatio = $derived(this.width / this.height);
  orientation = $derived(this.width > this.height ? "horizontal" : "vertical");

  constructor({
    id: pageId,
    index,
    width,
    height,
    rotation = 0,
  }: {
    id?: number;
    index: number;
    width: number;
    height: number;
    rotation?: number;
  }) {
    if (pageId !== undefined) this.id = pageId;
    this.index = index;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
  }

  rotate(clockwise = true) {
    return new Page({
      id: this.id,
      index: this.index,
      width: this.height,
      height: this.width,
      rotation: this.rotation + (clockwise ? 90 : -90),
    });
  }

  copy() {
    return new Page(this.toJSON());
  }

  toJSON() {
    return {
      index: this.index,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
    };
  }
}
