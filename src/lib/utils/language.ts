// handle language parsing here so we can test it

export function getLanguage(code: string, fallback: string = "en") {
  const [language, ...tags] = code.split("-");
  return language || fallback;
}
