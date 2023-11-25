const languageCodes = import.meta.env.DC_LANGUAGE_CODES.split("|");
const languageNames = import.meta.env.DC_LANGUAGE_NAMES.split("|");
export const defaultLanguage = import.meta.env.DC_DEFAULT_LANGUAGE;

function makeLanguagePairs(codes, names) {
  const results = [];
  for (let i = 0; i < codes.length; i++) {
    results.push([codes[i], names[i]]);
  }
  results.sort((a, b) => (a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0));
  return results;
}

export const languages = makeLanguagePairs(languageCodes, languageNames);

const textractLanguageCodes = ["eng", "spa", "ita", "por", "fra", "deu"];
export const textractLanguages = languages.filter(
  (l) => textractLanguageCodes.indexOf(l[0]) != -1,
);
