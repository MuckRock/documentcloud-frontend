import { Nullable } from "./common";
import { Org, User } from "./orgAndUser";
import { Project } from "./project";

export type DocumentAccess = "public" | "organization" | "private";

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
  data: Record<string, unknown>;
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
  status: "success" | "failure" | "queued" | "in_progress";
  title: string;
  updated_at: string;
  user: User | number;
}
