// pending documents and status

import type { DocumentResults, Pending } from "$lib/api/types";

export const pending: Pending[] = [
  {
    doc_id: 20000033,
    images: 2,
    texts: 2,
    text_positions: 5,
    pages: 11,
  },
  {
    doc_id: 20000067,
    images: 131,
    texts: 131,
    text_positions: 141,
    pages: 151,
  },
  {
    doc_id: 20000069,
    images: 18,
    texts: 18,
    text_positions: 18,
    pages: 151,
  },
];

export const documents: DocumentResults = {
  next: null,
  previous: null,
  results: [
    {
      id: 20000033,
      access: "private",
      admin_noindex: false,
      asset_url: "https://api.dev.documentcloud.org/files/",
      canonical_url:
        "https://www.dev.documentcloud.org/documents/20000033-spanias-kirkvretveit",
      created_at: "2024-04-16T14:17:58.304528Z",
      data: {},
      description:
        "Position before submission? Techniques and tactics in competitive no-gi Brazilian jiu-jitsu.",
      edit_access: true,
      file_hash: "c13eb0b539c70918b3536c321262ee22afc9f2e5",
      noindex: false,
      language: "eng",
      organization: 10001,
      original_extension: "pdf",
      page_count: 11,
      page_spec:
        "594.9599609375x840.9599609375:0;595.3200073242188x841.9200439453125:1-10",
      projects: [],
      publish_at: null,
      published_url: "",
      related_article: "",
      revision_control: false,
      slug: "spanias-kirkvretveit",
      source: "ResearchGate",
      status: "success",
      title: "Spanias Kirkvretveit",
      updated_at: "2024-06-13T14:36:47.078865Z",
      user: 100000,
    },
    {
      id: 20000067,
      access: "private",
      admin_noindex: false,
      asset_url: "https://api.dev.documentcloud.org/files/",
      canonical_url:
        "https://www.dev.documentcloud.org/documents/20000067-amateur-wrestling",
      created_at: "2024-09-25T01:35:35.022558Z",
      data: {},
      description: "",
      edit_access: true,
      file_hash: "",
      noindex: false,
      language: "eng",
      organization: 10000,
      original_extension: "pdf",
      page_count: 151,
      page_spec: "",
      projects: [],
      publish_at: null,
      published_url: "",
      related_article: "",
      revision_control: false,
      slug: "amateur-wrestling",
      source: "",
      status: "pending",
      title: "Amateur Wrestling",
      updated_at: "2024-09-26T17:46:56.313594Z",
      user: 100000,
    },
    {
      id: 20000069,
      access: "organization",
      admin_noindex: false,
      asset_url: "https://api.dev.documentcloud.org/files/",
      canonical_url:
        "https://www.dev.documentcloud.org/documents/20000069-amateur-wrestling",
      created_at: "2024-09-25T01:36:42.734750Z",
      data: {},
      description: "",
      edit_access: true,
      file_hash: "7165ccc534fa96eed4a94304eeeeceb9c714b7f9",
      noindex: false,
      language: "eng",
      organization: 10000,
      original_extension: "pdf",
      page_count: 151,
      page_spec: "",
      projects: [],
      publish_at: null,
      published_url: "",
      related_article: "",
      revision_control: false,
      slug: "amateur-wrestling",
      source: "",
      status: "pending",
      title: "Amateur Wrestling",
      updated_at: "2024-09-25T19:26:47.513889Z",
      user: 100000,
    },
  ],
};