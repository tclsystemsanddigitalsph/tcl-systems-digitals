type EmailDetail = {
  label: string;
  value: string;
};

type TclEmailShellInput = {
  eyebrow?: string;
  title: string;
  message: string;
  details?: EmailDetail[];
  buttonLabel?: string;
  buttonUrl?: string;
  note?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function tclEmailShell({
  eyebrow = "TCL SYSTEMS & DIGITALS PH",
  title,
  message,
  details = [],
  buttonLabel,
  buttonUrl,
  note,
}: TclEmailShellInput) {
  const safeButtonUrl =
    buttonUrl && /^https?:\/\//i.test(buttonUrl) ? buttonUrl : undefined;

  const detailRows = details
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:11px 0;border-bottom:1px solid #f1e5e9;color:#8b737c;font-size:12px;font-weight:700;vertical-align:top;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:11px 0 11px 18px;border-bottom:1px solid #f1e5e9;color:#332a2e;font-size:13px;font-weight:800;text-align:right;vertical-align:top;">
            ${escapeHtml(value)}
          </td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#fff7fa;font-family:Arial,Helvetica,sans-serif;color:#332a2e;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff7fa;">
    <tr>
      <td align="center" style="padding:34px 14px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border:1px solid #efdce3;border-radius:22px;overflow:hidden;box-shadow:0 10px 30px rgba(99,63,76,.08);">
          <tr>
            <td style="padding:30px 32px 22px;background:#fffafb;border-bottom:1px solid #f2e3e8;text-align:center;">
              <div style="font-size:11px;letter-spacing:2px;font-weight:800;color:#b27d90;">
                ${escapeHtml(eyebrow)}
              </div>
              <div style="margin-top:8px;font-size:15px;font-weight:800;color:#4c3940;">
                TCL Systems &amp; Digitals PH
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#34292d;">
                ${escapeHtml(title)}
              </h1>

              <p style="margin:0;color:#6f5c63;font-size:14px;line-height:1.75;">
                ${escapeHtml(message)}
              </p>

              ${
                details.length
                  ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:25px;padding:5px 20px;background:#fffafb;border:1px solid #f0e0e6;border-radius:16px;">
                      ${detailRows}
                    </table>`
                  : ""
              }

              ${
                buttonLabel && safeButtonUrl
                  ? `<div style="padding-top:28px;text-align:center;">
                      <a href="${escapeHtml(safeButtonUrl)}" style="display:inline-block;padding:13px 24px;background:#b77f93;color:#ffffff;text-decoration:none;border-radius:12px;font-size:13px;font-weight:800;">
                        ${escapeHtml(buttonLabel)} &rarr;
                      </a>
                    </div>`
                  : ""
              }

              ${
                note
                  ? `<div style="margin-top:25px;padding:14px 16px;background:#fff7fa;border-left:3px solid #d7a9b9;border-radius:9px;color:#765f68;font-size:12px;line-height:1.65;">
                      ${escapeHtml(note)}
                    </div>`
                  : ""
              }
            </td>
          </tr>

          <tr>
            <td style="padding:20px 30px;background:#fffafb;border-top:1px solid #f2e3e8;text-align:center;">
              <p style="margin:0;color:#9a858d;font-size:11px;line-height:1.7;">
                This is an automated transactional email from TCL Systems &amp; Digitals PH.<br>
                Please keep important order and payment emails for your records.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:18px 0 0;color:#aa939c;font-size:10px;text-align:center;">
          &copy; ${new Date().getFullYear()} TCL Systems &amp; Digitals PH
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
