export const THEME_STORAGE_KEY = "bw-theme";

/// Runs before first paint so the correct theme is stamped on <html> without a
/// flash. Kept as a raw string: it must execute synchronously in <head>,
/// before React hydrates.
const script = `(function(){try{
var k=${JSON.stringify(THEME_STORAGE_KEY)};
var s=localStorage.getItem(k);
var m=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
document.documentElement.dataset.theme=(s==="light"||s==="dark")?s:m;
}catch(e){document.documentElement.dataset.theme="light";}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
