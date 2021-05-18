import { Svue } from "svue";

export class Rectangle extends Svue {
  constructor(x1, y1, x2, y2) {
    super({
      data() {
        return {
          x1,
          y1,
          x2,
          y2,
        };
      },
      computed: {
        width(x2, x1) {
          return x2 - x1;
        },
        height(y2, y1) {
          return y2 - y1;
        },
      },
    });
  }
}
