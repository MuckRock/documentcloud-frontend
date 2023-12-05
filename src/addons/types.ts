interface Author {
  name?: string;
  avatar?: string;
}

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
