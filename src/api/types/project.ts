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
