export type RevenueOrder = {
  payment_status: string | null;
  total_amount: number | string | null;
  refund_status?: string | null;
  refunded_amount?: number | string | null;
};

export function orderNetRevenue(order: RevenueOrder) {
  if (order.payment_status !== "COMPLETED") return 0;

  const gross = Math.max(0, Number(order.total_amount ?? 0));
  const refunded = Math.max(0, Number(order.refunded_amount ?? 0));

  if (order.refund_status === "REFUNDED") return 0;
  if (order.refund_status === "PARTIALLY_REFUNDED") {
    return Math.max(0, gross - refunded);
  }

  return gross;
}
