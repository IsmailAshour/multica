export type TextDirection = "ltr" | "rtl";

const RTL_LANGUAGES = new Set(["ar", "fa", "he", "ur"]);

/** Accepts any BCP-47 tag or resource key, e.g. `ar`, `ar-SA`, `zh-Hans`. */
export function getDir(locale: string): TextDirection {
  const language = locale.split("-")[0]?.toLowerCase() ?? "";
  return RTL_LANGUAGES.has(language) ? "rtl" : "ltr";
}
