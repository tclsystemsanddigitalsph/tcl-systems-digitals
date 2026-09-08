import JSZip from "jszip";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

const PRODUCT_FILES_BUCKET = "product-files";

type LicensedPackageInput = {
  orderId: string;
  productFileId: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  product_id: string | null;
  product_name: string;
  payment_status: string;
  order_status: string | null;
  paid_at: string | null;
  created_at: string;
};

type ProductFileRow = {
  id: string;
  product_id: string;
  display_name: string;
  storage_path: string;
};

function safeFilename(value: string) {
  const cleaned = value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\.+$/g, "");

  return cleaned || "template-file";
}

function licenseId(orderNumber: string, orderId: string) {
  const compactOrderId = orderId.replace(/-/g, "").slice(0, 12).toUpperCase();
  return `TCL-${orderNumber}-${compactOrderId}`;
}

function formatPurchaseDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function makeLicenseText(order: OrderRow, license: string) {
  return `TCL SYSTEMS & DIGITALS PH
DIGITAL PRODUCT LICENSE

License ID: ${license}
Order Number: ${order.order_number}
Licensed To: ${order.customer_name || "Purchaser"}
Customer Email: ${order.customer_email || "Not provided"}
Product: ${order.product_name}

LICENSE GRANT

This digital product is licensed to the purchaser for use by ONE business or ONE project only.

The purchaser may:
- Edit and customize the files for the licensed business/project.
- Deploy the finished website/system for that licensed business/project.
- Keep private backup copies for the licensed business/project.
- Store the working source code in a private repository.

The purchaser may NOT:
- Resell, redistribute, sublicense, share, gift, or transfer the original template or source files.
- Upload the original template or source files to a public repository.
- Publish the source files as a free or paid template.
- Claim the original template/system design or source package as their own product for resale.
- Use the same purchased template for multiple unrelated businesses, clients, or projects without purchasing an additional license.
- Remove or intentionally falsify purchase/license records included with the delivered package for the purpose of hiding redistribution.

CLIENT WORK

If this purchase is being used to build a website/system for a client, this license covers one client business/project only. A separate license is required for each additional unrelated client/business.

OWNERSHIP

Purchase grants a license to use and customize the digital product. It does not transfer ownership of TCL Systems & Digitals PH's original reusable template, framework, source package, branding assets, documentation, or underlying intellectual property.

CUSTOMER CONTENT

The purchaser retains ownership of their own business information, customer data, uploaded content, logos, photos, and other materials they add to the product.

NO GUARANTEE AGAINST COPYING

Digital source code can technically be copied after delivery. These license terms define the purchaser's permitted use and restrictions regardless of technical access to the files.

License issued by:
TCL Systems & Digitals PH

This license record is tied to Order ${order.order_number}.
`;
}

function makePurchaseText(order: OrderRow, license: string) {
  const purchaseDate = order.paid_at || order.created_at;

  return `TCL SYSTEMS & DIGITALS PH
PURCHASE RECORD

License ID: ${license}
Order Number: ${order.order_number}
Product: ${order.product_name}
Purchaser: ${order.customer_name || "Purchaser"}
Customer Email: ${order.customer_email || "Not provided"}
Purchase Date: ${formatPurchaseDate(purchaseDate)}
Payment Status: ${order.payment_status}
Order ID: ${order.id}

IMPORTANT

This file identifies the licensed purchase associated with this delivered copy.

Keep this file with your private project records. If support, license verification, download restoration, or ownership verification is needed, TCL Systems & Digitals PH may use the Order Number and License ID above to identify the original purchase.

This purchase record does not contain payment card, PayPal, PayMongo, password, API key, or other secret credentials.
`;
}

function makeReadmeText(order: OrderRow, license: string) {
  return `# ${order.product_name}

Delivered by TCL Systems & Digitals PH

## Your license

License ID: ${license}
Order Number: ${order.order_number}

This package is licensed for one business/project only.

Please read:
- LICENSE.txt
- PURCHASE.txt

before redistributing, publishing, transferring, or reusing the source files.

## Important setup note

Initial setup of editable website/system source files is recommended on a laptop or desktop computer.

A phone or tablet may be suitable for managing a completed website/admin dashboard, but initial source-code setup, environment variables, GitHub, Supabase, Vercel, and deployment work is significantly easier and safer from a computer.

## Source-code safety

- Keep your working repository PRIVATE.
- Never commit passwords, service-role keys, API secrets, payment secrets, or .env files to a public repository.
- Keep production credentials in the appropriate hosting/service environment-variable settings.
- Change temporary credentials provided during handover.
- Keep private backups of your customized project.

## License protection

This delivered copy is associated with License ID:

${license}

Do not remove the included LICENSE.txt and PURCHASE.txt from your private master copy.

## Support

When requesting support, provide your Order Number or License ID. Do not send passwords, secret keys, payment credentials, or private environment-variable values through public messages.
`;
}

function makeLicenseJson(order: OrderRow, license: string) {
  const purchaseDate = order.paid_at || order.created_at;

  return JSON.stringify(
    {
      issuer: "TCL Systems & Digitals PH",
      license_id: license,
      order_number: order.order_number,
      order_id: order.id,
      product: order.product_name,
      licensed_to: order.customer_name || "Purchaser",
      customer_email: order.customer_email || null,
      purchase_date: purchaseDate,
      license_scope: "ONE_BUSINESS_OR_PROJECT",
    },
    null,
    2,
  );
}

async function blobToUint8Array(blob: Blob) {
  return new Uint8Array(await blob.arrayBuffer());
}

function isZipFile(productFile: ProductFileRow) {
  const displayName = productFile.display_name.toLowerCase();
  const storagePath = productFile.storage_path.toLowerCase();

  return displayName.endsWith(".zip") || storagePath.endsWith(".zip");
}

async function createPackageZip(
  sourceBytes: Uint8Array,
  productFile: ProductFileRow,
  order: OrderRow,
  license: string,
) {
  let zip: JSZip;

  if (isZipFile(productFile)) {
    try {
      zip = await JSZip.loadAsync(sourceBytes);
    } catch {
      throw new Error(
        "The uploaded product file is marked as a ZIP but could not be opened as a valid ZIP archive.",
      );
    }
  } else {
    zip = new JSZip();
    zip.file(safeFilename(productFile.display_name), sourceBytes);
  }

  /*
   * Always write the current per-order license files at the ROOT
   * of the customer's delivered package.
   *
   * If the master template ZIP already contains files with these
   * names, they are intentionally replaced with the order-specific
   * versions generated below.
   */
  zip.file("LICENSE.txt", makeLicenseText(order, license));
  zip.file("PURCHASE.txt", makePurchaseText(order, license));
  zip.file("README.md", makeReadmeText(order, license));
  zip.file(".tcl-license.json", makeLicenseJson(order, license));

  return zip;
}

export async function createLicensedProductPackage({
  orderId,
  productFileId,
}: LicensedPackageInput) {
  const admin = createAdminSupabaseClient();

  const [
    { data: orderData, error: orderError },
    { data: fileData, error: fileError },
  ] = await Promise.all([
    admin
      .from("orders")
      .select(
        "id,order_number,customer_name,customer_email,product_id,product_name,payment_status,order_status,paid_at,created_at",
      )
      .eq("id", orderId)
      .single(),
    admin
      .from("product_files")
      .select("id,product_id,display_name,storage_path")
      .eq("id", productFileId)
      .eq("is_active", true)
      .single(),
  ]);

  if (orderError || !orderData) {
    throw new Error("Order could not be loaded for licensed delivery.");
  }

  if (fileError || !fileData) {
    throw new Error("Product file could not be loaded for licensed delivery.");
  }

  const order = orderData as OrderRow;
  const productFile = fileData as ProductFileRow;

  if (order.payment_status !== "COMPLETED") {
    throw new Error("Licensed package cannot be generated for an unpaid order.");
  }

  if (order.order_status === "CANCELLED") {
    throw new Error(
      "Licensed package cannot be generated for a cancelled order.",
    );
  }

  if (!order.product_id || productFile.product_id !== order.product_id) {
    throw new Error("Product file does not belong to this order.");
  }

  const { data: sourceBlob, error: sourceError } = await admin.storage
    .from(PRODUCT_FILES_BUCKET)
    .download(productFile.storage_path);

  if (sourceError || !sourceBlob) {
    throw new Error(
      sourceError?.message ||
        "Original product file could not be downloaded.",
    );
  }

  const sourceBytes = await blobToUint8Array(sourceBlob);
  const license = licenseId(order.order_number, order.id);

  /*
   * For ZIP products, this loads the customer's master template ZIP,
   * keeps its existing folder/file structure, and injects the
   * order-specific license records directly into that same package.
   *
   * This avoids creating:
   * Licensed.zip -> OriginalTemplate.zip -> source files
   *
   * The delivered result is instead:
   * Licensed.zip -> source files + LICENSE/PURCHASE/README/license JSON
   */
  const zip = await createPackageZip(
    sourceBytes,
    productFile,
    order,
    license,
  );

  const packageBytes = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });

  const baseName = safeFilename(
    `${order.product_name}-${order.order_number}-Licensed`,
  );

  return {
    bytes: packageBytes,
    filename: `${baseName}.zip`,
    licenseId: license,
  };
}
