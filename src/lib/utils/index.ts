export * from "./api";
export { breadcrumbTrail } from "./navigation";

export function isDefined<T>(x: T | undefined): x is T {
  return typeof x !== "undefined";
}
