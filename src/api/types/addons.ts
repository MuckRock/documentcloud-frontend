import type { PageParams } from "./common";

export interface AddOnParams extends PageParams {
  query?: boolean;
  active?: boolean;
  default?: boolean;
  featured?: boolean;
  premium?: boolean;
  category?: string;
  respository?: string;
}
