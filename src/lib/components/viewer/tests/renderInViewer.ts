import type { Component } from "svelte";
import type {
  Document,
  DocumentText,
  Maybe,
  Note,
  Nullable,
  ViewerMode,
  Zoom,
} from "$lib/api/types";

import { render } from "@testing-library/svelte";

import ViewerHarness from "./ViewerHarness.svelte";

/** Props ViewerContext accepts, used to seed viewer state for a test. */
export interface ViewerContextProps {
  document: Document;
  mode?: ViewerMode;
  zoom?: Zoom;
  page?: number;
  embed?: boolean;
  note?: Nullable<Note>;
  text?: Promise<Maybe<DocumentText>>;
}

interface Options<Props extends Record<string, unknown>> {
  /** Props passed to the component under test. */
  props?: Props;
  /** Props passed to ViewerContext to seed viewer state. */
  context: ViewerContextProps;
}

/**
 * Render a component inside the real ViewerContext provider.
 *
 * Mirrors the Svelte docs' context component-testing pattern (a wrapper that
 * establishes context before the component under test renders), but wraps the
 * actual ViewerContext so tests exercise the public provider rather than a
 * hand-rolled context stub.
 */
export function renderInViewer<Props extends Record<string, unknown>>(
  child: Component<Props>,
  { props = {} as Props, context }: Options<Props>,
) {
  return render(ViewerHarness, {
    props: { child, childProps: props, context },
  });
}
