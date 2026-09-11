import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import styles from "./DigitalAccessPanel.module.css";
import {
  extendDownloadAccess,
  resetFileDownloads,
  revokeDownloadAccess,
} from "./actions";
import OrderWebsiteDeliveryPanel from "./OrderWebsiteDeliveryPanel";

const MAX_DOWNLOADS = 3;
const ACCESS_DAYS = 7;
const SIMPLE_WEBSITE_SLUG = "simple-business-website-template";

type FileRow = {
  id: string;
  display_name: string;
  display_order: number | null;
};

type CounterRow = {
  product_file_id: string;
  download_count: number | null;
  last_downloaded_at: string | null;
};

type LogRow = {
  id: string;
  product_file_id: string;
  downloaded_at: string;
  ip_address: string | null;
  device_type: string | null;
  browser: string | null;
  operating_system: string | null;
  result: string | null;
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

function maskIp(ip: string | null) {
  if (!ip) return "Not available";

  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);

    return parts.length > 2
      ? `${parts.slice(0, 2).join(":")}:••••`
      : "IPv6 ••••";
  }

  const parts = ip.split(".");

  return parts.length === 4
    ? `${parts[0]}.${parts[1]}.•••.${parts[3]}`
    : "•••";
}

function resultLabel(result: string | null) {
  if (result === "SUCCESS") return "Successful";
  if (result === "LIMIT_REACHED") return "Limit reached";
  if (result === "EXPIRED") return "Expired";
  if (result === "ERROR") return "Error";

  return result || "Unknown";
}

export default async function DigitalAccessPanel({
  orderId,
  orderNumber,
  productId,
  paymentStatus,
  orderStatus,
  paidAt,
  createdAt,
  accessExpiresAt,
}: {
  orderId: string;
  orderNumber: string;
  productId: string | null;
  paymentStatus: string;
  orderStatus: string;
  paidAt: string | null;
  createdAt: string;
  accessExpiresAt: string | null;
}) {
  if (!productId) return null;

  const admin = createAdminSupabaseClient();

  /*
   * First identify the product.
   *
   * The Simple Business Website Template uses its own personalized
   * order delivery system instead of reusable product_files.
   */
  const { data: product, error: productError } = await admin
    .from("products")
    .select("id,slug")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    console.error(
      "Unable to identify product for digital access:",
      productError,
    );
  }

  if (product?.slug === SIMPLE_WEBSITE_SLUG) {
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select(
        "selected_design_name,delivery_status,delivered_at,download_access_expires_at",
      )
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error(
        "Unable to load website delivery order information:",
        orderError,
      );
    }

    return (
      <OrderWebsiteDeliveryPanel
        orderId={orderId}
        orderNumber={orderNumber}
        productId={productId}
        paymentStatus={paymentStatus}
        orderStatus={orderStatus}
        selectedDesignName={order?.selected_design_name ?? null}
        deliveryStatus={order?.delivery_status ?? null}
        deliveredAt={order?.delivered_at ?? null}
        accessExpiresAt={
          order?.download_access_expires_at ??
          accessExpiresAt
        }
      />
    );
  }

  /*
   * Every other downloadable product continues using the existing
   * reusable product-file delivery system below.
   */
  const [filesResult, countersResult, logsResult] = await Promise.all([
    admin
      .from("product_files")
      .select("id,display_name,display_order")
      .eq("product_id", productId)
      .eq("is_active", true)
      .order("display_order", { ascending: true }),

    admin
      .from("order_downloads")
      .select(
        "product_file_id,download_count,last_downloaded_at",
      )
      .eq("order_id", orderId),

    admin
      .from("download_logs")
      .select(
        "id,product_file_id,downloaded_at,ip_address,device_type,browser,operating_system,result",
      )
      .eq("order_id", orderId)
      .order("downloaded_at", { ascending: false })
      .limit(100),
  ]);

  const files = (filesResult.data ?? []) as FileRow[];
  const counters = (countersResult.data ?? []) as CounterRow[];
  const logs = (logsResult.data ?? []) as LogRow[];

  const countersByFile = new Map(
    counters.map((row) => [row.product_file_id, row]),
  );

  const namesByFile = new Map(
    files.map((file) => [file.id, file.display_name]),
  );

  const fallbackExpiry = new Date(
    new Date(paidAt || createdAt).getTime() +
      ACCESS_DAYS * 86400000,
  );

  const expiry = accessExpiresAt
    ? new Date(accessExpiresAt)
    : fallbackExpiry;

  const active =
    paymentStatus === "COMPLETED" &&
    orderStatus !== "CANCELLED" &&
    expiry.getTime() > Date.now();

  const totalDownloadsUsed = counters.reduce(
    (total, row) =>
      total + Math.max(0, Number(row.download_count ?? 0)),
    0,
  );

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <span>DIGITAL ACCESS & LICENSE</span>
          <h2>Protected template delivery</h2>
          <p>
            Single-order access, per-file limits, and download audit
            history.
          </p>
        </div>

        <span
          className={`${styles.status} ${
            active ? styles.active : styles.inactive
          }`}
        >
          {active ? "ACTIVE" : "INACTIVE"}
        </span>
      </div>

      <div className={styles.stats}>
        <div>
          <span>LICENSE / ORDER</span>
          <strong>{orderNumber}</strong>
        </div>

        <div>
          <span>ACCESS EXPIRES</span>
          <strong>{formatDateTime(expiry.toISOString())}</strong>
        </div>

        <div>
          <span>DOWNLOADS USED</span>
          <strong>{totalDownloadsUsed}</strong>
        </div>

        <div>
          <span>FILES</span>
          <strong>{files.length}</strong>
        </div>
      </div>

      <div className={styles.controls}>
        <form action={extendDownloadAccess}>
          <input type="hidden" name="order_id" value={orderId} />

          <label htmlFor={`access-days-${orderId}`}>
            Extend / restore access
          </label>

          <div>
            <input
              id={`access-days-${orderId}`}
              name="days"
              type="number"
              min="1"
              max="365"
              defaultValue="7"
              required
            />

            <button type="submit">Add Days</button>
          </div>
        </form>

        <form action={revokeDownloadAccess}>
          <input type="hidden" name="order_id" value={orderId} />

          <label>Stop future downloads</label>

          <button type="submit" className={styles.revoke}>
            Revoke Access
          </button>
        </form>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span>PROTECTED FILES</span>

          <p>
            Each file can be downloaded up to {MAX_DOWNLOADS} times.
          </p>
        </div>

        {files.length ? (
          <div className={styles.fileList}>
            {files.map((file) => {
              const counter = countersByFile.get(file.id);
              const used = Number(counter?.download_count ?? 0);

              return (
                <article key={file.id} className={styles.fileRow}>
                  <div className={styles.fileInfo}>
                    <strong>{file.display_name}</strong>

                    <small>
                      Last downloaded:{" "}
                      {formatDateTime(
                        counter?.last_downloaded_at ?? null,
                      )}
                    </small>
                  </div>

                  <div className={styles.usage}>
                    <strong>
                      {Math.min(used, MAX_DOWNLOADS)} /{" "}
                      {MAX_DOWNLOADS}
                    </strong>

                    <span>
                      {Math.max(0, MAX_DOWNLOADS - used)} remaining
                    </span>
                  </div>

                  <form action={resetFileDownloads}>
                    <input
                      type="hidden"
                      name="order_id"
                      value={orderId}
                    />

                    <input
                      type="hidden"
                      name="product_file_id"
                      value={file.id}
                    />

                    <button type="submit">
                      Reset Downloads
                    </button>
                  </form>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            No active product files are attached to this product.
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <span>DOWNLOAD HISTORY</span>

          <p>
            Recent successful and blocked download attempts. IP
            addresses are masked in the admin display.
          </p>
        </div>

        {logs.length ? (
          <div className={styles.historyWrap}>
            <table className={styles.history}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>File</th>
                  <th>Device</th>
                  <th>Browser / OS</th>
                  <th>IP</th>
                  <th>Result</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.downloaded_at)}</td>

                    <td>
                      {namesByFile.get(log.product_file_id) ||
                        "Product file"}
                    </td>

                    <td>{log.device_type || "Unknown"}</td>

                    <td>
                      {[log.browser, log.operating_system]
                        .filter(Boolean)
                        .join(" · ") || "Unknown"}
                    </td>

                    <td>
                      <code>{maskIp(log.ip_address)}</code>
                    </td>

                    <td>
                      <span
                        className={`${styles.result} ${
                          log.result === "SUCCESS"
                            ? styles.success
                            : styles.blocked
                        }`}
                      >
                        {resultLabel(log.result)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.empty}>
            No download activity recorded yet.
          </div>
        )}
      </div>
    </section>
  );
}