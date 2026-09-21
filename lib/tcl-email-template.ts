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
          <td style="padding:13px 0;border-bottom:1px solid #eadde2;color:#74666c;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;vertical-align:top;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:13px 0 13px 18px;border-bottom:1px solid #eadde2;color:#211b1e;font-size:13px;font-weight:800;text-align:right;vertical-align:top;">
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
<body style="margin:0;padding:0;background:#f8f3f5;font-family:Arial,Helvetica,sans-serif;color:#211b1e;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8f3f5;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border:1px solid #e4d7dc;">
          <tr>
            <td style="padding:0;background:#211b1e;">
              <div style="height:4px;background:#c97b99;font-size:0;line-height:0;">&nbsp;</div>
              <div style="padding:27px 30px 25px;">
                <div style="font-size:10px;letter-spacing:2.2px;font-weight:900;color:#e5a9bf;text-transform:uppercase;">
                  ${escapeHtml(eyebrow)}
                </div>
                <div style="margin-top:9px;font-size:19px;font-weight:900;letter-spacing:-.02em;color:#ffffff;">
                  TCL Systems
                  <span style="color:#c9bfc3;font-weight:700;">&amp; Digitals PH</span>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:34px 30px 30px;">
              <div style="width:32px;height:2px;background:#c97b99;margin-bottom:18px;"></div>
              <h1 style="margin:0 0 13px;font-size:28px;line-height:1.08;letter-spacing:-.035em;color:#211b1e;">
                ${escapeHtml(title)}
              </h1>
              <p style="margin:0;color:#74666c;font-size:14px;line-height:1.75;">
                ${escapeHtml(message)}
              </p>

              ${
                details.length
                  ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;border-top:1px solid #eadde2;">
                      ${detailRows}
                    </table>`
                  : ""
              }

              ${
                buttonLabel && safeButtonUrl
                  ? `<div style="padding-top:28px;">
                      <a href="${escapeHtml(safeButtonUrl)}" style="display:inline-block;padding:14px 19px;background:#30272b;border:1px solid #30272b;color:#ffffff;text-decoration:none;font-size:11px;font-weight:900;letter-spacing:.07em;text-transform:uppercase;">
                        ${escapeHtml(buttonLabel)} &nbsp;&rarr;
                      </a>
                    </div>`
                  : ""
              }

              ${
                note
                  ? `<div style="margin-top:26px;padding:15px 16px;background:#faedf2;border-left:3px solid #c97b99;color:#5f5056;font-size:12px;line-height:1.7;">
                      ${escapeHtml(note)}
                    </div>`
                  : ""
              }
            </td>
          </tr>

          <tr>
            <td style="padding:20px 30px;background:#f7f2f4;border-top:1px solid #e4d7dc;">
              <p style="margin:0;color:#8b7c82;font-size:10px;line-height:1.7;letter-spacing:.02em;">
                AUTOMATED TRANSACTIONAL EMAIL · TCL SYSTEMS &amp; DIGITALS PH<br>
                Keep important order and payment emails for your records.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 0;color:#9b8d92;font-size:10px;text-align:center;">
          &copy; ${new Date().getFullYear()} TCL Systems &amp; Digitals PH
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
