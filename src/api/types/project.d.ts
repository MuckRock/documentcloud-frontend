export interface Project {
  id: number;
  user: number;
  slug: string;
  title: string;
  description: string;
  private: boolean;
  created_at: string;
  updated_at: string;
  edit_access: boolean;
  add_remove_access: boolean;
  // TODO: Add 'pinned' field on the server
  pinned?: boolean;
}
