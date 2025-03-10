/**
 * API response types
 */

import type { DefinedError } from "ajv";

export type Access = "public" | "private" | "organization"; // https://www.documentcloud.org/help/api#access-levels

export type ProjectAccess = "view" | "edit" | "admin";

export type Data = Record<string, string[]>;

export type Highlights = Record<string, string[]>;

export type Status = "success" | "readable" | "pending" | "error" | "nofile"; // https://www.documentcloud.org/help/api#statuses

export type Sizes = "thumbnail" | "small" | "normal" | "large" | "xlarge";

// modes ending in -ing are writing modes
export type ReadMode = "document" | "text" | "grid" | "notes" | "search";

export type WriteMode = "redacting" | "annotating";

export type ViewerMode = ReadMode | WriteMode;

export type Zoom = number | Sizes | "width" | "height";

export type Maybe<T> = T | undefined;

export type Nullable<T> = T | null;

export interface Page<T> {
  count?: number;
  next: Nullable<string>;
  previous: Nullable<string>;
  results: T[];
  escaped?: boolean;
}

export interface PageParams {
  cursor?: string;
  per_page?: number;
}

export interface APIError<E> {
  status: number;
  message: string;
  errors?: E;
}

/**
 * Wrap an API response so we can pass errors along
 */
export interface APIResponse<T, E = unknown> {
  data?: T;
  error?: APIError<E>;
}

export interface User {
  uuid: string;
  id: number;
  email?: string;
  username: string;
  name: Maybe<string>;
  avatar_url: Maybe<string>;
  organization: number | Org;
  organizations: number[];
  admin_organizations: number[];
  feature_level?: number;
  verified_journalist?: boolean;
  is_staff?: boolean;
}

interface PremiumOrgFields {
  purchased_credits: number;
  monthly_credits: number;
  monthly_credit_allowance: number;
  credit_reset_date: string;
}

export interface Org extends Partial<PremiumOrgFields> {
  uuid: string;
  id: number;
  name: string;
  slug: string;
  avatar_url: string;
  individual?: boolean;
  plan?: "Free" | "Professional" | "Organization";
}

export interface NoteHighlight {
  title: string[];
  description: string[];
}

// https://api.www.documentcloud.org/api/projects/
export interface Project {
  id: number;
  user: number;
  slug: string;
  title: string;
  description: string;
  private: boolean;
  created_at: string;
  updated_at: string;
  edit_access: null | boolean;
  add_remove_access: null | boolean;
  pinned?: boolean;
}

// anything with a box
export interface BBox {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

// subset of document fields only used in uploading
// most fields are optional
export interface DocumentUpload {
  access: Access;
  data?: Data;
  language?: string;
  original_extension?: string;
  noindex?: boolean;
  projects?: number[]; // project ids only
  related_article?: string | URL;
  revision_control?: boolean;
  source?: string;
  title: string;
}

// https://www.documentcloud.org/help/api#revisions
export interface Revision {
  version: number;
  user: number;
  created_at: string;
  comment: string;
  url: string;
}

// https://www.documentcloud.org/help/api#documents
export interface Document {
  id: number | string;
  access: Access;
  admin_noindex?: boolean;
  asset_url: string | URL;
  canonical_url: string | URL;
  created_at: string | Date;
  data: Data;
  description?: string;
  edit_access: boolean;
  file_hash?: string;
  noindex?: boolean;
  language: string;
  organization: number | Org;
  original_extension: string;
  page_count: number;
  page_spec?: string;
  publish_at?: string | null;
  published_url?: string | URL;
  related_article?: string | URL;
  revision_control?: boolean;
  slug: string;
  source?: string;
  status: Status;
  title: string;
  updated_at: string;
  user: number | User;

  // for uploads
  presigned_url?: string | URL;
  file_url?: string | URL;

  // expandable relationship fields
  projects?: (Project | number)[];
  notes?: Note[];
  sections?: Section[];
  revisions?: Revision[];

  // present in search results when query includes hl=true
  highlights?: Highlights;
  note_highlights?: Record<string, NoteHighlight>;
}

export interface DocumentResults extends Page<Document> {}

export interface Note extends BBox {
  id: number | string;
  user: number | User;
  organization: number | Org;
  page_number: number;
  access: Access;
  edit_access?: boolean;
  title: string;
  content?: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export type NoteResults = Page<Note>;

export interface Section {
  id: number | string;
  page_number: number;
  title: string;
}

export type SectionResults = Page<Section>;

export interface SearchOptions {
  hl?: boolean;
  per_page?: number;
  cursor?: string;
  expand?: string;
  version?: number | string;
  project?: number | string;
}

// https://www.documentcloud.org/help/api#filters-1
// filters passed directly to URLSearchParams
// add more as needed
export interface DocumentFilters {
  id__in: string; // comma-separated list
}

export interface OEmbed {
  version: "1.0";
  provider_name: "DocumentCloud";
  provider_url: string | URL;
  cache_age: number;
  title: string;
  width: number;
  heigh: number;
  html: string;
  type: "rich";
}

export type ProjectResults = Page<Project>;

export interface ProjectMembershipItem {
  document: number | Document;
  edit_access: boolean;
}

export interface ProjectUser {
  user: User;
  access: ProjectAccess;
}

export type ProjectMembershipList = Page<ProjectMembershipItem>;

export interface OCREngine {
  value: string;
  label: string;
  help?: string;
}

export interface Pending {
  doc_id: number;
  images: number;
  texts: number;
  text_positions: number;
  pages: number;
}

// See JSON Text https://www.documentcloud.org/help/api/#static-assets
export interface TextPage {
  page: number;
  contents: string;
  ocr: string | null;
  lang: string;
  updated: number; // timestamp
}

export interface DocumentText {
  updated: number; // timestamp
  pages: TextPage[];
}

export interface TextPosition extends BBox {
  text: string;
  upright?: boolean;
  direction?: number;
  metadata?: any;
}

export interface Redaction extends BBox {
  page_number: number;
}

export type Bounds = [number, number, number, number];

export interface DataUpdate {
  values: string[];
  remove?: string[];
}

export interface Flatpage {
  url: string;
  title: string;
  content: string; // Could be HTML or Markdown
}

// known errors
export interface ValidationError extends Record<string, string[]> {}

/** Addons */

type AddOnCategory = "premium" | string;

export interface AddOnParams extends PageParams {
  query?: string;
  active?: boolean;
  default?: boolean;
  featured?: boolean;
  premium?: boolean;
  category?: string;
  repository?: string;
}

interface AddOnProperty {
  type: string;
  title?: string;
  description?: string;
  default?: string | string[] | number;
  format?: string;
  enum?: (string | boolean)[];
  items?: AddOnProperty;
  maximum?: number;
  minimum?: number;
}

interface EventOptions {
  name?: string;
  events: string[];
}

interface AddOnParameters {
  type: string;
  version: number;
  title: string;
  description: string;
  instructions: string;
  categories: AddOnCategory[];
  documents: string[];
  required: string[];
  properties: Record<string, AddOnProperty>;
  cost: {
    amount: number;
    price?: number;
    unit: string;
  };
  eventOptions: EventOptions;
  custom_disabled_email_footer?: string;
}

// API endpoint https://api.www.documentcloud.org/api/addons/
export interface AddOnListItem {
  id: number;
  user: null | number;
  organization: null | number;
  access: "public" | "private";
  name: string;
  repository: string;
  parameters: Partial<AddOnParameters>;
  created_at: string;
  updated_at: string;
  active: boolean;
  featured: boolean;
  default: boolean;
  usage?: number;
}

export type RunStatus =
  | "success"
  | "failure"
  | "queued"
  | "in_progress"
  | "cancelled";

// https://api.www.documentcloud.org/api/addon_runs/?expand=addon
export interface Run {
  uuid: string;
  addon: AddOnListItem;
  user: number;
  status: RunStatus;
  progress: number;
  message: string;
  file_url?: string | null;
  file_expires_at?: string | null;
  dismissed: boolean;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  credits_spent?: number;
}

// https://api.www.documentcloud.org/api/addon_events/?expand=addon
export interface Event {
  id: number;
  addon: AddOnListItem;
  user: number;
  parameters: any;
  event: number;
  scratch: any;
  created_at: string;
  updated_at: string;
}

// payload for creating or scheduling an add-on run
// including the `event` property will schedule runs (or cancel, if it's zero)
// the `documents` and `query` properties tell the add-on what documents to run against
export interface AddOnPayload {
  addon: number;
  parameters: any;
  event?: number;
  documents?: number[] | string[];
  query?: string;
  errors?: DefinedError[];
  valid?: boolean;
}
