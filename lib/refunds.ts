import "server-only";
import { getPayPalAccessToken, getPayPalBaseUrl } from "@/lib/paypal";

type ProviderRefundResult = {
  id: string;
  status: string;
  amount: number;
  currency: string;
};

export async function refundPayPalCapture({
  captureId,
  amount,
  currency,
  note,
  requestId,
}: {
  captureId: string;
  amount: number;
  currency: string;
  note: string;
  requestId: string;
}): Promise<ProviderRefundResult> {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/payments/captures/${encodeURIComponent(captureId)}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": requestId,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        amount: {
          value: amount.toFixed(2),
          currency_code: currency.toUpperCase(),
        },
        note_to_payer: note.slice(0, 255),
      }),
      cache: "no-store",
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("PayPal refund error:", response.status, data);
    throw new Error(
      data?.message ||
        data?.details?.[0]?.description ||
        "PayPal was unable to process this refund.",
    );
  }

  if (!data?.id || !data?.status || !data?.amount?.value) {
    throw new Error("PayPal returned an incomplete refund response.");
  }

  return {
    id: String(data.id),
    status: String(data.status).toUpperCase(),
    amount: Number(data.amount.value),
    currency: String(data.amount.currency_code || currency).toUpperCase(),
  };
}

export async function refundPayMongoPayment({
  paymentId,
  amount,
  note,
}: {
  paymentId: string;
  amount: number;
  note: string;
}): Promise<ProviderRefundResult> {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;

  if (!secretKey) {
    throw new Error("PayMongo is not configured.");
  }

  // PayMongo documents API refunds for live transactions only.
  if (secretKey.startsWith("sk_test_")) {
    throw new Error(
      "PayMongo API refunds are only available for live transactions. Use a live transaction or record the refund externally.",
    );
  }

  const centavos = Math.round(amount * 100);
  if (centavos < 100) {
    throw new Error("PayMongo refunds must be at least ₱1.00.");
  }

  const authorization = Buffer.from(`${secretKey}:`).toString("base64");

  const response = await fetch("https://api.paymongo.com/refunds", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: centavos,
          payment_id: paymentId,
          reason: "requested_by_customer",
          notes: note.slice(0, 255),
        },
      },
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("PayMongo refund error:", response.status, payload);
    const detail =
      payload?.errors?.[0]?.detail ||
      payload?.errors?.[0]?.code ||
      "PayMongo was unable to process this refund.";
    throw new Error(String(detail));
  }

  const refund = payload?.data;
  const attributes = refund?.attributes;

  if (!refund?.id || !attributes?.status || !attributes?.amount) {
    throw new Error("PayMongo returned an incomplete refund response.");
  }

  return {
    id: String(refund.id),
    status: String(attributes.status).toUpperCase(),
    amount: Number(attributes.amount) / 100,
    currency: String(attributes.currency || "PHP").toUpperCase(),
  };
}
