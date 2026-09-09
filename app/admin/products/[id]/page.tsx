import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  deleteProduct,
  deleteProductFile,
  updateProduct,
  updateProductFile,
  uploadProductFile,
} from "../actions";
import AdminNav from "@/app/admin/AdminNav";
import dashboardStyles from "../../dashboard.module.css";
import styles from "./page.module.css";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    updated?: string;
    file_error?: string;
    file_uploaded?: string;
    file_updated?: string;
    file_deleted?: string;
  }>;
};

const productCategories = [
  "Booking Systems",
  "Business Starter Kits",
  "Digital Product Shops",
  "Physical Product Shops",
  "Customized Websites",
  "Digital Products",
  "Business Resources",
];

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing-required-fields":
      return "Please enter a product name and slug.";
    case "invalid-product-type":
      return "Please select a valid product type.";
    case "invalid-delivery-method":
      return "Please select a valid delivery method.";
    case "invalid-number":
      return "Please check the price, fee, and display order.";
    case "duplicate-slug":
      return "That product slug is already being used.";
    case "save-failed":
      return "The product could not be updated. Please try again.";
    case "delete-failed":
      return "The product could not be deleted. Please try again.";
    default:
      return null;
  }
}

function getFileErrorMessage(error?: string) {
  switch (error) {
    case "missing-file":
      return "Please choose a file to upload.";
    case "missing-name":
      return "Please enter a customer-facing file name.";
    case "file-too-large":
      return "That file is too large. Maximum upload size is 50 MB.";
    case "upload-failed":
      return "The file could not be uploaded to private storage.";
    case "save-failed":
      return "The file uploaded, but its product record could not be saved.";
    case "invalid-file-settings":
      return "Please check the file name and display order.";
    case "update-failed":
      return "The file settings could not be updated.";
    case "delete-failed":
      return "The file could not be deleted.";
    default:
      return null;
  }
}

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { id } = await params;
  const query = await searchParams;
  const adminSupabase = createAdminSupabaseClient();

  const [productResult, filesResult] = await Promise.all([
    adminSupabase.from("products").select("*").eq("id", id).maybeSingle(),
    adminSupabase
      .from("product_files")
      .select(
        "id,display_name,storage_path,display_order,is_active,created_at,updated_at",
      )
      .eq("product_id", id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (productResult.error) {
    console.error("Edit product load error:", productResult.error);
  }

  if (filesResult.error) {
    console.error("Product files load error:", filesResult.error);
  }

  const product = productResult.data;
  if (!product) notFound();

  const productFiles = filesResult.data ?? [];
  const errorMessage = getErrorMessage(query.error);
  const fileErrorMessage = getFileErrorMessage(query.file_error);

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="products" email={user.email} />

        <section className="store-admin-main">
          <header className={dashboardStyles.topbar}>
            <div>
              <span className="store-admin-eyebrow">PRODUCT CATALOG</span>
              <h1>Edit Product</h1>
              <p>Update {product.name} and its storefront settings.</p>
            </div>

            <div className={dashboardStyles.topbarActions}>
              <a
                href={`/shop/${product.slug}`}
                target="_blank"
                rel="noreferrer"
                className={dashboardStyles.secondaryButton}
              >
                View Product ↗
              </a>
              <a
                href="/admin/products"
                className={dashboardStyles.secondaryButton}
              >
                ← Products
              </a>
            </div>
          </header>

          {query.updated === "1" ? (
            <div className={styles.successCard}>
              <div>✓</div>
              <section>
                <strong>Product updated</strong>
                <p>Your changes have been saved successfully.</p>
              </section>
            </div>
          ) : null}

          {errorMessage ? (
            <div className={styles.errorCard}>
              <div>!</div>
              <section>
                <strong>Couldn&apos;t update product</strong>
                <p>{errorMessage}</p>
              </section>
            </div>
          ) : null}

          <form action={updateProduct} className={styles.formLayout}>
            <input type="hidden" name="product_id" value={product.id} />

            <div className={styles.mainColumn}>
              <section className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <span>PRODUCT DETAILS</span>
                  <h2>Basic information</h2>
                  <p>
                    Update the customer-facing name, descriptions, product
                    family, and tier badge.
                  </p>
                </div>

                <div className={styles.fields}>
                  <label className={styles.field}>
                    <span>Product name *</span>
                    <input
                      type="text"
                      name="name"
                      defaultValue={product.name}
                      required
                    />
                    <small>
                      Include the package or tier in the name for tiered
                      products.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Product slug *</span>
                    <input
                      type="text"
                      name="slug"
                      defaultValue={product.slug}
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      required
                    />
                    <small>
                      Lowercase letters, numbers, and hyphens only.
                    </small>
                  </label>

                  <label className={`${styles.field} ${styles.fullWidth}`}>
                    <span>Short description</span>
                    <textarea
                      name="short_description"
                      rows={3}
                      defaultValue={product.short_description ?? ""}
                    />
                    <small>
                      Shown on the product card while customers browse.
                    </small>
                  </label>

                  <label className={`${styles.field} ${styles.fullWidth}`}>
                    <span>Full description</span>
                    <textarea
                      name="description"
                      rows={8}
                      defaultValue={product.description ?? ""}
                    />
                    <small>
                      Main overview shown on the individual product page.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Product family / category</span>
                    <input
                      type="text"
                      name="category"
                      list="tcl-product-categories-edit"
                      defaultValue={product.category ?? "Digital Products"}
                    />
                    <datalist id="tcl-product-categories-edit">
                      {productCategories.map((category) => (
                        <option value={category} key={category} />
                      ))}
                    </datalist>
                    <small>Keep related tiers under the same family.</small>
                  </label>

                  <label className={styles.field}>
                    <span>Badge</span>
                    <input
                      type="text"
                      name="badge"
                      defaultValue={product.badge ?? ""}
                      placeholder="e.g. Pro"
                    />
                    <small>
                      Tier, featured label, or For Quotation.
                    </small>
                  </label>
                </div>
              </section>

              <section className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <span>POST-PURCHASE</span>
                  <h2>Customer instructions</h2>
                  <p>
                    These instructions appear only after a verified successful
                    payment.
                  </p>
                </div>

                <div className={styles.fields}>
                  <label className={`${styles.field} ${styles.fullWidth}`}>
                    <span>Post-purchase instructions</span>
                    <textarea
                      name="post_purchase_instructions"
                      rows={7}
                      defaultValue={product.post_purchase_instructions ?? ""}
                      placeholder="Add the instructions customers should see after payment."
                    />
                    <small>
                      Keep private download links out of this field. Secure
                      files are handled separately below.
                    </small>
                  </label>
                </div>
              </section>

              <section className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <span>PRICING</span>
                  <h2>Price & fees</h2>
                  <p>
                    Quotation-only Service products should use a regular price
                    of ₱0.
                  </p>
                </div>

                <div className={styles.fields}>
                  <label className={styles.field}>
                    <span>Regular price (₱) *</span>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      defaultValue={product.price ?? 0}
                      required
                    />
                    <small>Use 0 only for quotation-only services.</small>
                  </label>

                  <label className={styles.field}>
                    <span>Sale price (₱)</span>
                    <input
                      type="number"
                      name="sale_price"
                      min="0"
                      step="0.01"
                      defaultValue={product.sale_price ?? ""}
                      placeholder="Optional"
                    />
                    <small>Leave blank when there is no sale price.</small>
                  </label>

                  <label className={styles.field}>
                    <span>Processing fee (%)</span>
                    <input
                      type="number"
                      name="processing_fee_percent"
                      min="0"
                      step="0.01"
                      defaultValue={product.processing_fee_percent ?? 10}
                    />
                    <small>Applied automatically to online checkout.</small>
                  </label>

                  <div className={styles.quoteGuide}>
                    <span>QUOTATION RULE</span>
                    <strong>Service + ₱0</strong>
                    <p>
                      This makes the product quotation-only instead of sending
                      the customer to normal checkout.
                    </p>
                  </div>
                </div>
              </section>

              <section className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <span>LINKS</span>
                  <h2>Product media & demo</h2>
                </div>

                <div className={styles.fields}>
                  <label className={styles.field}>
                    <span>Image URL</span>
                    <input
                      type="url"
                      name="image_url"
                      defaultValue={product.image_url ?? ""}
                      placeholder="https://..."
                    />
                    <small>Public product image URL.</small>
                  </label>

                  <label className={styles.field}>
                    <span>Live demo URL</span>
                    <input
                      type="url"
                      name="demo_url"
                      defaultValue={product.demo_url ?? ""}
                      placeholder="https://..."
                    />
                    <small>Optional live demo for this product or tier.</small>
                  </label>
                </div>
              </section>
            </div>

            <aside className={styles.sidebar}>
              <section className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <span>SETTINGS</span>
                  <h2>Product setup</h2>
                </div>

                <div className={styles.sidebarFields}>
                  <label className={styles.field}>
                    <span>Product type</span>
                    <select
                      name="product_type"
                      defaultValue={product.product_type}
                    >
                      <option value="DOWNLOAD">Download</option>
                      <option value="GITHUB">GitHub</option>
                      <option value="SERVICE">Service</option>
                      <option value="MANUAL">Manual</option>
                    </select>
                    <small>
                      Customized systems and websites are usually Service.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Delivery method</span>
                    <select
                      name="delivery_method"
                      defaultValue={product.delivery_method}
                    >
                      <option value="DOWNLOAD">Download</option>
                      <option value="GITHUB">GitHub</option>
                      <option value="SERVICE">Service</option>
                      <option value="MANUAL">Manual</option>
                    </select>
                    <small>How the customer receives the purchase.</small>
                  </label>

                  <label className={styles.field}>
                    <span>Display order</span>
                    <input
                      type="number"
                      name="display_order"
                      min="0"
                      step="1"
                      defaultValue={product.display_order ?? 0}
                    />
                    <small>Lower numbers appear first.</small>
                  </label>
                </div>
              </section>

              <section className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <span>VISIBILITY</span>
                  <h2>Store status</h2>
                </div>

                <div className={styles.toggleList}>
                  <label className={styles.toggleCard}>
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={product.is_active}
                    />
                    <span>
                      <strong>Active</strong>
                      <small>Show this product publicly.</small>
                    </span>
                  </label>

                  <label className={styles.toggleCard}>
                    <input
                      type="checkbox"
                      name="is_featured"
                      defaultChecked={product.is_featured}
                    />
                    <span>
                      <strong>Featured</strong>
                      <small>Highlight it in featured sections.</small>
                    </span>
                  </label>
                </div>
              </section>

              <section className={styles.catalogGuide}>
                <span>CATALOG ORDER GUIDE</span>
                <div>
                  <p><b>1–4</b> Booking Systems</p>
                  <p><b>5–8</b> Business Starter Kits</p>
                  <p><b>9–12</b> Digital Product Shops</p>
                  <p><b>13–16</b> Physical Product Shops</p>
                  <p><b>17</b> Customized Website</p>
                </div>
              </section>

              <section className={styles.saveCard}>
                <div>
                  <span>READY TO SAVE?</span>
                  <h3>Update this product</h3>
                  <p>
                    Changes will update the storefront catalog immediately.
                  </p>
                </div>

                <button type="submit">
                  Save Changes <span>→</span>
                </button>

                <a href="/admin/products">Cancel</a>
              </section>
            </aside>
          </form>

          <section id="product-files" className={styles.filesSection}>
            <div className={styles.filesHeader}>
              <div className={styles.filesHeaderIcon}>⇩</div>
              <div className={styles.filesHeaderCopy}>
                <span>SECURE DELIVERY</span>
                <h2>Product files</h2>
                <p>
                  Upload and manage the private files buyers receive after a
                  verified payment.
                </p>
              </div>

              <div className={styles.filesCount}>
                <strong>{productFiles.length}</strong>
                <span>{productFiles.length === 1 ? "file" : "files"}</span>
              </div>
            </div>

            <div className={styles.filesBody}>
              {query.file_uploaded === "1" ? (
                <div className={styles.successNotice}>
                  <span>✓</span>
                  <div>
                    <strong>File uploaded</strong>
                    <small>It is now assigned to this product.</small>
                  </div>
                </div>
              ) : null}

              {query.file_updated === "1" ? (
                <div className={styles.successNotice}>
                  <span>✓</span>
                  <div>
                    <strong>File updated</strong>
                    <small>Delivery settings were saved.</small>
                  </div>
                </div>
              ) : null}

              {query.file_deleted === "1" ? (
                <div className={styles.successNotice}>
                  <span>✓</span>
                  <div>
                    <strong>File deleted</strong>
                    <small>The private file was removed.</small>
                  </div>
                </div>
              ) : null}

              {fileErrorMessage ? (
                <div className={styles.errorNotice}>
                  <span>!</span>
                  <div>
                    <strong>Couldn&apos;t manage file</strong>
                    <small>{fileErrorMessage}</small>
                  </div>
                </div>
              ) : null}

              <div className={styles.uploadCard}>
                <div className={styles.uploadIntro}>
                  <div className={styles.uploadIcon}>＋</div>
                  <div>
                    <strong>Add a product file</strong>
                    <p>
                      Stored privately in Supabase and delivered through
                      temporary signed links.
                    </p>
                  </div>
                  <span className={styles.privateBadge}>PRIVATE</span>
                </div>

                <form
                  action={uploadProductFile}
                  encType="multipart/form-data"
                  className={styles.uploadForm}
                >
                  <input type="hidden" name="product_id" value={product.id} />

                  <label className={styles.uploadField}>
                    <span>Customer file name</span>
                    <input
                      type="text"
                      name="display_name"
                      placeholder="e.g. Complete Booking System"
                    />
                    <small>
                      Optional — original file name is used if blank.
                    </small>
                  </label>

                  <label className={styles.filePicker}>
                    <span className={styles.filePickerIcon}>⇧</span>
                    <span className={styles.filePickerText}>
                      <strong>Choose file</strong>
                      <small>
                        ZIP, PDF, images, documents and more · max 50 MB
                      </small>
                    </span>
                    <input type="file" name="file" required />
                  </label>

                  <button type="submit" className={styles.uploadButton}>
                    Upload File <span>→</span>
                  </button>
                </form>
              </div>

              <div className={styles.libraryHeader}>
                <div>
                  <span>FILE LIBRARY</span>
                  <h3>Files assigned to this product</h3>
                </div>
                <small>Only active files are shown to buyers.</small>
              </div>

              {productFiles.length > 0 ? (
                <div className={styles.fileList}>
                  {productFiles.map((file, index) => {
                    const storageFileName =
                      file.storage_path.split("/").pop() ?? file.storage_path;

                    return (
                      <article key={file.id} className={styles.fileCard}>
                        <div className={styles.fileCardTop}>
                          <div className={styles.fileTypeIcon}>{index + 1}</div>

                          <div className={styles.fileTitle}>
                            <strong>{file.display_name}</strong>
                            <small title={storageFileName}>
                              {storageFileName}
                            </small>
                          </div>

                          <span
                            className={
                              file.is_active
                                ? styles.activeBadge
                                : styles.inactiveBadge
                            }
                          >
                            {file.is_active ? "ACTIVE" : "HIDDEN"}
                          </span>
                        </div>

                        <form
                          action={updateProductFile}
                          className={styles.fileSettings}
                        >
                          <input
                            type="hidden"
                            name="product_id"
                            value={product.id}
                          />
                          <input type="hidden" name="file_id" value={file.id} />

                          <label className={styles.miniField}>
                            <span>Display name</span>
                            <input
                              type="text"
                              name="display_name"
                              defaultValue={file.display_name}
                              required
                            />
                          </label>

                          <label className={styles.orderField}>
                            <span>Order</span>
                            <input
                              type="number"
                              name="display_order"
                              min="0"
                              step="1"
                              defaultValue={file.display_order ?? 0}
                              required
                            />
                          </label>

                          <label className={styles.activeToggle}>
                            <input
                              type="checkbox"
                              name="is_active"
                              defaultChecked={file.is_active}
                            />
                            <span className={styles.toggleTrack}>
                              <i />
                            </span>
                            <span className={styles.toggleCopy}>Active</span>
                          </label>

                          <button
                            type="submit"
                            className={styles.saveFileButton}
                          >
                            Save
                          </button>
                        </form>

                        <div className={styles.fileCardFooter}>
                          <div className={styles.secureMeta}>
                            <span>🔒</span>
                            <small>Private storage · signed links only</small>
                          </div>

                          <form action={deleteProductFile}>
                            <input
                              type="hidden"
                              name="product_id"
                              value={product.id}
                            />
                            <input
                              type="hidden"
                              name="file_id"
                              value={file.id}
                            />
                            <button
                              type="submit"
                              className={styles.deleteFileButton}
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.emptyFiles}>
                  <div>⇩</div>
                  <strong>No files uploaded yet</strong>
                  <p>
                    Add the files customers should receive after purchasing{" "}
                    {product.name}.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className={styles.dangerZone}>
            <div>
              <span>DANGER ZONE</span>
              <h2>Delete product</h2>
              <p>
                Permanently delete this product and its assigned private files.
              </p>
            </div>

            <form action={deleteProduct}>
              <input type="hidden" name="product_id" value={product.id} />
              <button type="submit">Delete Product</button>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}
