"use client";

import { Fragment, useState } from "react";
import CopyOrderNumberButton from "@/components/CopyOrderNumberButton";
import styles from "./order-status.module.css";

type SafeFile = {
  id: string;
  name: string;
  downloadCount: number;
  remainingDownloads: number;
};

type OrderStatusResult = {
  order: {
    orderNumber: string;
    customerName: string | null;
    customerEmail: string;
    productName: string;
    productSlug: string | null;
    productCategory: string | null;
    productType: string | null;
    createdAt: string;
    paidAt: string | null;
    totalAmount: number;
    basePrice: number;
    processingFee: number;
    processingFeePercent: number;
    currency: string;
    paymentProvider: string | null;
    paymentStatus: string;
    orderStatus: string | null;
    deliveryStatus: string | null;
    deliveredAt: string | null;
    refundStatus: string | null;
    refundedAmount: number;
    downloadAccessExpiresAt: string | null;
  };
  project: {
    requirementsStatus: string;
    projectStatus: string;
    submittedAt: string | null;
    approvedAt: string | null;
    completedAt: string | null;
    customerUpdateNote: string | null;
    requirementsUrl: string;
    requirementsButtonLabel: string;
  } | null;
  digitalAccess: {
    hasFiles: boolean;
    accessActive: boolean;
    accessExpiresAt: string | null;
    maxDownloadsPerFile: number;
    files: SafeFile[];
  };
  product: {
    postPurchaseInstructions: string | null;
    deliveryMethod: string | null;
  } | null;
  actions: {
    receiptUrl: string | null;
    supportUrl: string;
  };
};

function titleCase(value: string | null | undefined) {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: currency || "PHP",
  }).format(value);
}

function statusTone(value: string | null | undefined) {
  const status = String(value || "").toUpperCase();

  if (
    ["COMPLETED", "DELIVERED", "APPROVED", "RESUBMITTED", "SUBMITTED"].includes(
      status,
    )
  ) {
    return styles.good;
  }

  if (["FAILED", "CANCELLED", "REFUNDED", "REJECTED"].includes(status)) {
    return styles.bad;
  }

  return styles.waiting;
}

function stepState(value: string | null | undefined) {
  const status = String(value || "").toUpperCase();

  if (
    ["COMPLETED", "DELIVERED", "APPROVED", "SUBMITTED", "RESUBMITTED"].includes(
      status,
    )
  ) {
    return styles.stepDone;
  }

  if (["FAILED", "CANCELLED", "REJECTED", "REFUNDED"].includes(status)) {
    return styles.stepIssue;
  }

  return styles.stepCurrent;
}

function requirementsProgressLabel(value: string | null | undefined) {
  const status = String(value || "").toUpperCase();

  if (status === "SUBMITTED" || status === "RESUBMITTED") {
    return "Submitted";
  }

  if (status === "NEED_MORE_INFO") {
    return "Need More Info";
  }

  if (status === "APPROVED") {
    return "Approved";
  }

  return "";
}

function projectProgressLabel(value: string | null | undefined) {
  const status = String(value || "").toUpperCase();

  if (!status || status === "WAITING_REQUIREMENTS") {
    return "";
  }

  return titleCase(status);
}

function deliveryProgressLabel(value: string | null | undefined) {
  const status = String(value || "").toUpperCase();

  if (!status || status === "NOT_STARTED") {
    return "";
  }

  return titleCase(status);
}

function progressStepClass(
  label: string,
  rawStatus: string | null | undefined,
) {
  if (!label) return styles.stepPending;
  return stepState(rawStatus);
}


function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

function PostPurchaseInstructions({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  return (
    <>
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();

        if (!line) {
          return <div key={`space-${index}`} style={{ height: "8px" }} />;
        }

        if (line.startsWith("### ")) {
          return (
            <h4 key={`h4-${index}`} style={{ margin: "10px 0 4px" }}>
              {renderInlineMarkdown(line.slice(4))}
            </h4>
          );
        }

        if (line.startsWith("## ")) {
          return (
            <h3 key={`h3-${index}`} style={{ margin: "12px 0 5px" }}>
              {renderInlineMarkdown(line.slice(3))}
            </h3>
          );
        }

        if (
          line.startsWith("✓") ||
          line.startsWith("✔") ||
          line.startsWith("- ") ||
          line.startsWith("• ")
        ) {
          const itemText = line.replace(/^(✓|✔|-|•)\s*/, "");

          return (
            <p key={`item-${index}`} style={{ margin: "5px 0" }}>
              <span aria-hidden="true">✓ </span>
              {renderInlineMarkdown(itemText)}
            </p>
          );
        }

        return (
          <p key={`line-${index}`} style={{ margin: "6px 0" }}>
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </>
  );
}

export default function OrderStatusLookup() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<OrderStatusResult | null>(null);

  async function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/order-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          email: email.trim(),
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        data?: OrderStatusResult;
      };

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(
          payload.error ||
            "We could not find an order matching those details.",
        );
      }

      setResult(payload.data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to check your order right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  const order = result?.order;
  const project = result?.project;
  const digitalAccess = result?.digitalAccess;

  const shownRequirements = project
    ? requirementsProgressLabel(project.requirementsStatus)
    : "";
  const shownProject = project
    ? projectProgressLabel(project.projectStatus)
    : "";
  const shownDelivery = deliveryProgressLabel(order?.deliveryStatus);
  const hasRefund =
    ["PARTIALLY_REFUNDED", "REFUNDED"].includes(
      String(order?.refundStatus || "").toUpperCase(),
    ) || Number(order?.refundedAmount || 0) > 0;
  const isDigitalAccessProgress =
    !project && Boolean(digitalAccess?.hasFiles);
  const digitalAccessProgressLabel = isDigitalAccessProgress
    ? digitalAccess?.accessActive
      ? "Active"
      : "Expired"
    : "";

  return (
    <div className={styles.shell}>
      <section className={styles.lookupCard}>
        <div className={styles.lookupHeading}>
          <span>SECURE LOOKUP</span>
          <h2>Find your purchase</h2>
          <p>
            Use the exact order number and purchase email shown on your order.
          </p>
        </div>

        <form className={styles.lookupForm} onSubmit={lookup}>
          <label>
            <span>Order number</span>
            <input
              type="text"
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="TCL-2026..."
              autoComplete="off"
              required
            />
          </label>

          <label>
            <span>Purchase email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Check Order Status"}
          </button>
        </form>

        {message ? (
          <div className={styles.errorMessage} role="alert">
            {message}
          </div>
        ) : null}
      </section>

      {result && order ? (
        <div className={styles.results}>
          <section className={styles.resultTop}>
            <div className={styles.resultTopMain}>
              <div className={styles.successMark}>✓</div>
              <div>
                <span className={styles.resultEyebrow}>ORDER FOUND</span>
                <h2>{order.productName}</h2>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    {order.customerName || "Customer"} · {order.orderNumber}
                  </span>
                  <CopyOrderNumberButton orderNumber={order.orderNumber} />
                </p>
              </div>
            </div>

            <div className={styles.resultTopMeta}>
              <span>Current status</span>
              <strong className={statusTone(order.orderStatus)}>
                {titleCase(order.orderStatus || order.paymentStatus)}
              </strong>
            </div>
          </section>

          <section className={styles.progressCard}>
            <div className={styles.sectionIntro}>
              <span>ORDER PROGRESS</span>
              <h2>Here’s where your order stands</h2>
            </div>

            <div className={styles.timelineRow}>
              <div className={`${styles.step} ${stepState(order.paymentStatus)}`}>
                <i>1</i>
                <div>
                  <span>Payment</span>
                  <strong>{titleCase(order.paymentStatus)}</strong>
                </div>
              </div>

              {project ? (
                <div
                  className={`${styles.step} ${progressStepClass(
                    shownRequirements,
                    project.requirementsStatus,
                  )}`}
                >
                  <i>2</i>
                  <div>
                    <span>Requirements</span>
                    <strong>{shownRequirements}</strong>
                  </div>
                </div>
              ) : null}

              {project ? (
                <div
                  className={`${styles.step} ${progressStepClass(
                    shownProject,
                    project.projectStatus,
                  )}`}
                >
                  <i>3</i>
                  <div>
                    <span>Project</span>
                    <strong>{shownProject}</strong>
                  </div>
                </div>
              ) : null}

              <div
                className={`${styles.step} ${
                  isDigitalAccessProgress
                    ? digitalAccess?.accessActive
                      ? styles.stepDone
                      : styles.stepIssue
                    : progressStepClass(shownDelivery, order.deliveryStatus)
                }`}
              >
                <i>{project ? "4" : "2"}</i>
                <div>
                  <span>
                    {isDigitalAccessProgress ? "Digital Access" : "Delivery"}
                  </span>
                  <strong>
                    {isDigitalAccessProgress
                      ? digitalAccessProgressLabel
                      : shownDelivery}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <div className={styles.resultLayout}>
            <div className={styles.resultMain}>
              {project ? (
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <span>PROJECT DETAILS</span>
                      <h2>Your custom project</h2>
                      <p>
                        Keep track of your submitted requirements and current
                        project status.
                      </p>
                    </div>
                    {shownProject ? (
                      <strong className={statusTone(project.projectStatus)}>
                        {shownProject}
                      </strong>
                    ) : null}
                  </div>

                  {project.customerUpdateNote ? (
                    <div className={styles.actionNeeded}>
                      <div className={styles.actionIcon}>!</div>
                      <div>
                        <span>ACTION NEEDED</span>
                        <strong>We need a little more information.</strong>
                        <p>{project.customerUpdateNote}</p>
                      </div>
                    </div>
                  ) : null}

                  <div className={styles.projectDetails}>
                    <div>
                      <span>Requirements</span>
                      <strong>{shownRequirements}</strong>
                    </div>
                    <div>
                      <span>Submitted</span>
                      <strong>{formatDate(project.submittedAt)}</strong>
                    </div>
                    <div>
                      <span>Approved</span>
                      <strong>{formatDate(project.approvedAt)}</strong>
                    </div>
                    <div>
                      <span>Completed</span>
                      <strong>{formatDate(project.completedAt)}</strong>
                    </div>
                  </div>

                  <a
                    href={project.requirementsUrl}
                    className={styles.primaryButton}
                  >
                    {project.requirementsButtonLabel}
                  </a>
                </section>
              ) : null}

              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <span>PURCHASE DETAILS</span>
                    <h2>Order summary</h2>
                    <p>Everything related to this purchase in one place.</p>
                  </div>
                </div>

                <div className={styles.summaryRows}>
                  <div>
                    <span>Order number</span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <strong>{order.orderNumber}</strong>
                      <CopyOrderNumberButton orderNumber={order.orderNumber} />
                    </div>
                  </div>
                  <div>
                    <span>Product</span>
                    <strong>{order.productName}</strong>
                  </div>
                  <div>
                    <span>Purchase date</span>
                    <strong>{formatDate(order.createdAt)}</strong>
                  </div>
                  <div>
                    <span>Paid at</span>
                    <strong>{formatDate(order.paidAt)}</strong>
                  </div>
                  <div>
                    <span>Payment method</span>
                    <strong>{titleCase(order.paymentProvider)}</strong>
                  </div>
                  <div>
                    <span>Payment status</span>
                    <strong className={statusTone(order.paymentStatus)}>
                      {titleCase(order.paymentStatus)}
                    </strong>
                  </div>
                </div>

                <div className={styles.priceBox}>
                  <div>
                    <span>Base price</span>
                    <strong>{formatMoney(order.basePrice, order.currency)}</strong>
                  </div>
                  <div>
                    <span>Processing fee</span>
                    <strong>
                      {formatMoney(order.processingFee, order.currency)}
                      {order.processingFeePercent > 0
                        ? ` (${order.processingFeePercent}%)`
                        : ""}
                    </strong>
                  </div>
                  <div className={styles.totalRow}>
                    <span>Total paid</span>
                    <strong>
                      {formatMoney(order.totalAmount, order.currency)}
                    </strong>
                  </div>

                  {order.refundedAmount > 0 ? (
                    <div>
                      <span>Total refunded</span>
                      <strong>
                        {formatMoney(order.refundedAmount, order.currency)}
                      </strong>
                    </div>
                  ) : null}
                </div>
              </section>

              {digitalAccess?.hasFiles ? (
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <span>DIGITAL ACCESS</span>
                      <h2>Your files</h2>
                      <p>
                        Access status and remaining downloads for this purchase.
                      </p>
                    </div>
                    <strong
                      className={
                        digitalAccess.accessActive ? styles.good : styles.bad
                      }
                    >
                      {digitalAccess.accessActive ? "Active" : "Expired"}
                    </strong>
                  </div>

                  <div className={styles.accessMeta}>
                    <span>Access expires</span>
                    <strong>{formatDate(digitalAccess.accessExpiresAt)}</strong>
                  </div>

                  <div className={styles.fileList}>
                    {digitalAccess.files.map((file) => (
                      <div className={styles.fileItem} key={file.id}>
                        <div className={styles.fileIcon}>↓</div>
                        <div>
                          <strong>{file.name}</strong>
                          <span>
                            {file.remainingDownloads} of{" "}
                            {digitalAccess.maxDownloadsPerFile} downloads
                            remaining
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {result.actions.receiptUrl ? (
                    <a
                      href={result.actions.receiptUrl}
                      className={styles.primaryButton}
                    >
                      Access Receipt & Downloads →
                    </a>
                  ) : null}
                </section>
              ) : null}

              {result.product?.postPurchaseInstructions?.trim() ? (
                <section className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <div>
                      <span>POST-PURCHASE INFO</span>
                      <h2>What happens next</h2>
                    </div>
                  </div>

                  <div className={styles.instructions}>
                    <PostPurchaseInstructions
                      text={result.product.postPurchaseInstructions}
                    />
                  </div>
                </section>
              ) : null}
            </div>

            <aside className={styles.resultSidebar}>
              <section className={styles.actionCard}>
                <span>QUICK ACTIONS</span>
                <h2>Need something?</h2>
                <p>
                  Use the options below to manage this purchase or contact us.
                </p>

                <div className={styles.actionButtons}>
                  {project ? (
                    <a
                      href={project.requirementsUrl}
                      className={styles.primaryButton}
                    >
                      {project.requirementsButtonLabel}
                    </a>
                  ) : null}

                  {result.actions.receiptUrl ? (
                    <a
                      href={result.actions.receiptUrl}
                      className={styles.secondaryButton}
                    >
                      View Receipt
                    </a>
                  ) : null}

                  <a
                    href={result.actions.supportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.secondaryButton}
                  >
                    Contact TCL
                  </a>
                </div>
              </section>

              <section className={styles.miniCard}>
                <span>
                  {isDigitalAccessProgress ? "DIGITAL ACCESS" : "DELIVERY"}
                </span>
                <strong
                  className={
                    isDigitalAccessProgress
                      ? digitalAccess?.accessActive
                        ? styles.good
                        : styles.bad
                      : statusTone(order.deliveryStatus)
                  }
                >
                  {isDigitalAccessProgress
                    ? digitalAccessProgressLabel
                    : shownDelivery || "Not updated yet"}
                </strong>
                <p>
                  {isDigitalAccessProgress
                    ? digitalAccess?.accessExpiresAt
                      ? `Access expires ${formatDate(
                          digitalAccess.accessExpiresAt,
                        )}`
                      : "Your digital files are available from your receipt."
                    : order.deliveredAt
                      ? `Delivered ${formatDate(order.deliveredAt)}`
                      : "We’ll update this section once your order is delivered."}
                </p>
              </section>

              {hasRefund ? (
                <section className={styles.miniCard}>
                  <span>REFUND STATUS</span>
                  <strong className={statusTone(order.refundStatus)}>
                    {titleCase(order.refundStatus)}
                  </strong>
                  {order.refundedAmount > 0 ? (
                    <p>
                      Refunded amount:{" "}
                      {formatMoney(order.refundedAmount, order.currency)}
                    </p>
                  ) : null}
                </section>
              ) : null}
            </aside>
          </div>

          <button
            type="button"
            className={styles.lookupAnother}
            onClick={() => {
              setResult(null);
              setMessage("");
              setOrderNumber("");
              setEmail("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            ← Check another order
          </button>
        </div>
      ) : null}
    </div>
  );
}
