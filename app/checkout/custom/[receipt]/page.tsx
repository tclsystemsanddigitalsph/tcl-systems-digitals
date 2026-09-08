import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import styles from "./custom-checkout.module.css";

type Props = {
  params: Promise<{ receipt: string }>;
  searchParams: Promise<{
    paid?: string;
    cancelled?: string;
    cancelled_order?: string;
    error?: string;
  }>;
};

function money(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

export const dynamic = "force-dynamic";

export default async function CustomOrderCheckout({
  params,
  searchParams,
}: Props) {
  const { receipt } = await params;
  const query = await searchParams;

  const supabase = createAdminSupabaseClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id,order_number,customer_name,customer_email,product_name,custom_description,base_price,processing_fee,total_amount,currency,payment_status,order_status,receipt_token",
    )
    .eq("receipt_token", receipt)
    .maybeSingle();

  if (error) {
    console.error("Custom checkout order load error:", error);
  }

  if (!order) notFound();

  const paid = order.payment_status === "COMPLETED" || query.paid === "1";
  const orderCancelled =
    order.order_status === "CANCELLED" || query.cancelled_order === "1";

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.brand}>
          <div>TCL</div>
          <span>
            <strong>TCL Systems</strong>
            <small>&amp; Digitals PH</small>
          </span>
        </div>

        <section className={styles.card}>
          {paid ? (
            <div className={styles.success}>
              <span>✓</span>
              <h1>Payment received</h1>
              <p>
                Thank you, {order.customer_name}. Your payment for{" "}
                <strong>{order.product_name}</strong> has been recorded.
              </p>
              <small>Order {order.order_number}</small>
            </div>
          ) : orderCancelled ? (
            <div className={styles.success}>
              <span>×</span>
              <h1>Checkout unavailable</h1>
              <p>
                This order has been cancelled and the private payment link is
                no longer active.
              </p>
              <small>Order {order.order_number}</small>
            </div>
          ) : (
            <>
              <div className={styles.heading}>
                <span>PRIVATE CHECKOUT</span>
                <h1>{order.product_name}</h1>
                <p>
                  This checkout was prepared specifically for{" "}
                  <strong>{order.customer_name}</strong>.
                </p>
              </div>

              {query.cancelled === "1" ? (
                <div className={styles.notice}>
                  Payment was cancelled. You can try again below.
                </div>
              ) : null}

              {query.error === "1" ? (
                <div className={styles.error}>
                  We could not confirm the payment. Please try again or contact TCL.
                </div>
              ) : null}

              <div className={styles.summary}>
                <div>
                  <span>Order</span>
                  <strong>{order.order_number}</strong>
                </div>

                <div>
                  <span>Customer</span>
                  <strong>{order.customer_name}</strong>
                </div>

                {order.custom_description ? (
                  <div className={styles.description}>
                    <span>Details</span>
                    <p>{order.custom_description}</p>
                  </div>
                ) : null}
              </div>

              <div className={styles.breakdown}>
                <div>
                  <span>Base price</span>
                  <strong>{money(Number(order.base_price ?? 0))}</strong>
                </div>
                <div>
                  <span>Processing fee</span>
                  <strong>{money(Number(order.processing_fee ?? 0))}</strong>
                </div>
                <div className={styles.total}>
                  <span>Total</span>
                  <strong>{money(Number(order.total_amount ?? 0))}</strong>
                </div>
              </div>

              <form
                action="/api/paypal/custom-create-order"
                method="POST"
                className={styles.payForm}
              >
                <input type="hidden" name="receipt" value={order.receipt_token} />
                <button type="submit">Continue to PayPal</button>
              </form>

              <p className={styles.secureNote}>
                The payment amount is loaded securely from the saved TCL order
                and cannot be changed through this link.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
