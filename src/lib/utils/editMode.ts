export type EditAction = "up" | "down" | "cw" | "ccw" | "duplicate" | "delete";

export type Edit =
  | {
      action: "delete" | "cw" | "ccw";
      pages: number[];
    }
  | {
      action: "move" | "duplicate";
      pages: number[];
      position: number;
    };
