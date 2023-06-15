import type { AddOnListItem } from "../browser/AddOnListItem.svelte";

export const loadedData: AddOnListItem[] = [
  {
    id: 105,
    active: true,
    repository: "muckrock/documentcloud-addon-scraper",
    name: "Scraper",
    author: {
      name: "MuckRock",
    },
    usage: 255100,
    parameters: {
      description:
        "This add-on will scrape and optionally crawl a given site for documents to upload to DocumentCloud. It can also alert you of given keywords appearing in those documents.",
    },
  },
  {
    id: 170,
    active: false,
    repository: "MuckRock/cloud-upload-addon",
    name: "Import Documents",
    author: {
      name: "MuckRock",
    },
    usage: 123456,
    parameters: {
      description:
        "This add on allows you to submit a public Dropbox, Google Drive, WeTransfer, or MediaFire link and automatically upload it to DocumentCloud. Note that for now mostly only PDFs are functioning. In the future all 70 file extension types will be supported.",
    },
  },
  {
    id: 451,
    active: false,
    repository: "MuckRock/documentcloud-bad-redactions-addon",
    name: "Bad Redactions",
    author: {
      name: "MuckRock",
    },
    usage: 45459,
    parameters: {
      description:
        "This Add-on allows you to select multiple documents, uses x-ray library to identify bad redactions, creates annotations where bad redactions exist, and exports document_ids, page numbers, bounding boxes and the text in a csv file.",
    },
  },
];
