/**
 * API response types
 *
 * This is a separate module from what's in src/api to prevent conflicts.
 * Both modules can be merged later.
 * */

import type { User, Org } from "../../api/types/orgAndUser";
import type { Project } from "../../api/types/project";
import type { Page } from "../../api/types/common";

export type access = "public" | "private" | "organization"; // https://www.documentcloud.org/help/api#access-levels

export type status = "success" | "readable" | "pending" | "error" | "nofile"; // https://www.documentcloud.org/help/api#statuses

export type sizes = "thumbnail" | "small" | "normal" | "large" | "xlarge";

// https://www.documentcloud.org/help/api#documents
export interface Document {
  id: number;
  access: access;
  admin_noindex: boolean;
  asset_url: string | URL;
  canonical_url: string | URL;
  created_at: string | Date;
  data: Record<string, string[]>;
  description: string;
  edit_access: boolean;
  file_hash: string;
  noindex: boolean;
  language: string;
  organization: number | Org;
  original_extension: string;
  page_count: number;
  page_spec: string;
  projects: number[] | Project[];
  publish_at: string | null;
  published_url: string | URL;
  related_article: string | URL;
  revision_control: boolean;
  slug: string;
  source: string;
  status: status;
  title: string;
  updated_at: string | Date;
  user: number | User;
}

export type DocumentResults = Page<Document>;

export interface Note {
  id: number;
  user: number | User;
  organization: number | Org;
  page_number: number;
  access: access;
  edit_access: boolean;
  title: string;
  content: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  created_at: string | Date;
  updated_at: string | Date;
}

export type NoteResults = Page<Note>;

export interface Section {
  id: number;
  page_number: number;
  title: string;
}

export type SectionResults = Page<Section>;

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

export type ProjectMembershipList = Page<ProjectMembershipItem>;
