import {
  LANGUAGE_CODES,
  LANGUAGE_NAMES,
  DEFAULT_LANGUAGE,
} from "../config/config.js";

export const defaultLanguage = DEFAULT_LANGUAGE;

function makeLanguagePairs(codes, names) {
  const results = [];
  for (let i = 0; i < codes.length; i++) {
    results.push([codes[i], names[i]]);
  }
  results.sort((a, b) => (a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0));
  return results;
}

export const languages = makeLanguagePairs(LANGUAGE_CODES, LANGUAGE_NAMES);

const textractLanguageCodes = ["eng", "spa", "ita", "por", "fra", "deu"];
export const textractLanguages = languages.filter(
  (l) => textractLanguageCodes.indexOf(l[0]) != -1,
);
