import { layout } from "../layout"

export class Modification {
  toCode() {
    return '';
  }
}

export class Rotate {
  constructor(angle) {
    this.angle = angle;
  }

  toCode() {
    if (this.angle == 0) {
      return '';
    } else if (this.angle == 1) {
      return 'CC';
    }
  }
}
