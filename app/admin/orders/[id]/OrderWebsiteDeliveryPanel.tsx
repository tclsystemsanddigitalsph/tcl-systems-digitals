import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { revokeDownloadAccess } from "./actions";
import { uploadWebsiteOrderFile } from "./website-delivery-actions";

const SIMPLE_WEBSITE_SLUG = "simple-business-website-template";
const MAX_DOWNLOADS = 3;

type OrderFile = {
  id: string;
  display_name: string;
  storage_path: string;
  download_count: number | null;
  last_downloaded_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function isExpired(value: string | null) {
  if (!value) return true;

  const timestamp = new Date(value).getTime();

  return !Number.isFinite(timestamp) || timestamp <= Date.now();
}

export default async function OrderWebsiteDeliveryPanel({
  orderId,
  orderNumber,
  productId,
  paymentStatus,
  orderStatus,
  selectedDesignName,
  deliveryStatus,
  deliveredAt,
  accessExpiresAt,
}: {
  orderId: string;
  orderNumber: string;
  productId: string | null;
  paymentStatus: string;
  orderStatus: string;
  selectedDesignName: string | null;
  deliveryStatus: string | null;
  deliveredAt: string | null;
  accessExpiresAt: string | null;
}) {
  if (!productId) return null;

  const admin = createAdminSupabaseClient();

  const { data: product } = await admin
    .from("products")
    .select("id,slug,name")
    .eq("id", productId)
    .maybeSingle();

  if (!product || product.slug !== SIMPLE_WEBSITE_SLUG) {
    return null;
  }

  const { data: fileData, error: fileError } = await admin
    .from("order_files")
    .select(
      "id,display_name,storage_path,download_count,last_downloaded_at,is_active,created_at,updated_at",
    )
    .eq("order_id", orderId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fileError) {
    console.error("Unable to load personalized website package:", fileError);
  }

  const activeFile = (fileData ?? null) as OrderFile | null;

  const paymentComplete = paymentStatus === "COMPLETED";
  const cancelled = orderStatus === "CANCELLED";

  const accessExpired = isExpired(accessExpiresAt);

  const ready =
    Boolean(activeFile) &&
    paymentComplete &&
    !cancelled &&
    !accessExpired;

  const downloadCount = Math.max(
    0,
    Number(activeFile?.download_count ?? 0),
  );

  const remainingDownloads = Math.max(
    0,
    MAX_DOWNLOADS - downloadCount,
  );

  return (
    <section
      id="website-delivery"
      style={{
        marginTop: "24px",
        overflow: "hidden",
        border: "1px solid #eadde2",
        borderRadius: "22px",
        background: "#ffffff",
        boxShadow: "0 12px 35px rgba(45, 30, 36, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          alignItems: "flex-start",
          flexWrap: "wrap",
          padding: "24px",
          borderBottom: "1px solid #f0e6ea",
          background:
            "linear-gradient(135deg, #fffafb 0%, #fff 60%, #fdf6f8 100%)",
        }}
      >
        <div>
          <span
            style={{
              display: "block",
              marginBottom: "6px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#b06b82",
            }}
          >
            PERSONALIZED WEBSITE DELIVERY
          </span>

          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "24px",
              lineHeight: 1.2,
            }}
          >
            Customer website package
          </h2>

          <p
            style={{
              maxWidth: "680px",
              margin: 0,
              color: "#75656b",
              fontSize: "14px",
              lineHeight: 1.65,
            }}
          >
            Prepare and upload this customer&apos;s personalized website ZIP.
            The file is private and belongs only to this order.
          </p>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: "34px",
            padding: "0 13px",
            borderRadius: "999px",
            background: cancelled
              ? "#fff1f1"
              : ready
                ? "#eef9f0"
                : paymentComplete
                  ? "#fff7e8"
                  : "#f5f5f5",
            color: cancelled
              ? "#a13d3d"
              : ready
                ? "#28733c"
                : paymentComplete
                  ? "#94630c"
                  : "#707070",
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: "0.08em",
          }}
        >
          {cancelled
            ? "CANCELLED"
            : ready
              ? "READY FOR DOWNLOAD"
              : paymentComplete
                ? "PROCESSING"
                : "WAITING FOR PAYMENT"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1px",
          background: "#eee4e8",
          borderBottom: "1px solid #eee4e8",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            background: "#fff",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.09em",
              color: "#9a858d",
            }}
          >
            ORDER
          </span>

          <strong>{orderNumber}</strong>
        </div>

        <div
          style={{
            padding: "18px 20px",
            background: "#fff",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.09em",
              color: "#9a858d",
            }}
          >
            SELECTED DESIGN
          </span>

          <strong>{selectedDesignName || "Not recorded"}</strong>
        </div>

        <div
          style={{
            padding: "18px 20px",
            background: "#fff",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.09em",
              color: "#9a858d",
            }}
          >
            READY / DELIVERED
          </span>

          <strong>{formatDateTime(deliveredAt)}</strong>
        </div>

        <div
          style={{
            padding: "18px 20px",
            background: "#fff",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.09em",
              color: "#9a858d",
            }}
          >
            ACCESS EXPIRES
          </span>

          <strong>
            {activeFile ? formatDateTime(accessExpiresAt) : "Not started"}
          </strong>
        </div>
      </div>

      {!paymentComplete ? (
        <div
          style={{
            margin: "22px",
            padding: "16px 18px",
            border: "1px solid #e4e4e4",
            borderRadius: "14px",
            background: "#fafafa",
            color: "#666",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          The personalized website package can be uploaded after the payment
          has been completed.
        </div>
      ) : cancelled ? (
        <div
          style={{
            margin: "22px",
            padding: "16px 18px",
            border: "1px solid #f0cccc",
            borderRadius: "14px",
            background: "#fff5f5",
            color: "#8b4040",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          This order is cancelled. Website delivery is disabled.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "22px",
            padding: "24px",
          }}
        >
          {activeFile ? (
            <div
              style={{
                display: "grid",
                gap: "16px",
                padding: "20px",
                border: "1px solid #e8dde1",
                borderRadius: "18px",
                background: "#fffcfd",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "15px",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      color: "#a07282",
                    }}
                  >
                    CURRENT CUSTOMER FILE
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "17px",
                    }}
                  >
                    {activeFile.display_name}
                  </strong>

                  <small
                    style={{
                      display: "block",
                      marginTop: "5px",
                      color: "#83737a",
                    }}
                  >
                    Uploaded {formatDateTime(activeFile.created_at)}
                  </small>
                </div>

                <span
                  style={{
                    padding: "7px 11px",
                    borderRadius: "999px",
                    background: accessExpired ? "#fff0f0" : "#eef9f0",
                    color: accessExpired ? "#9a4444" : "#28733c",
                    fontSize: "10px",
                    fontWeight: 900,
                    letterSpacing: "0.07em",
                  }}
                >
                  {accessExpired ? "ACCESS EXPIRED" : "PRIVATE FILE ACTIVE"}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#fff",
                    border: "1px solid #eee4e8",
                  }}
                >
                  <small
                    style={{
                      display: "block",
                      color: "#8c7981",
                      marginBottom: "5px",
                    }}
                  >
                    Downloads used
                  </small>

                  <strong>
                    {Math.min(downloadCount, MAX_DOWNLOADS)} /{" "}
                    {MAX_DOWNLOADS}
                  </strong>
                </div>

                <div
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#fff",
                    border: "1px solid #eee4e8",
                  }}
                >
                  <small
                    style={{
                      display: "block",
                      color: "#8c7981",
                      marginBottom: "5px",
                    }}
                  >
                    Downloads remaining
                  </small>

                  <strong>{remainingDownloads}</strong>
                </div>

                <div
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#fff",
                    border: "1px solid #eee4e8",
                  }}
                >
                  <small
                    style={{
                      display: "block",
                      color: "#8c7981",
                      marginBottom: "5px",
                    }}
                  >
                    Last downloaded
                  </small>

                  <strong
                    style={{
                      fontSize: "13px",
                    }}
                  >
                    {formatDateTime(activeFile.last_downloaded_at)}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  padding: "13px 15px",
                  borderRadius: "12px",
                  background: "#fff8fa",
                  color: "#745c65",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                Uploading another ZIP below will replace this customer&apos;s
                active package and restart their 7-day access period.
              </div>

              {!accessExpired ? (
                <form action={revokeDownloadAccess}>
                  <input type="hidden" name="order_id" value={orderId} />

                  <button
                    type="submit"
                    style={{
                      minHeight: "42px",
                      padding: "0 16px",
                      border: "1px solid #e4b9bf",
                      borderRadius: "10px",
                      background: "#fff",
                      color: "#9b3e4b",
                      font: "inherit",
                      fontSize: "13px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Revoke Customer Access
                  </button>
                </form>
              ) : null}
            </div>
          ) : (
            <div
              style={{
                padding: "18px",
                border: "1px dashed #ddcbd2",
                borderRadius: "15px",
                background: "#fffafb",
              }}
            >
              <strong
                style={{
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                Package not uploaded yet
              </strong>

              <p
                style={{
                  margin: 0,
                  color: "#7b6b71",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                The customer&apos;s order remains Processing until you upload
                their prepared website ZIP.
              </p>
            </div>
          )}

          <form
            action={uploadWebsiteOrderFile}
            encType="multipart/form-data"
            style={{
              display: "grid",
              gap: "18px",
              padding: "22px",
              border: "1px solid #eadde2",
              borderRadius: "18px",
              background: "#fff",
            }}
          >
            <input type="hidden" name="order_id" value={orderId} />

            <div>
              <span
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "10px",
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  color: "#a16f80",
                }}
              >
                {activeFile ? "REPLACE PACKAGE" : "UPLOAD PACKAGE"}
              </span>

              <h3
                style={{
                  margin: 0,
                  fontSize: "19px",
                }}
              >
                {activeFile
                  ? "Upload a replacement ZIP"
                  : "Upload the prepared customer ZIP"}
              </h3>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#78686e",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                ZIP files only · Maximum 50 MB · Stored privately in Supabase.
              </p>
            </div>

            <label
              style={{
                display: "grid",
                gap: "7px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                Customer-facing file name
              </span>

              <input
                type="text"
                name="display_name"
                defaultValue={
                  selectedDesignName
                    ? `${selectedDesignName} Website Package`
                    : "Website Package"
                }
                maxLength={150}
                style={{
                  width: "100%",
                  minHeight: "45px",
                  padding: "0 13px",
                  border: "1px solid #decdd3",
                  borderRadius: "10px",
                  background: "#fff",
                  color: "#31282b",
                  font: "inherit",
                }}
              />

              <small
                style={{
                  color: "#8b7b81",
                }}
              >
                This is the file name the customer will see in Order Status.
              </small>
            </label>

            <label
              style={{
                display: "grid",
                gap: "10px",
                padding: "20px",
                border: "1px dashed #d9c2ca",
                borderRadius: "14px",
                background: "#fffbfc",
                cursor: "pointer",
              }}
            >
              <strong
                style={{
                  fontSize: "14px",
                }}
              >
                Choose personalized website ZIP
              </strong>

              <input
                type="file"
                name="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                required
              />

              <small
                style={{
                  color: "#8b7880",
                  lineHeight: 1.5,
                }}
              >
                Make sure this is the correct customer copy with their prepared
                login credentials before uploading.
              </small>
            </label>

            <button
              type="submit"
              style={{
                justifySelf: "start",
                minHeight: "46px",
                padding: "0 20px",
                border: 0,
                borderRadius: "11px",
                background: "#2f2529",
                color: "#fff",
                font: "inherit",
                fontSize: "13px",
                fontWeight: 850,
                cursor: "pointer",
              }}
            >
              {activeFile
                ? "Replace Website Package →"
                : "Upload & Mark Ready →"}
            </button>
          </form>

          <div
            style={{
              padding: "15px 17px",
              borderRadius: "13px",
              background: "#f9f6f7",
              color: "#75676c",
              fontSize: "12px",
              lineHeight: 1.65,
            }}
          >
            <strong style={{ color: "#4f4247" }}>
              Delivery rule:
            </strong>{" "}
            The 7-day customer access period begins only after the personalized
            ZIP is successfully uploaded. Uploading a replacement package
            restarts the 7-day period.
          </div>
        </div>
      )}
    </section>
  );
}