import Runs from "./Runs.svelte";

export async function load({ fetch }) {
  return {
    basement: "right",
    basementComponent: Runs,
  };
}
