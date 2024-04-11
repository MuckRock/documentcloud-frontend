import type { Actions } from "./$types";
import type {
  Access,
  Document,
  DocumentUpload,
  OCREngine,
  Project,
} from "$lib/api/types";

import { CSRF_COOKIE_NAME, DEFAULT_LANGUAGE } from "@/config/config.js";
import * as documents from "$lib/api/documents";
import { unwrap } from "$lib/components/inputs/Select.svelte";

export const actions = {
  default: async ({ request, cookies, fetch }) => {
    const csrf_token = cookies.get(CSRF_COOKIE_NAME);
    const form = await request.formData();

    // one per file
    const files = Array.from(form.getAll("uploads")) as File[];
    const titles = form.getAll("title") as string[];
    const filenames = form.getAll("filename") as string[];

    // one per batch
    const access = form.get("access") as Access;

    // value is a JSON string
    const ocr_engine: OCREngine = unwrap(form.get("ocr_engine") as string);
    const force_ocr = Boolean(form.get("force_ocr"));
    const revision_control = Boolean(form.get("revision_control"));
    const projects = unwrap(form.get("projects") as string, []);
    const language = unwrap(form.get("language") as string, DEFAULT_LANGUAGE);

    // put things together
    const docs: DocumentUpload[] = titles.map((title, i) => {
      return {
        title,
        access,
        language,
        projects: projects.map((p: Project) => p.id),
        revision_control,
      };
    });

    let created: Document[];
    try {
      created = await documents.create(docs, csrf_token, fetch);
    } catch (err) {
      return {
        success: false,
        error: err,
      };
    }

    // upload
    const uploads = created.map((d, i) => ({
      id: d.id,
      presigned_url: new URL(d.presigned_url),
      file: files[i],
    }));

    // todo: handle retries and errors
    const upload_responses = await documents.upload(uploads, fetch);

    console.log(upload_responses.map((r) => r.status));

    // process
    const process_response = await documents.process(
      created.map((d) => ({
        id: d.id,
        force_ocr,
        ocr_engine: ocr_engine.value,
      })),
      csrf_token,
      fetch,
    );

    // todo: i18n
    const message = process_response.ok
      ? `Uploaded ${created.length} documents`
      : process_response.statusText;

    return {
      success: true,
      message,
    };
  },
} satisfies Actions;
