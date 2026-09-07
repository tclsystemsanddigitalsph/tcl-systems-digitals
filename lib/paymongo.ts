import "server-only";
import crypto from "node:crypto";

const PAYMONGO_API_BASE_URL = "https://api.paymongo.com";

export function getPayMongoSecretKey() {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Missing PAYMONGO_SECRET_KEY.");
  }

  return secretKey;
}

export function getPayMongoAuthorizationHeader() {
  const secretKey = getPayMongoSecretKey();
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

export async function createPayMongoCheckoutSession(body: unknown) {
  const response = await fetch(
    `${PAYMONGO_API_BASE_URL}/v2/checkout_sessions`,
    {
      method: "POST",
      headers: {
        Authorization: getPayMongoAuthorizationHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "PayMongo checkout session error:",
      response.status,
      data,
    );

    throw new Error(
      data?.errors?.[0]?.detail ||
        data?.errors?.[0]?.code ||
        "Unable to create PayMongo checkout session.",
    );
  }

  return data;
}

function timingSafeHexEqual(left: string, right: string) {
  try {
    const leftBuffer = Buffer.from(left, "hex");
    const rightBuffer = Buffer.from(right, "hex");

    if (
      leftBuffer.length === 0 ||
      leftBuffer.length !== rightBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
  } catch {
    return false;
  }
}

export function verifyPayMongoWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
) {
  const webhookSecret =
    process.env.PAYMONGO_WEBHOOK_SECRET;

  if (!webhookSecret || !signatureHeader) {
    return false;
  }

  const parts = Object.fromEntries(
    signatureHeader
      .split(",")
      .map((part) => part.trim().split("="))
      .filter(
        (entry): entry is [string, string] =>
          entry.length === 2 &&
          Boolean(entry[0]) &&
          Boolean(entry[1]),
      ),
  );

  const timestamp = parts.t;
  const testSignature = parts.te;
  const liveSignature = parts.li;

  if (!timestamp) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload)
    .digest("hex");

  const secretKey = process.env.PAYMONGO_SECRET_KEY ?? "";
  const isLive = secretKey.startsWith("sk_live_");
  const suppliedSignature = isLive
    ? liveSignature
    : testSignature;

  if (!suppliedSignature) {
    return false;
  }

  return timingSafeHexEqual(
    expected,
    suppliedSignature,
  );
}
