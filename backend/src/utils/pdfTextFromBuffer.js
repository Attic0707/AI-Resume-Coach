// src/utils/pdfTextFromBuffer.js
const PDFParser = require("pdf2json");

function extractTextFromPdfBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      reject(errData.parserError || errData);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        const pages = pdfData?.formImage?.Pages || [];
        const lines = [];

        pages.forEach((page) => {
          page.Texts.forEach((t) => {
            const txt = (t.R || [])
              .map((r) => decodeURIComponent(r.T || ""))
              .join("");
            lines.push(txt);
          });
          lines.push(""); // blank line between pages
        });

        resolve(lines.join("\n"));
      } catch (e) {
        reject(e);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

module.exports = { extractTextFromPdfBuffer };