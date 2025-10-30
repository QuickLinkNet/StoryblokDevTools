const fs = require("fs");
const path = require("path");

const cssPath = path.resolve("components/storyblok/tailwind-compiled.css");
const outPath = path.resolve("components/storyblok/tailwind-css.ts");

let css = fs.readFileSync(cssPath, "utf8");

// 🛠 Fix: sorge dafür, dass "!important" immer korrekt mit Space geschrieben wird
css = css.replace(/(\S)!important/g, "$1 !important");

// Optional: normalize closing braces
css = css.replace(/;}/g, "; }");

// in ein TS-Modul schreiben
const content = `export const TAILWIND_CSS = \`${css}\`;\n`;

fs.writeFileSync(outPath, content, "utf8");

console.log("✅ Tailwind CSS eingebettet in tailwind-css.ts");
