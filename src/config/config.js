import * as remote from "./remote.js";
import * as staging from "./staging.js";
import * as production from "./production.js";

import * as env from "$env/static/public";

// these are the only values that change across environments
let DC_BASE = "https://api.dev.documentcloud.org";
let APP_URL = "https://www.dev.documentcloud.org/";
let EMBED_URL = "https://www.dev.documentcloud.org/";
let SQUARELET_BASE = "https://dev.squarelet.com";
let STAFF_ONLY_S3_URL =
  "http://minio.documentcloud.org:9000/minio/documents/documents/$$ID$$/";

if (process.env.NODE_ENV === "remote") {
  DC_BASE = remote.DC_BASE;
  APP_URL = remote.APP_URL;
  EMBED_URL = remote.EMBED_URL;
  SQUARELET_BASE = remote.SQUARELET_BASE;
  STAFF_ONLY_S3_URL = remote.STAFF_ONLY_S3_URL;
}

if (process.env.NODE_ENV === "staging") {
  DC_BASE = staging.DC_BASE;
  APP_URL = staging.APP_URL;
  EMBED_URL = staging.EMBED_URL;
  SQUARELET_BASE = staging.SQUARELET_BASE;
  STAFF_ONLY_S3_URL = staging.STAFF_ONLY_S3_URL;
}

if (process.env.NODE_ENV === "production") {
  DC_BASE = production.DC_BASE;
  APP_URL = production.APP_URL;
  EMBED_URL = production.EMBED_URL;
  SQUARELET_BASE = production.SQUARELET_BASE;
  STAFF_ONLY_S3_URL = production.STAFF_ONLY_S3_URL;
}

export { DC_BASE, APP_URL, EMBED_URL, SQUARELET_BASE, STAFF_ONLY_S3_URL };

// these never change
export const API = "/api/";
export const BASE_API_URL = DC_BASE + API;
export const DC_LOGIN = "/accounts/login/squarelet";
export const DC_LOGOUT = "/accounts/logout/";
export const SQUARELET_SIGNUP = "/accounts/signup/?intent=documentcloud&next=";
export const SIGN_IN_URL = new URL(DC_LOGIN, DC_BASE).toString();
export const SIGN_UP_URL = new URL(SQUARELET_SIGNUP, SQUARELET_BASE).toString();
export const SIGN_OUT_URL = new URL(DC_LOGOUT, DC_BASE).toString();

// @ts-ignore
export const EMBED_MAX_AGE = +env.PUBLIC_EMBED_MAX_AGE || 60 * 60 * 24;

// @ts-ignore
export const PAGE_MAX_AGE = +env.PUBLIC_PAGE_MAX_AGE || 60 * 60 * 24;

// @ts-ignore
export const VIEWER_MAX_AGE = +env.PUBLIC_VIEWER_MAX_AGE || 60 * 60;

export const VERIFICATION_FORM_URL =
  "https://airtable.com/app93Yt5cwdVWTnqn/pagogIhgB1jZTzq00/form";
export const SQUARELET_ORGS_URL =
  "https://accounts.muckrock.com/organizations/";

export const LANGUAGES = [
  ["US English", "en", "🇺🇸"],
  ["Deutsche", "de", "🇩🇪"],
  ["Español", "es", "🇪🇸"],
  ["Français", "fr", "🇫🇷"],
  ["Italiano", "it", "🇮🇹"],
  ["русский", "ru", "🇷🇺"],
  ["українська", "uk", "🇺🇦"],
];

export const CSRF_COOKIE_NAME = "csrftoken";
export const CSRF_HEADER_NAME = "X-CSRFToken";

export const POLL_INTERVAL = 5000;

export const ALLOWED_TAGS = [
  "a",
  "strong",
  "em",
  "b",
  "i",
  "code",
  "pre",
  "p",
  "ol",
  "ul",
  "li",
  "blockquote",
];
export const ALLOWED_ATTR = { a: ["href"] };

/**
 * @type {Array<[string, number]>}
 */
export const IMAGE_WIDTHS_ENTRIES = [
  ["xlarge", 2000],
  ["large", 1000],
  ["normal", 700],
  ["small", 180],
  ["thumbnail", 60],
];

export const IMAGE_WIDTHS = IMAGE_WIDTHS_ENTRIES.sort(
  (a, b) => a[1] - b[1],
).map(([k, v]) => [v, k]);

export const IMAGE_WIDTHS_MAP = new Map(IMAGE_WIDTHS_ENTRIES);

export const DEFAULT_PER_PAGE = 25;
export const MAX_PER_PAGE = 100;

// export const EDIT_BATCH_SIZE = 25; // batching isn't supported yet
export const MAX_EDIT_BATCH = 25;

export const PDF_SIZE_LIMIT = 525336576;
export const PDF_SIZE_LIMIT_READABLE = "500 MB";

export const DOCUMENT_SIZE_LIMIT = 27262976;
export const DOCUMENT_SIZE_LIMIT_READABLE = "25 MB";

export const TOAST_LENGTH = 3000;
export const TOAST_FADE = 800;

export const LEGACY_CUT_OFF = 20000000;

export const HIGHLIGHT_START = "<em>";
export const HIGHLIGHT_END = "</em>";

export const UPLOAD_LIMIT = 1000;
export const UPLOAD_BATCH = 25;
export const UPLOAD_BATCH_DELAY = 1000;
export const GET_BATCH = 25;
export const GET_BATCH_DELAY = 1000;

export const TAG_KEY = "_tag";

export const SPECIAL_VERSION = "Thanks for using DocumentCloud!";
export const SPECIAL_CONTACT =
  "mailto:info@documentcloud.org?subject=DocumentCloud Feedback";
export const TIP_OF_THE_DAY = "tipofday/";
export const LOGIN_ERROR =
  "DocumentCloud is only available to users we have explicitly granted permission.";

export const LANGUAGE_CODES =
  "afr|amh|ara|asm|aze|aze_cyrl|bel|ben|bod|bos|bul|cat|ceb|ces|zho|tra|chr|cym|dan|deu|dzo|ell|eng|enm|epo|est|eus|fas|fin|fra|frk|frm|gle|glg|grc|guj|hat|heb|hin|hrv|hun|iku|ind|isl|ita|ita_old|jav|jpn|kan|kat|kat_old|kaz|khm|kir|kor|kur|lao|lat|lav|lit|mal|mar|mkd|mlt|msa|mya|nep|nld|nor|ori|pan|pol|por|pus|ron|rus|san|sin|slk|slv|spa|spa_old|sqi|srp|srp_latn|swa|swe|syr|tam|tel|tgk|tgl|tha|tir|tur|uig|ukr|urd|uzb|uzb_cyrl|vie|yid".split(
    "|",
  );
export const LANGUAGE_NAMES =
  "Afrikaans|Amharic|Arabic|Assamese|Azerbaijani|Azerbaijani - Cyrillic|Belarusian|Bengali|Tibetan|Bosnian|Bulgarian|Catalan|Cebuano|Czech|Chinese - Simplified|Chinese - Traditional|Cherokee|Welsh|Danish|German|Dzongkha|Greek|English|Middle English|Esperanto|Estonian|Basque|Persian|Finnish|French|German Fraktur|Middle French|Irish|Galician|Ancient Greek|Gujarati|Haitian; Haitian Creole|Hebrew|Hindi|Croatian|Hungarian|Inuktitut|Indonesian|Icelandic|Italian|Italian - Old|Javanese|Japanese|Kannada|Georgian|Georgian - Old|Kazakh|Central Khmer|Kirghiz; Kyrgyz|Korean|Kurdish|Lao|Latin|Latvian|Lithuanian|Malayalam|Marathi|Macedonian|Maltese|Malay|Burmese|Nepali|Dutch; Flemish|Norwegian|Oriya|Panjabi; Punjabi|Polish|Portuguese|Pushto; Pashto|Romanian; Moldavian; Moldovan|Russian|Sanskrit|Sinhala; Sinhalese|Slovak|Slovenian|Spanish; Castilian|Spanish; Castilian - Old|Albanian|Serbian|Serbian - Latin|Swahili|Swedish|Syriac|Tamil|Telugu|Tajik|Tagalog|Thai|Tigrinya|Turkish|Uighur; Uyghur|Ukrainian|Urdu|Uzbek|Uzbek - Cyrillic|Vietnamese|Yiddish".split(
    "|",
  );
export const DEFAULT_LANGUAGE = "eng";

export const LANGUAGE_MAP = LANGUAGE_CODES.reduce((m, code, i) => {
  m.set(code, LANGUAGE_NAMES[i]);
  return m;
}, new Map());

export const DOCUMENT_TYPES =
  "123,602,abw,agd,bmp,cdr,cgm,cmx,csv,cwk,dbf,dif,doc,docx,dot,emf,eps,fb2,fhd,fodg,fodp,fods,fodt,gif,gnm,gnumeric,htm,html,hwp,jpeg,jpg,jtd,jtt,key,kth,mml,numbers,odb,odf,odg,odp,ods,odt,p65,pages,pbm,pcd,pct,pcx,pdf,pgm,plt,pm3,pm4,pm5,pm6,pmd,png,pot,ppm,pps,ppt,pptx,psd,pub,qxp,ras,rlf,rtf,sda,sdc,sdd,sdp,sdw,sgf,sgl,sgv,slk,stc,std,sti,stw,svg,svm,sxc,sxd,sxi,sxm,sxw,tga,tif,tiff,txt,uof,uop,uos,uot,vor,vsd,wb2,wdb,wk1,wk3,wk4,wks,wpd,wps,wq1,wq2,wri,xbm,xls,xlsx,xlt,xlw,xml,xpm,zabw,zmf".split(
    ",",
  );

export const DOCUMENT_TITLE_CHAR_LIMIT = 1000;
export const DOCUMENT_DESCRIPTION_CHAR_LIMIT = 4000;
export const DOCUMENT_SOURCE_CHAR_LIMIT = 1000;
export const RELATED_ARTICLE_URL_CHAR_LIMIT = 1024;
export const PUBLISHED_URL_CHAR_LIMIT = 1024;

export const PROJECT_DESCRIPTION_CHAR_LIMIT = 1000;
export const PROJECT_TITLE_CHAR_LIMIT = 255;

export const NOTE_TITLE_CHAR_LIMIT = 500;
export const NOTE_CONTENT_CHAR_LIMIT = 2000;
export const SECTION_TITLE_CHAR_LIMIT = 200;

export const PROJECT_REDIRECT_HASH_URL =
  "https://s3.amazonaws.com/s3.documentcloud.org/legacy/project_redirects.bin";
export const ORG_REDIRECT_HASH_URL =
  "https://s3.amazonaws.com/s3.documentcloud.org/legacy/org_redirects.bin";

export const DEFAULT_ORDERING = "-created_at";

export const USER_EXPAND = "user";
export const ORG_EXPAND = "organization";
export const DEFAULT_EXPAND = [USER_EXPAND, ORG_EXPAND].join(",");
