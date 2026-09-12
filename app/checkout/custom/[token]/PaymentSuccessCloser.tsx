"use client";

import { useEffect } from "react";

export default function PaymentSuccessCloser({
  token,
}: {
  token: string;
}) {
  useEffect(() => {
    /*
     * The provider has already returned to our own checkout origin and the
     * payment is confirmed. Refresh the original TCL checkout first, then
     * close this provider popup.
     */
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.location.reload();
      }
    } catch {
      /*
       * The existing CustomCheckoutActions popup-close watcher will still
       * reload the main checkout after this window closes.
       */
    }

    window.close();

    /*
     * Browser fallback: scripts are normally allowed to close windows created
     * by window.open(). If a browser refuses, do not leave the customer on the
     * success callback screen. Return this popup to the clean checkout URL.
     */
    const fallback = window.setTimeout(() => {
      if (!window.closed) {
        window.location.replace(`/checkout/custom/${encodeURIComponent(token)}`);
      }
    }, 900);

    return () => window.clearTimeout(fallback);
  }, [token]);

  return null;
}
