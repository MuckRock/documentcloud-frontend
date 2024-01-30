export interface Project {
  id: number;
  slug: string;
  title: string;
  user: number;
  created_at: string;
  description: string;
  add_remove_access: boolean;
  private: boolean;
  updated_at: string;
  edit_access: boolean;
  // TODO: Add 'pinned' field on the server
  pinned?: boolean;
}
