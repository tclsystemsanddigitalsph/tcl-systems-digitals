import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PaymentProcessing from "./PaymentProcessing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Confirming Payment | TCL Systems & Digitals PH",
  robots: { index: false, follow: false },
};

export default async function PayMongoProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{
    receipt?: string | string[];
  }>;
}) {
  const params = await searchParams;

  const receipt =
    typeof params.receipt === "string"
      ? params.receipt.trim()
      : "";

  return (
    <>
      <SiteHeader />

      <main
        style={{
          minHeight: "calc(100vh - 160px)",
          padding: "40px 20px 72px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 760,
            margin: "0 auto",
          }}
        >
          <nav
            aria-label="Page navigation"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 28,
            }}
          >
            <Link href="/">
              Return Home →
            </Link>
          </nav>

          <PaymentProcessing receipt={receipt} />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
