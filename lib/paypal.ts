const PAYPAL_SANDBOX_BASE_URL = "https://api-m.sandbox.paypal.com";
const PAYPAL_LIVE_BASE_URL = "https://api-m.paypal.com";

export function getPayPalBaseUrl() {
  const environment = (process.env.PAYPAL_ENV ?? "sandbox").toLowerCase();

  if (environment === "live") {
    return PAYPAL_LIVE_BASE_URL;
  }

  return PAYPAL_SANDBOX_BASE_URL;
}

function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "PayPal is not configured. PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are required.",
    );
  }

  return { clientId, clientSecret };
}

export async function getPayPalAccessToken() {
  const { clientId, clientSecret } = getPayPalCredentials();
  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`,
  ).toString("base64");

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const details = await response.text();
    console.error("PayPal OAuth error:", response.status, details);
    throw new Error("Unable to authenticate with PayPal.");
  }

  const data = (await response.json()) as {
    access_token?: string;
  };

  if (!data.access_token) {
    throw new Error("PayPal did not return an access token.");
  }

  return data.access_token;
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: "{}",
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("PayPal capture error:", response.status, data);
    throw new Error("PayPal was unable to capture the payment.");
  }

  return data;
}
