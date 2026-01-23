import { createRequire } from "module";
const require = createRequire(import.meta.url);

const pdfParseModule = require("pdf-parse");

console.log("=== PDF-PARSE MODULE DEBUG ===");
console.log("Type:", typeof pdfParseModule);
console.log("Constructor:", pdfParseModule.constructor?.name);
console.log("Keys:", Object.keys(pdfParseModule));
console.log("Is function?:", typeof pdfParseModule === "function");
console.log("Has default?:", pdfParseModule.default !== undefined);
console.log("Module:", pdfParseModule);
