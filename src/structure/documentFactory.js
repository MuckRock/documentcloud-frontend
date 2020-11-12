import { Document } from './document';

let id = 1;

export function makeDocument(options = {}) {
  return new Document({
    access: options.access || "private",
    asset_url: options.asset_url || (process.env.DC_BASE + '/files/'),
    created_at: options.created_at || "2020-01-01T00:00:00.000Z",
    data: options.data || {},
    highlights: options.highlights || null,
    id: options.id || id++,
    language: options.language || "eng",
    organization: {
      avatar_url: options.org_avatar_url || "",
      id: options.org_id || 1,
      individual: options.org_individual || false,
      name: options.org_name || "test org",
      slug: options.org_slug || "test_org",
      uuid: options.org_uuid || "00000000-0000-0000-0000-000000000000",
    },
    page_count: options.page_count || 1,
    slug: options.slug || "test_doc",
    status: options.status || "success",
    title: options.title || "test doc",
    updated_at: options.updated_at || "2020-01-01T00:00:00.000Z",
    user: {
      avatar_url: options.user_avatar_url || "",
      id: options.user_id || 1,
      name: options.user_name || "test user",
      organization: options.org_id || 1,
      organizations: options.user_organizations || [1],
      username: options.username || "testuser",
      uuid: options.user_uuid || "00000000-0000-0000-0000-000000000000",
    },
    projects: options.projects || []
  })
}
