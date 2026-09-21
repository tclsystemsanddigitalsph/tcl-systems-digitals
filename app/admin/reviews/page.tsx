import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  createReviewInvitation,
  deleteReview,
  revokeReviewInvitation,
  toggleFeaturedReview,
  updateReviewStatus,
} from "./actions";
import InviteCard from "./InviteCard";
import AdminNav from "@/app/admin/AdminNav";
import styles from "./reviews.module.css";

function date(value: string | null) {
  if (!value) return "No expiration";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(new Date(value));
}

function inviteStatus(status: string, expiresAt: string | null) {
  if (status === "ACTIVE" && expiresAt && new Date(expiresAt) < new Date()) return "EXPIRED";
  return status;
}

type ReviewsPageProps = {
  searchParams: Promise<{ invitePage?: string; reviewPage?: string }>;
};

export default async function AdminReviewsPage({ searchParams }: ReviewsPageProps) {
  const query = await searchParams;
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = createAdminSupabaseClient();

  const [reviewsResult, invitesResult, ordersResult, productsResult] = await Promise.all([
    admin.from("reviews")
      .select("id,customer_name,business_name,product_name,rating,review_text,status,is_featured,created_at")
      .order("created_at", { ascending: false }),
    admin.from("review_invitations")
      .select("id,token,order_id,product_id,customer_name,customer_email,product_name,status,expires_at,used_at,created_at")
      .order("created_at", { ascending: false }),
    admin.from("orders")
      .select("id,order_number,customer_name,customer_email,product_name,payment_status")
      .order("created_at", { ascending: false })
      .limit(100),
    admin.from("products")
      .select("id,name")
      .eq("is_active", true)
      .order("name"),
  ]);

  const reviews = reviewsResult.data ?? [];
  const invites = invitesResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const products = productsResult.data ?? [];

  const pending = reviews.filter((r) => r.status === "PENDING").length;
  const approved = reviews.filter((r) => r.status === "APPROVED").length;
  const activeInvites = invites.filter((i) => inviteStatus(i.status, i.expires_at) === "ACTIVE").length;
  const pageSize = 5;
  const invitePages = Math.max(1, Math.ceil(invites.length / pageSize));
  const reviewPages = Math.max(1, Math.ceil(reviews.length / pageSize));
  const invitePage = Math.min(invitePages, Math.max(1, Number.parseInt(query.invitePage ?? "1", 10) || 1));
  const reviewPage = Math.min(reviewPages, Math.max(1, Number.parseInt(query.reviewPage ?? "1", 10) || 1));
  const pagedInvites = invites.slice((invitePage - 1) * pageSize, invitePage * pageSize);
  const pagedReviews = reviews.slice((reviewPage - 1) * pageSize, reviewPage * pageSize);

  const reviewUrl = (nextInvitePage: number, nextReviewPage: number) => {
    const params = new URLSearchParams();
    if (nextInvitePage > 1) params.set("invitePage", String(nextInvitePage));
    if (nextReviewPage > 1) params.set("reviewPage", String(nextReviewPage));
    const value = params.toString();
    return value ? `/admin/reviews?${value}` : "/admin/reviews";
  };

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="reviews" email={user.email} />

        <section className="store-admin-main">
          <div className={styles.page}>
          <header className={styles.topbar}>
            <div>
              <span className="store-admin-eyebrow">CUSTOMER FEEDBACK</span>
              <h1>Reviews</h1>
              <p>Generate private review links and moderate customer reviews.</p>
            </div>
          </header>

          <section className={styles.stats}>
            <article><span>PENDING REVIEWS</span><strong>{pending}</strong></article>
            <article><span>APPROVED</span><strong>{approved}</strong></article>
            <article><span>ACTIVE INVITES</span><strong>{activeInvites}</strong></article>
            <article><span>TOTAL REVIEWS</span><strong>{reviews.length}</strong></article>
          </section>

          <details className={`${styles.card} ${styles.inviteGenerator}`}>
            <summary className={styles.generatorSummary}>
              <div>
                <span>NEW INVITE</span>
                <h2>Generate Review Invite</h2>
                <p>Create a private review link for a customer.</p>
              </div>

              <span className={styles.generatorButton}>
                + Generate New Invite
              </span>
            </summary>

            <div className={styles.generatorBody}>
              <form action={createReviewInvitation} className={styles.form}>
                <div className={styles.fieldWide}>
                  <label htmlFor="order_id">Existing order (optional)</label>
                  <select id="order_id" name="order_id" defaultValue="">
                    <option value="">Manual / off-platform customer</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.order_number} — {order.customer_name} — {order.product_name}
                      </option>
                    ))}
                  </select>
                  <small>If you select an order, its customer and product details are used automatically.</small>
                </div>

                <div>
                  <label htmlFor="customer_name">Customer name</label>
                  <input id="customer_name" name="customer_name" placeholder="Customer name" />
                </div>
                <div>
                  <label htmlFor="customer_email">Email</label>
                  <input id="customer_email" name="customer_email" type="email" placeholder="customer@email.com" />
                </div>
                <div>
                  <label htmlFor="product_id">Product</label>
                  <select id="product_id" name="product_id" defaultValue="">
                    <option value="">No linked product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="product_name">Product / service name</label>
                  <input id="product_name" name="product_name" placeholder="Optional custom product" />
                </div>
                <div>
                  <label htmlFor="expires_at">Expiration date</label>
                  <input id="expires_at" name="expires_at" type="date" />
                </div>
                <div className={styles.submitWrap}>
                  <button type="submit">Generate Invite</button>
                </div>
              </form>
            </div>
          </details>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div><span>PRIVATE LINKS</span><h2>Review Invitations</h2></div>
              <strong>{invites.length} total</strong>
            </div>

            {invites.length ? (
              <div className={styles.inviteList}>
                {pagedInvites.map((invite) => {
                  const status = inviteStatus(invite.status, invite.expires_at);

                  return (
                    <InviteCard
                      key={invite.id}
                      invite={{
                        id: invite.id,
                        token: invite.token,
                        customerName: invite.customer_name,
                        customerEmail: invite.customer_email,
                        productName: invite.product_name,
                        status,
                        createdLabel: date(invite.created_at),
                        expiresLabel: invite.expires_at
                          ? `Expires ${date(invite.expires_at)}`
                          : "No expiration",
                      }}
                      revokeAction={revokeReviewInvitation}
                    />
                  );
                })}
              </div>
            ) : <div className={styles.empty}>No review invitations yet.</div>}

            {invitePages > 1 ? (
              <nav className={styles.pagination} aria-label="Review invitations pagination">
                {Array.from({ length: invitePages }, (_, index) => index + 1).map((page) => (
                  <a
                    key={page}
                    href={reviewUrl(page, reviewPage)}
                    className={page === invitePage ? styles.pageActive : styles.pageNumber}
                    aria-current={page === invitePage ? "page" : undefined}
                  >
                    {page}
                  </a>
                ))}
              </nav>
            ) : null}
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div><span>MODERATION</span><h2>Customer Reviews</h2></div>
              <strong>{reviews.length} total</strong>
            </div>

            {reviews.length ? (
              <div className={styles.reviewList}>
                {pagedReviews.map((review) => (
                  <article className={styles.review} key={review.id}>
                    <div className={styles.reviewTop}>
                      <div>
                        <strong>{review.customer_name}</strong>
                        <small>{review.business_name || review.product_name || "TCL Customer"}</small>
                      </div>
                      <span className={`${styles.status} ${styles[review.status.toLowerCase()]}`}>{review.status}</span>
                    </div>
                    <div className={styles.stars}>{"★".repeat(Math.max(1, Math.min(5, review.rating)))}</div>
                    <p>{review.review_text}</p>
                    <div className={styles.reviewBottom}>
                      <small>{date(review.created_at)}</small>
                      <div className={styles.actions}>
                        {review.status !== "APPROVED" ? (
                          <form action={updateReviewStatus}>
                            <input type="hidden" name="review_id" value={review.id} />
                            <input type="hidden" name="status" value="APPROVED" />
                            <button type="submit">Approve</button>
                          </form>
                        ) : null}
                        {review.status !== "REJECTED" ? (
                          <form action={updateReviewStatus}>
                            <input type="hidden" name="review_id" value={review.id} />
                            <input type="hidden" name="status" value="REJECTED" />
                            <button className={styles.secondary} type="submit">Reject</button>
                          </form>
                        ) : null}
                        <form action={toggleFeaturedReview}>
                          <input type="hidden" name="review_id" value={review.id} />
                          <input type="hidden" name="featured" value={review.is_featured ? "false" : "true"} />
                          <button className={styles.secondary} type="submit">
                            {review.is_featured ? "Unfeature" : "Feature"}
                          </button>
                        </form>
                        <form action={deleteReview}>
                          <input type="hidden" name="review_id" value={review.id} />
                          <button className={styles.danger} type="submit">Delete</button>
                        </form>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : <div className={styles.empty}>No reviews yet. Generate an invite above.</div>}

            {reviewPages > 1 ? (
              <nav className={styles.pagination} aria-label="Customer reviews pagination">
                {Array.from({ length: reviewPages }, (_, index) => index + 1).map((page) => (
                  <a
                    key={page}
                    href={reviewUrl(invitePage, page)}
                    className={page === reviewPage ? styles.pageActive : styles.pageNumber}
                    aria-current={page === reviewPage ? "page" : undefined}
                  >
                    {page}
                  </a>
                ))}
              </nav>
            ) : null}
          </section>
          </div>
        </section>
      </div>
    </main>
  );
}
