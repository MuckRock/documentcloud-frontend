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
  errors?: Error[];
  /** Set false for a lightweight viewer that never loads the document PDF. */
  loadPdf?: boolean;
}

interface Options {
  /** Props passed to the component under test. */
  props?: Record<string, unknown>;
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
 *
 * `child` is typed loosely (`Component<any>`): component prop interfaces aren't
 * assignable to `Record<string, unknown>`, and the harness forwards props
 * untyped anyway. Each component still validates its props at render time.
 */
export function renderInViewer(
  child: Component<any>,
  { props = {}, context }: Options,
) {
  return render(ViewerHarness, {
    props: { child, childProps: props, context },
  });
}
