import { writable, type Writable } from "svelte/store";
import type { Note, ViewerMode } from "../api/types";

export const currentPage: Writable<number> = writable(1);
export const activeNote: Writable<Note> = writable(null);
export const currentMode: Writable<ViewerMode> = writable("document");
