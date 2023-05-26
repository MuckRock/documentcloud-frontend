import type {AddOnListItem} from '../AddOnListItem.svelte';

export const loadedData: AddOnListItem[] = [
  {
    pinned: true,
    id: "muckrock/documentcloud-addon-scraper",
    title: "Scraper",
    description: "This add-on will scrape and optionally crawl a given site for documents to upload to DocumentCloud. It can also alert you of given keywords appearing in those documents.",
    author: {
      name: "MuckRock",
    },
    usage: 255100
  },
  {
    pinned: false,
    id: "muckrock/documentcloud-addon-import-documents",
    title: "Import Documents",
    description: "This add on allows you to submit a public Dropbox, Google Drive, WeTransfer, or MediaFire link and automatically upload it to DocumentCloud. Note that for now mostly only PDFs are functioning. In the future all 70 file extension types will be supported.",
    author: {
      name: "MuckRock",
    },
    usage: 123456,
  },
  {
    pinned: false,
    id: "muckrock/documentcloud-addon-bad-redactions",
    title: "Bad Redactions",
    description: "This Add-on allows you to select multiple documents, uses x-ray library to identify bad redactions, creates annotations where bad redactions exist, and exports document_ids, page numbers, bounding boxes and the text in a csv file.",
    author: {
      name: "MuckRock",
    },
    usage: 45459,
  }
]