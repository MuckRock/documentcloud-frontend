import type { PageParams } from "./common";

/**
 * @deprecated
 */
export interface AddOnParams extends PageParams {
  query?: string;
  active?: boolean;
  default?: boolean;
  featured?: boolean;
  premium?: boolean;
  category?: string;
  repository?: string;
}
