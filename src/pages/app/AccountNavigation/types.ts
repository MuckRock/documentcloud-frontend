export type Maybe<T> = T | undefined | null;

export interface Org {
  id: string;
  name: string;
  avatar_url: string;
  individual: boolean;
}

export interface User {
  id: string;
  name: Maybe<string>;
  avatar_url: Maybe<string>;
  username: string;
  organization: string | Org;
  organizations: string[];
  admin_organizations: string[];
}
