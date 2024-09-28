import type { Run } from "@/addons/types";

export const progress: Run[] = [
  {
    uuid: "45306c6d-eece-43c2-9db5-77caa28da24d",
    addon: {
      id: 105,
      user: 20080,
      organization: 125,
      access: "public",
      name: "Scraper",
      repository: "MuckRock/documentcloud-scraper-addon",
      parameters: {
        type: "object",
        title: "Scraper",
        required: ["site", "project"],
        categories: ["monitor"],
        properties: {
          site: {
            type: "string",
            title: "Site",
            format: "uri",
            description: "The URL of the site to start scraping",
          },
          project: {
            type: "string",
            title: "Project",
            description:
              "The DocumentCloud project title or ID of the project the documents should be uploaded to.  If the project title does not exist, it will be created.",
          },
          filecoin: {
            type: "boolean",
            title: "Push to IPFS/Filecoin",
            description:
              "WARNING: This will push all scraped files to IPFS and Filecoin.   There is no way to remove files from these storage systems.",
          },
          keywords: {
            type: "string",
            title: "Keywords",
            description: "Keywords to search and notify on (comma separated)",
          },
          notify_all: {
            type: "boolean",
            title: "Notify on all new documents",
          },
          crawl_depth: {
            type: "integer",
            title: "Crawl Depth",
            default: 0,
            maximum: 2,
            minimum: 0,
            description:
              "Recursively scrape same-domain links found on the page (Must be between 0 and 2)",
          },
          access_level: {
            enum: ["public", "organization", "private"],
            type: "string",
            title: "Access Level",
            default: "public",
            description: "Access level of documents scraped.",
          },
          slack_webhook: {
            type: "string",
            title: "Slack Webhook",
            format: "uri",
            description: "Enter a slack webhook to enable Slack notifications",
          },
        },
        description:
          "<p>Scrape and optionally crawl a given site for documents to upload to DocumentCloud.</p>",
        eventOptions: {
          name: "site",
          events: ["hourly", "daily", "weekly"],
        },
        instructions:
          "<p>You may specify a project to scrape the documents into as well as an access level. \nScraper can alert you by email or Slack notification when given keywords appear in\ndocuments if you specify keywords to monitor. For Slack notifications, you must provide a webhook. </p>\n<p>The crawl depth is a parameter that tells the Scraper how many clicks deep away from the\nsite you specify in order to continue looking for documents. \nIf the PDFs are directly linked on the site you provide \n(1 click to get to the PDF), 0 is the crawl depth you should use. \nIf the site you provide a link to contains multiple links to other pages that have PDFs linked to those pages, \nyour crawl depth would be 1. A crawl depth of 2 is the maximum supported. </p>\n<p>The Scraper Add-On now supports Google Drive links. \nIt will upload the first 30 Google Drive documents it sees per run. \nScraper will upload the first 100 regular documents it sees per run. \nThe Scraper keeps track of which documents it has seen and already uploaded.</p>",
        custom_disabled_email_footer:
          "Read about some of the reasons why the Scraper Add-On fails in our guide: https://muckrock.notion.site/Common-reasons-the-Scraper-Add-On-fails-ecd09d1b2e254fee9ff01fad293b61c3?pvs=74\n",
      },
      created_at: "2022-05-17T13:49:53.635344Z",
      updated_at: "2024-09-10T23:44:12.061151Z",
      active: true,
      default: true,
      featured: true,
    },
    user: 1020,
    status: "in_progress",
    progress: 0,
    message: "Checking permissions...",
    file_url: null,
    file_expires_at: null,
    dismissed: false,
    rating: 0,
    comment: "",
    credits_spent: 0,
    created_at: "2024-09-27T01:20:32.810177Z",
    updated_at: "2024-09-27T01:20:52.134042Z",
  },
  {
    uuid: "45306c6d-eece-43c2-9db5-77caa28da24d",
    addon: {
      id: 105,
      user: 20080,
      organization: 125,
      access: "public",
      name: "Scraper",
      repository: "MuckRock/documentcloud-scraper-addon",
      parameters: {
        type: "object",
        title: "Scraper",
        required: ["site", "project"],
        categories: ["monitor"],
        properties: {
          site: {
            type: "string",
            title: "Site",
            format: "uri",
            description: "The URL of the site to start scraping",
          },
          project: {
            type: "string",
            title: "Project",
            description:
              "The DocumentCloud project title or ID of the project the documents should be uploaded to.  If the project title does not exist, it will be created.",
          },
          filecoin: {
            type: "boolean",
            title: "Push to IPFS/Filecoin",
            description:
              "WARNING: This will push all scraped files to IPFS and Filecoin.   There is no way to remove files from these storage systems.",
          },
          keywords: {
            type: "string",
            title: "Keywords",
            description: "Keywords to search and notify on (comma separated)",
          },
          notify_all: {
            type: "boolean",
            title: "Notify on all new documents",
          },
          crawl_depth: {
            type: "integer",
            title: "Crawl Depth",
            default: 0,
            maximum: 2,
            minimum: 0,
            description:
              "Recursively scrape same-domain links found on the page (Must be between 0 and 2)",
          },
          access_level: {
            enum: ["public", "organization", "private"],
            type: "string",
            title: "Access Level",
            default: "public",
            description: "Access level of documents scraped.",
          },
          slack_webhook: {
            type: "string",
            title: "Slack Webhook",
            format: "uri",
            description: "Enter a slack webhook to enable Slack notifications",
          },
        },
        description:
          "<p>Scrape and optionally crawl a given site for documents to upload to DocumentCloud.</p>",
        eventOptions: {
          name: "site",
          events: ["hourly", "daily", "weekly"],
        },
        instructions:
          "<p>You may specify a project to scrape the documents into as well as an access level. \nScraper can alert you by email or Slack notification when given keywords appear in\ndocuments if you specify keywords to monitor. For Slack notifications, you must provide a webhook. </p>\n<p>The crawl depth is a parameter that tells the Scraper how many clicks deep away from the\nsite you specify in order to continue looking for documents. \nIf the PDFs are directly linked on the site you provide \n(1 click to get to the PDF), 0 is the crawl depth you should use. \nIf the site you provide a link to contains multiple links to other pages that have PDFs linked to those pages, \nyour crawl depth would be 1. A crawl depth of 2 is the maximum supported. </p>\n<p>The Scraper Add-On now supports Google Drive links. \nIt will upload the first 30 Google Drive documents it sees per run. \nScraper will upload the first 100 regular documents it sees per run. \nThe Scraper keeps track of which documents it has seen and already uploaded.</p>",
        custom_disabled_email_footer:
          "Read about some of the reasons why the Scraper Add-On fails in our guide: https://muckrock.notion.site/Common-reasons-the-Scraper-Add-On-fails-ecd09d1b2e254fee9ff01fad293b61c3?pvs=74\n",
      },
      created_at: "2022-05-17T13:49:53.635344Z",
      updated_at: "2024-09-10T23:44:12.061151Z",
      active: true,
      default: true,
      featured: true,
    },
    user: 1020,
    status: "in_progress",
    progress: 0,
    message: "Scraping the site...",
    file_url: null,
    file_expires_at: null,
    dismissed: false,
    rating: 0,
    comment: "",
    credits_spent: 0,
    created_at: "2024-09-27T01:20:32.810177Z",
    updated_at: "2024-09-27T01:20:52.842831Z",
  },
  {
    uuid: "45306c6d-eece-43c2-9db5-77caa28da24d",
    addon: {
      id: 105,
      user: 20080,
      organization: 125,
      access: "public",
      name: "Scraper",
      repository: "MuckRock/documentcloud-scraper-addon",
      parameters: {
        type: "object",
        title: "Scraper",
        required: ["site", "project"],
        categories: ["monitor"],
        properties: {
          site: {
            type: "string",
            title: "Site",
            format: "uri",
            description: "The URL of the site to start scraping",
          },
          project: {
            type: "string",
            title: "Project",
            description:
              "The DocumentCloud project title or ID of the project the documents should be uploaded to.  If the project title does not exist, it will be created.",
          },
          filecoin: {
            type: "boolean",
            title: "Push to IPFS/Filecoin",
            description:
              "WARNING: This will push all scraped files to IPFS and Filecoin.   There is no way to remove files from these storage systems.",
          },
          keywords: {
            type: "string",
            title: "Keywords",
            description: "Keywords to search and notify on (comma separated)",
          },
          notify_all: {
            type: "boolean",
            title: "Notify on all new documents",
          },
          crawl_depth: {
            type: "integer",
            title: "Crawl Depth",
            default: 0,
            maximum: 2,
            minimum: 0,
            description:
              "Recursively scrape same-domain links found on the page (Must be between 0 and 2)",
          },
          access_level: {
            enum: ["public", "organization", "private"],
            type: "string",
            title: "Access Level",
            default: "public",
            description: "Access level of documents scraped.",
          },
          slack_webhook: {
            type: "string",
            title: "Slack Webhook",
            format: "uri",
            description: "Enter a slack webhook to enable Slack notifications",
          },
        },
        description:
          "<p>Scrape and optionally crawl a given site for documents to upload to DocumentCloud.</p>",
        eventOptions: {
          name: "site",
          events: ["hourly", "daily", "weekly"],
        },
        instructions:
          "<p>You may specify a project to scrape the documents into as well as an access level. \nScraper can alert you by email or Slack notification when given keywords appear in\ndocuments if you specify keywords to monitor. For Slack notifications, you must provide a webhook. </p>\n<p>The crawl depth is a parameter that tells the Scraper how many clicks deep away from the\nsite you specify in order to continue looking for documents. \nIf the PDFs are directly linked on the site you provide \n(1 click to get to the PDF), 0 is the crawl depth you should use. \nIf the site you provide a link to contains multiple links to other pages that have PDFs linked to those pages, \nyour crawl depth would be 1. A crawl depth of 2 is the maximum supported. </p>\n<p>The Scraper Add-On now supports Google Drive links. \nIt will upload the first 30 Google Drive documents it sees per run. \nScraper will upload the first 100 regular documents it sees per run. \nThe Scraper keeps track of which documents it has seen and already uploaded.</p>",
        custom_disabled_email_footer:
          "Read about some of the reasons why the Scraper Add-On fails in our guide: https://muckrock.notion.site/Common-reasons-the-Scraper-Add-On-fails-ecd09d1b2e254fee9ff01fad293b61c3?pvs=74\n",
      },
      created_at: "2022-05-17T13:49:53.635344Z",
      updated_at: "2024-09-10T23:44:12.061151Z",
      active: true,
      default: true,
      featured: true,
    },
    user: 1020,
    status: "in_progress",
    progress: 0,
    message: "Scraping complete!",
    file_url: null,
    file_expires_at: null,
    dismissed: false,
    rating: 0,
    comment: "",
    credits_spent: 0,
    created_at: "2024-09-27T01:20:32.810177Z",
    updated_at: "2024-09-27T01:21:26.810935Z",
  },
  {
    uuid: "45306c6d-eece-43c2-9db5-77caa28da24d",
    addon: {
      id: 105,
      user: 20080,
      organization: 125,
      access: "public",
      name: "Scraper",
      repository: "MuckRock/documentcloud-scraper-addon",
      parameters: {
        type: "object",
        title: "Scraper",
        required: ["site", "project"],
        categories: ["monitor"],
        properties: {
          site: {
            type: "string",
            title: "Site",
            format: "uri",
            description: "The URL of the site to start scraping",
          },
          project: {
            type: "string",
            title: "Project",
            description:
              "The DocumentCloud project title or ID of the project the documents should be uploaded to.  If the project title does not exist, it will be created.",
          },
          filecoin: {
            type: "boolean",
            title: "Push to IPFS/Filecoin",
            description:
              "WARNING: This will push all scraped files to IPFS and Filecoin.   There is no way to remove files from these storage systems.",
          },
          keywords: {
            type: "string",
            title: "Keywords",
            description: "Keywords to search and notify on (comma separated)",
          },
          notify_all: {
            type: "boolean",
            title: "Notify on all new documents",
          },
          crawl_depth: {
            type: "integer",
            title: "Crawl Depth",
            default: 0,
            maximum: 2,
            minimum: 0,
            description:
              "Recursively scrape same-domain links found on the page (Must be between 0 and 2)",
          },
          access_level: {
            enum: ["public", "organization", "private"],
            type: "string",
            title: "Access Level",
            default: "public",
            description: "Access level of documents scraped.",
          },
          slack_webhook: {
            type: "string",
            title: "Slack Webhook",
            format: "uri",
            description: "Enter a slack webhook to enable Slack notifications",
          },
        },
        description:
          "<p>Scrape and optionally crawl a given site for documents to upload to DocumentCloud.</p>",
        eventOptions: {
          name: "site",
          events: ["hourly", "daily", "weekly"],
        },
        instructions:
          "<p>You may specify a project to scrape the documents into as well as an access level. \nScraper can alert you by email or Slack notification when given keywords appear in\ndocuments if you specify keywords to monitor. For Slack notifications, you must provide a webhook. </p>\n<p>The crawl depth is a parameter that tells the Scraper how many clicks deep away from the\nsite you specify in order to continue looking for documents. \nIf the PDFs are directly linked on the site you provide \n(1 click to get to the PDF), 0 is the crawl depth you should use. \nIf the site you provide a link to contains multiple links to other pages that have PDFs linked to those pages, \nyour crawl depth would be 1. A crawl depth of 2 is the maximum supported. </p>\n<p>The Scraper Add-On now supports Google Drive links. \nIt will upload the first 30 Google Drive documents it sees per run. \nScraper will upload the first 100 regular documents it sees per run. \nThe Scraper keeps track of which documents it has seen and already uploaded.</p>",
        custom_disabled_email_footer:
          "Read about some of the reasons why the Scraper Add-On fails in our guide: https://muckrock.notion.site/Common-reasons-the-Scraper-Add-On-fails-ecd09d1b2e254fee9ff01fad293b61c3?pvs=74\n",
      },
      created_at: "2022-05-17T13:49:53.635344Z",
      updated_at: "2024-09-10T23:44:12.061151Z",
      active: true,
      default: true,
      featured: true,
    },
    user: 1020,
    status: "success",
    progress: 0,
    message: "Scraping complete!",
    file_url: null,
    file_expires_at: null,
    dismissed: false,
    rating: 0,
    comment: "",
    credits_spent: 0,
    created_at: "2024-09-27T01:20:32.810177Z",
    updated_at: "2024-09-27T01:21:26.810935Z",
  },
];
