import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import RequirementsForm from "./RequirementsForm";
import styles from "./project-requirements.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Project Requirements | TCL Systems & Digitals PH",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
};

const CUSTOM_PRODUCT_SLUG = "custom-business-website";

function displayPackage(productSlug: string | null, productName: string) {
  const slug = productSlug?.trim().toLowerCase();

  if (slug === "starter-website") {
    return "Starter Website";
  }

  if (slug === "simple-business-website") {
    return "Simple Business Website";
  }

  if (slug === "basic-online-shop") {
    return "Basic Online Shop";
  }

  if (slug === "standard-booking-system") {
    return "Standard Booking Website/System";
  }

  if (slug === CUSTOM_PRODUCT_SLUG) {
    return "Custom Business Website/System";
  }

  return productName || "Custom Project";
}

export default async function ProjectRequirementsPage({ params }: Props) {
  const { token } = await params;
  const secureToken = token?.trim();

  if (!secureToken) notFound();

  const supabase = createAdminSupabaseClient();

  const { data: request, error } = await supabase
    .from("project_requirements")
    .select(
      "id,secure_token,order_id,order_number,customer_name,customer_email,product_id,product_slug,product_name,product_category,product_tier,requirements_status,project_status,requirements,customer_notes,customer_update_note,more_info_requested_at,submitted_at,first_opened_at",
    )
    .eq("secure_token", secureToken)
    .maybeSingle();

  if (error) {
    console.error("Unable to load project requirements:", error);
  }

  if (!request) notFound();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id,payment_status,payment_terms,amount_paid,order_status",
    )
    .eq("id", request.order_id)
    .maybeSingle();

  if (orderError) {
    console.error(
      "Unable to verify project requirements order:",
      orderError,
    );
  }

  if (!order || order.order_status === "CANCELLED") {
    notFound();
  }

  const isCustomQuotation =
    request.product_slug?.trim().toLowerCase() === CUSTOM_PRODUCT_SLUG;

  const amountPaid = Number(order.amount_paid ?? 0);

  const eligibleForRequirements = isCustomQuotation
    ? order.payment_terms === "DEPOSIT_50"
      ? Number.isFinite(amountPaid) &&
        amountPaid > 0 &&
        (order.payment_status === "PARTIALLY_PAID" ||
          order.payment_status === "COMPLETED")
      : order.payment_terms === "FULL"
        ? order.payment_status === "COMPLETED"
        : false
    : order.payment_status === "COMPLETED";

  if (!eligibleForRequirements) {
    notFound();
  }

  if (!request.first_opened_at) {
    await supabase
      .from("project_requirements")
      .update({
        first_opened_at: new Date().toISOString(),
        requirements_status:
          request.requirements_status === "NOT_STARTED"
            ? "IN_PROGRESS"
            : request.requirements_status,
      })
      .eq("id", request.id);
  }

  const needsMoreInfo =
    request.requirements_status === "NEED_MORE_INFO" &&
    Boolean(request.customer_update_note?.trim());

  const shownPackage = displayPackage(
    request.product_slug,
    request.product_name,
  );

  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <div className="container">
          <section className={styles.hero}>
            <span className="section-kicker">Project setup</span>
            <h1>Tell us what you need for your project.</h1>
            <p>
              This form is connected to your verified purchase and is tailored
              to your selected package. Please complete the details as clearly
              as possible so TCL can prepare your build correctly.
            </p>

            <div className={styles.summaryGrid}>
              <div>
                <span>Order</span>
                <strong>{request.order_number}</strong>
              </div>

              <div>
                <span>Product</span>
                <strong>{request.product_name}</strong>
              </div>

              <div>
                <span>Package</span>
                <strong>{shownPackage}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {String(request.requirements_status)
                    .replaceAll("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                </strong>
              </div>
            </div>
          </section>

          {needsMoreInfo ? (
            <section className={styles.revisionNotice}>
              <span>ACTION NEEDED</span>
              <h2>We need a little more information from you.</h2>
              <p className={styles.revisionIntro}>
                Please review the note below, update the relevant parts of your
                form, then click <strong>Update Requirements</strong>.
              </p>

              <div className={styles.revisionMessage}>
                <span>WHAT WE NEED FROM YOU</span>
                <p>{request.customer_update_note}</p>
              </div>
            </section>
          ) : null}

          <RequirementsForm
            token={request.secure_token}
            productSlug={request.product_slug}
            productName={request.product_name}
            productCategory={request.product_category}
            productTier={shownPackage}
            customerName={request.customer_name}
            customerEmail={request.customer_email}
            existingRequirements={
              request.requirements &&
              typeof request.requirements === "object" &&
              !Array.isArray(request.requirements)
                ? request.requirements
                : {}
            }
            existingNotes={request.customer_notes || ""}
            existingStatus={request.requirements_status}
          />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
