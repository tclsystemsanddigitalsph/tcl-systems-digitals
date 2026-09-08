import { resetDownloadAccess } from "./download-actions";

export default function DownloadAccessCard({
  orderId,
  expiresAt,
  downloads,
}: {
  orderId: string;
  expiresAt: string | null;
  downloads: Array<{ display_name: string; download_count: number }>;
}) {
  const total = downloads.reduce((sum, item) => sum + Number(item.download_count || 0), 0);
  const active = expiresAt ? Date.now() < new Date(expiresAt).getTime() : false;

  return (
    <section style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 14, background: "#fff" }}>
      <span style={{ fontSize: ".52rem", fontWeight: 900, letterSpacing: ".08em", color: "var(--text-light)" }}>
        DIGITAL DOWNLOAD ACCESS
      </span>
      <h2 style={{ margin: "5px 0 10px", fontSize: ".9rem" }}>Customer file access</h2>
      <div style={{ display: "grid", gap: 7, fontSize: ".6rem" }}>
        <div><strong>Status:</strong> {active ? "Active" : "Expired / not initialized"}</div>
        <div><strong>Access expires:</strong> {expiresAt ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(expiresAt)) : "—"}</div>
        <div><strong>Tracked downloads:</strong> {total}</div>
        {downloads.map((item) => (
          <div key={item.display_name}>
            {item.display_name}: <strong>{item.download_count}/3 used</strong>
          </div>
        ))}
      </div>
      <form action={resetDownloadAccess} style={{ marginTop: 12 }}>
        <input type="hidden" name="order_id" value={orderId} />
        <button type="submit" style={{ minHeight: 36, padding: "0 12px", border: 0, borderRadius: 9, cursor: "pointer", fontWeight: 800 }}>
          Reset Downloads + Restore 7 Days
        </button>
      </form>
    </section>
  );
}
