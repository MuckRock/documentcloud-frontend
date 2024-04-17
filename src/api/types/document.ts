import type { Nullable } from "./common";
import type { Org, User } from "./orgAndUser";
import type { Project } from "./project";

export type DocumentAccess = "public" | "organization" | "private";

export type DocumentStatus =
  | "success"
  | "readable"
  | "pending"
  | "error"
  | "nofile";

export interface DocumentRevision {
  version: number;
  user: number;
  created_at: string;
  comment: string;
  url: string;
}

export interface Document {
  id: number;
  access: DocumentAccess;
  admin_noindex: boolean;
  asset_url: string;
  canonical_url: string;
  created_at: string;
  data: Record<string, string[]>;
  description: string;
  edit_access: boolean;
  file_hash: string;
  noindex: boolean;
  language: string;
  organization: Org | number;
  original_extension: string;
  page_count: number;
  page_spec: string;
  projects: (Project | number)[];
  notes?: [];
  sections?: [];
  publish_at: Nullable<string>;
  published_url: string;
  related_article: string;
  revision_control: boolean;
  revisions?: DocumentRevision[];
  slug: string;
  source: string;
  status: DocumentStatus;
  title: string;
  updated_at: string;
  user: User | number;
}
