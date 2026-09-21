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

function renderMessage(message: string) {
  const normalized = message.replace(/\r\n/g, "\n").trim();

  if (!normalized) return "";

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => {
      const safeParagraph = escapeHtml(paragraph).replace(/\n/g, "<br>");
      return `<p style="margin:0 0 18px;color:#62565b;font-size:14px;line-height:1.8;">${safeParagraph}</p>`;
    })
    .join("");
}

function emailPurpose(title: string) {
  const cleaned = title
    .replace(/^TCL Systems & Digitals PH\s*[-–—:]\s*/i, "")
    .trim();

  return cleaned || title;
}

export function tclEmailShell({
  eyebrow = "CLIENT NOTIFICATION",
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
          <td style="padding:13px 0;border-bottom:1px solid #eadfe3;color:#9a8990;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;vertical-align:top;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:13px 0 13px 20px;border-bottom:1px solid #eadfe3;color:#211b1e;font-size:13px;font-weight:800;text-align:right;vertical-align:top;">
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

<body style="margin:0;padding:0;background:#f3eff1;font-family:Arial,Helvetica,sans-serif;color:#211b1e;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f3eff1;">
    <tr>
      <td align="center" style="padding:34px 12px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:#ffffff;border:1px solid #e4dadd;">

          <!-- BRAND MASTHEAD -->
          <tr>
            <td style="padding:24px 30px 22px;background:#211b1e;border-bottom:4px solid #c97b99;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td valign="middle">
                    <div style="color:#ffffff;font-size:19px;font-weight:900;letter-spacing:-.03em;line-height:1.15;">
                      TCL Systems
                      <span style="color:#d8cbd0;font-weight:500;">&amp; Digitals PH</span>
                    </div>
                    <div style="margin-top:6px;color:#a999a0;font-size:9px;font-weight:700;letter-spacing:1.7px;text-transform:uppercase;">
                      Websites / Systems / Digital Solutions
                    </div>
                  </td>

                  <td align="right" valign="middle" style="padding-left:16px;">
                    <div style="color:#e5a9bf;font-size:9px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;">
                      TCL / 2026
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- EMAIL PURPOSE -->
          <tr>
            <td align="center" style="padding:38px 30px 0;text-align:center;">
              <div style="color:#b26a85;font-size:9px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;">
                ${escapeHtml(eyebrow)}
              </div>

              <h1 style="margin:10px auto 0;max-width:520px;color:#211b1e;font-size:29px;line-height:1.12;font-weight:900;letter-spacing:-.04em;text-align:center;">
                ${escapeHtml(emailPurpose(title))}
              </h1>

              <div style="width:34px;height:2px;margin:18px auto 0;background:#c97b99;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- MESSAGE -->
          <tr>
            <td style="padding:28px 30px 4px;">
              <div style="max-width:555px;">
                ${renderMessage(message)}
              </div>
            </td>
          </tr>

          ${
            details.length
              ? `
          <!-- TRANSACTION SUMMARY -->
          <tr>
            <td style="padding:12px 30px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:0 0 10px;border-bottom:2px solid #211b1e;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="color:#211b1e;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;">
                          Transaction Summary
                        </td>
                        <td align="right" style="color:#c97b99;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;">
                          TCL / Record
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${detailRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ""
          }

          ${
            buttonLabel && safeButtonUrl
              ? `
          <!-- PRIMARY ACTION -->
          <tr>
            <td align="center" style="padding:30px 30px 2px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td align="center" valign="middle" style="background:#30272b;text-align:center;">
                    <a href="${escapeHtml(safeButtonUrl)}" style="display:inline-block;min-width:190px;padding:15px 22px;color:#ffffff;text-decoration:none;font-size:10px;line-height:1.35;font-weight:900;letter-spacing:.8px;text-transform:uppercase;text-align:center;white-space:nowrap;">
                      ${escapeHtml(buttonLabel)} &nbsp;&rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ""
          }

          ${
            note
              ? `
          <!-- IMPORTANT -->
          <tr>
            <td style="padding:25px 30px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fbf0f4;border:1px solid #e4b9c8;">
                <tr>
                  <td style="width:4px;background:#c15f7f;font-size:0;line-height:0;">&nbsp;</td>
                  <td style="padding:15px 17px;">
                    <div style="margin-bottom:6px;color:#9f3f60;font-size:9px;font-weight:900;letter-spacing:1.3px;text-transform:uppercase;">
                      Important
                    </div>
                    <div style="color:#684f58;font-size:11px;line-height:1.7;">
                      ${escapeHtml(note)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ""
          }

          <!-- SUPPORT -->
          <tr>
            <td style="padding:28px 30px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #eadfe3;">
                <tr>
                  <td style="padding-top:18px;color:#8a7b81;font-size:10px;line-height:1.7;">
                    Questions or concerns?
                    <a href="https://t.me/tclsystemsanddigitalsph" style="color:#a45f79;font-weight:800;text-decoration:none;">
                      Contact TCL Systems &amp; Digitals PH on Telegram
                    </a>.
                    This inbox is used for notifications only.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 30px;background:#211b1e;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td valign="middle">
                    <div style="color:#ffffff;font-size:10px;font-weight:900;letter-spacing:.04em;">
                      TCL SYSTEMS &amp; DIGITALS PH
                    </div>
                    <div style="margin-top:5px;color:#9f9096;font-size:9px;line-height:1.55;">
                      Digital systems built for real businesses.
                    </div>
                  </td>

                  <td align="right" valign="middle" style="padding-left:16px;">
                    <div style="color:#e5a9bf;font-size:8px;font-weight:900;letter-spacing:1.25px;text-transform:uppercase;">
                      Notification / Record
                    </div>
                    <div style="margin-top:5px;color:#8f8086;font-size:8px;">
                      Keep this email for your records.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <div style="margin:15px 0 0;color:#a19499;font-size:9px;line-height:1.6;text-align:center;">
          &copy; ${new Date().getFullYear()} TCL Systems &amp; Digitals PH
        </div>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
