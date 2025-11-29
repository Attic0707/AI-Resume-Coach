// app/utils/templates.js

export function buildResumeHtml({ content, template = "classic", title = "Resume" }) {
  // `content` is your plain text (optimized resume or tailored resume)

  const safeContent = (content || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("");

  const baseStyles = `
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin: 32px;
      color: #111827;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 12px;
    }
    .section {
      margin-bottom: 16px;
    }
    p {
      font-size: 13px;
      line-height: 1.5;
      margin: 0 0 6px 0;
    }
  `;

  let extraStyles = "";
  if (template === "modern") {
    extraStyles = `
      body {
        background: #f3f4f6;
      }
      .card {
        background: #ffffff;
        border-radius: 12px;
        padding: 20px 24px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
      }
      h1 {
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }
    `;
  } else if (template === "minimal") {
    extraStyles = `
      body {
        font-family: "Georgia", serif;
      }
      h1 {
        text-transform: uppercase;
        letter-spacing: 0.25em;
      }
      .divider {
        height: 1px;
        background: #e5e7eb;
        margin: 12px 0 24px 0;
      }
    `;
  }

  const wrapperStart =
    template === "modern"
      ? `<div class="card">`
      : `<div class="section">`;
  const wrapperEnd = `</div>`;

  const maybeDivider =
    template === "minimal" ? `<div class="divider"></div>` : ``;

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${baseStyles}${extraStyles}</style>
      </head>
      <body>
        ${wrapperStart}
          <h1>${title}</h1>
          ${maybeDivider}
          ${safeContent}
        ${wrapperEnd}
      </body>
    </html>
  `;
}