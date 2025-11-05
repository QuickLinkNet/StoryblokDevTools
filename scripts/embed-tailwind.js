const fs = require("fs");
const path = require("path");

const cssPath = path.resolve("components/storyblok/tailwind-compiled.css");
const outPath = path.resolve("components/storyblok/tailwind-css.ts");

let css = fs.readFileSync(cssPath, "utf8");

// 🧹 Normalize a few patterns Tailwind's minifier produces so the CSS stays readable
const sanitizers = [
  // keep a space before !important for clarity
  { regex: /(\S)!important/g, replacement: "$1 !important" },
  // ensure closing braces stay spaced
  { regex: /;}/g, replacement: "; }" },
  // add a space before custom property declarations so `;--foo` looks valid
  { regex: /;--/g, replacement: "; --" },
  // guard against empty custom property declarations losing their semicolon
  { regex: /: }/g, replacement: ": ; }" },
];

sanitizers.forEach(({ regex, replacement }) => {
  css = css.replace(regex, replacement);
});

// write the cleaned CSS back to disk so the compiled file matches the embedded string
fs.writeFileSync(cssPath, css, "utf8");

// in ein TS-Modul schreiben (JSON.stringify vermeidet Escape-Probleme)
const content = `export const TAILWIND_CSS = ${JSON.stringify(css)};\n`;

fs.writeFileSync(outPath, content, "utf8");

console.log("✅ Tailwind CSS normalisiert und in tailwind-css.ts eingebettet");
