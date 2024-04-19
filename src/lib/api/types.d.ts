/**
 * API response types
 *
 * This is a separate module from what's in src/api to prevent conflicts.
 * Both modules can be merged later.
 * */

import type { User, Org } from "@/api/types/orgAndUser";
import type { Project } from "@/api/types/project";
import type { Page } from "@/api/types/common";

export type Access = "public" | "private" | "organization"; // https://www.documentcloud.org/help/api#access-levels

export type Data = Record<string, string[]>;

export type Status = "success" | "readable" | "pending" | "error" | "nofile"; // https://www.documentcloud.org/help/api#statuses

export type Sizes = "thumbnail" | "small" | "normal" | "large" | "xlarge";

export type Highlights = Record<string, string[]>;

type AddOnCategory = "premium" | string;

interface AddOnProperty {
  type: string;
  title: string;
  description?: string;
  default?: string;
  format?: string;
  enum?: string[];
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
    price: number;
    unit: string;
  };
  eventOptions: {
    name: string;
    events: string[];
  };
}

// API endpoint https://api.www.documentcloud.org/api/addons/
export interface AddOnListItem {
  id: number;
  user: number;
  organization: number;
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
  updated_at: string | Date;
  user: number | User;

  // for uploads
  presigned_url?: string | URL;
  file_url?: string | URL;

  // expandable relationship fields
  projects?: number[] | Project[];
  notes?: Note[];
  sections?: Section[];

  // present in search results when query includes hl=true
  highlights?: Highlights;
  note_highlights?: Record<string, Highlights[]>;
}

export interface DocumentResults extends Page<Document> {}

export interface Note {
  id: number | string;
  user: number | User;
  organization: number | Org;
  page_number: number;
  access: Access;
  edit_access?: boolean;
  title: string;
  content?: string;
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
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

// re-export for consistency
export type { Project };

export type ProjectResults = Page<Project>;

export interface ProjectMembershipItem {
  document: number | Document;
  edit_access: boolean;
}

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

export type ProjectMembershipList = Page<ProjectMembershipItem>;
