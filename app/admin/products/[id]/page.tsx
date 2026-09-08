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
import styles from "./page.module.css";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
    updated?: string;
    file_error?: string;
    file_uploaded?: string;
    file_updated?: string;
    file_deleted?: string;
  }>;
};

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

  if (!user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const query = await searchParams;

  const adminSupabase = createAdminSupabaseClient();

  const [productResult, filesResult] = await Promise.all([
    adminSupabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle(),

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

  if (!product) {
    notFound();
  }

  const productFiles = filesResult.data ?? [];
  const errorMessage = getErrorMessage(query.error);
  const fileErrorMessage = getFileErrorMessage(query.file_error);

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="products" email={user.email} />

        <section className="store-admin-main">
          <header className="store-admin-topbar">
            <div>
              <span className="store-admin-eyebrow">
                PRODUCT CATALOG
              </span>

              <h1>Edit Product</h1>

              <p>
                Update {product.name} and its storefront settings.
              </p>

              <a
                className="store-admin-page-back"
                href="/admin/products"
              >
                ← Back to Products
              </a>
            </div>
          </header>

          {query.updated === "1" ? (
            <div className="store-admin-form-success">
              <strong>Product updated ♡</strong>
              <span>
                Your changes have been saved successfully.
              </span>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="store-admin-form-error">
              <strong>Couldn&apos;t update product</strong>
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <form
            action={updateProduct}
            className="store-admin-product-form"
          >
            <input
              type="hidden"
              name="product_id"
              value={product.id}
            />

            <div className="store-admin-form-main">
              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>PRODUCT DETAILS</span>
                  <h2>Basic information</h2>

                  <p>
                    Update the information customers see about this
                    product.
                  </p>
                </div>

                <div className="store-admin-form-fields">
                  <label className="store-admin-field">
                    <span>Product name *</span>

                    <input
                      type="text"
                      name="name"
                      defaultValue={product.name}
                      required
                    />
                  </label>

                  <label className="store-admin-field">
                    <span>Product slug *</span>

                    <input
                      type="text"
                      name="slug"
                      defaultValue={product.slug}
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      title="Use lowercase letters, numbers, and hyphens only."
                      required
                    />

                    <small>Used in the product URL.</small>
                  </label>

                  <label className="store-admin-field">
                    <span>Short description</span>

                    <textarea
                      name="short_description"
                      rows={3}
                      defaultValue={product.short_description ?? ""}
                    />
                  </label>

                  <label className="store-admin-field">
                    <span>Full description</span>

                    <textarea
                      name="description"
                      rows={7}
                      defaultValue={product.description ?? ""}
                    />
                  </label>

                  <div className="store-admin-form-row">
                    <label className="store-admin-field">
                      <span>Category</span>

                      <input
                        type="text"
                        name="category"
                        defaultValue={
                          product.category ?? "Digital Products"
                        }
                      />
                    </label>

                    <label className="store-admin-field">
                      <span>Badge</span>

                      <input
                        type="text"
                        name="badge"
                        defaultValue={product.badge ?? ""}
                        placeholder="e.g. Best Seller"
                      />
                    </label>
                  </div>
                </div>
              </section>

              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>POST-PURCHASE</span>
                  <h2>Customer instructions</h2>

                  <p>
                    These instructions appear only after a verified
                    successful payment.
                  </p>
                </div>

                <div className="store-admin-form-fields">
                  <label className="store-admin-field">
                    <span>Post-purchase instructions</span>

                    <textarea
                      name="post_purchase_instructions"
                      rows={8}
                      defaultValue={
                        product.post_purchase_instructions ?? ""
                      }
                      placeholder="Example: Download all included files below. Read the setup guide first, then follow the installation instructions..."
                    />

                    <small>
                      Keep private download links out of this field.
                      Files are delivered separately through secure
                      signed URLs.
                    </small>
                  </label>
                </div>
              </section>

              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>PRICING</span>

                  <h2>Price &amp; fees</h2>

                  <p>
                    Update the regular price, sale price, and
                    processing fee.
                  </p>
                </div>

                <div className="store-admin-form-fields">
                  <div className="store-admin-form-row">
                    <label className="store-admin-field">
                      <span>Regular price (₱) *</span>

                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        defaultValue={product.price ?? 0}
                        required
                      />
                    </label>

                    <label className="store-admin-field">
                      <span>Sale price (₱)</span>

                      <input
                        type="number"
                        name="sale_price"
                        min="0"
                        step="0.01"
                        defaultValue={product.sale_price ?? ""}
                        placeholder="Optional"
                      />
                    </label>
                  </div>

                  <label className="store-admin-field">
                    <span>Processing fee (%)</span>

                    <input
                      type="number"
                      name="processing_fee_percent"
                      min="0"
                      step="0.01"
                      defaultValue={
                        product.processing_fee_percent ?? 10
                      }
                    />
                  </label>
                </div>
              </section>

              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>LINKS</span>

                  <h2>Product links</h2>

                  <p>
                    Update the product image and live demo
                    destinations.
                  </p>
                </div>

                <div className="store-admin-form-fields">
                  <label className="store-admin-field">
                    <span>Image URL</span>

                    <input
                      type="url"
                      name="image_url"
                      defaultValue={product.image_url ?? ""}
                      placeholder="https://..."
                    />
                  </label>

                  <label className="store-admin-field">
                    <span>Live demo URL</span>

                    <input
                      type="url"
                      name="demo_url"
                      defaultValue={product.demo_url ?? ""}
                      placeholder="https://..."
                    />
                  </label>
                </div>
              </section>
            </div>

            <aside className="store-admin-form-sidebar">
              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>SETTINGS</span>

                  <h2>Product setup</h2>
                </div>

                <div className="store-admin-form-fields">
                  <label className="store-admin-field">
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
                  </label>

                  <label className="store-admin-field">
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
                  </label>

                  <label className="store-admin-field">
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

              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>VISIBILITY</span>

                  <h2>Store status</h2>
                </div>

                <div className="store-admin-toggle-list">
                  <label className="store-admin-checkbox">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={product.is_active}
                    />

                    <span>
                      <strong>Active</strong>

                      <small>
                        Show this product publicly in the store.
                      </small>
                    </span>
                  </label>

                  <label className="store-admin-checkbox">
                    <input
                      type="checkbox"
                      name="is_featured"
                      defaultChecked={product.is_featured}
                    />

                    <span>
                      <strong>Featured</strong>

                      <small>
                        Highlight this product in featured
                        sections.
                      </small>
                    </span>
                  </label>
                </div>
              </section>

              <section className="store-admin-save-card">
                <p>
                  Saving will update this product in your
                  Supabase catalog.
                </p>

                <button
                  className="store-admin-save-product"
                  type="submit"
                >
                  Save Changes
                  <span>→</span>
                </button>

                <a href="/admin/products">Cancel</a>
              </section>
            </aside>
          </form>

          <section
            id="product-files"
            className={styles.filesSection}
          >
            <div className={styles.filesHeader}>
              <div className={styles.filesHeaderIcon}>
                ⇩
              </div>

              <div className={styles.filesHeaderCopy}>
                <span>SECURE DELIVERY</span>
                <h2>Product files</h2>
                <p>
                  Upload the actual files buyers receive after a
                  verified payment.
                </p>
              </div>

              <div className={styles.filesCount}>
                <strong>{productFiles.length}</strong>
                <span>
                  {productFiles.length === 1 ? "file" : "files"}
                </span>
              </div>
            </div>

            <div className={styles.filesBody}>
              {query.file_uploaded === "1" ? (
                <div className={styles.successNotice}>
                  <span>✓</span>
                  <div>
                    <strong>File uploaded</strong>
                    <small>
                      It is now assigned to this product.
                    </small>
                  </div>
                </div>
              ) : null}

              {query.file_updated === "1" ? (
                <div className={styles.successNotice}>
                  <span>✓</span>
                  <div>
                    <strong>File updated</strong>
                    <small>
                      Delivery settings were saved.
                    </small>
                  </div>
                </div>
              ) : null}

              {query.file_deleted === "1" ? (
                <div className={styles.successNotice}>
                  <span>✓</span>
                  <div>
                    <strong>File deleted</strong>
                    <small>
                      The private file was removed.
                    </small>
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
                      Files are stored privately in Supabase and
                      delivered with temporary signed links.
                    </p>
                  </div>

                  <span className={styles.privateBadge}>
                    PRIVATE
                  </span>
                </div>

                <form
                  action={uploadProductFile}
                  encType="multipart/form-data"
                  className={styles.uploadForm}
                >
                  <input
                    type="hidden"
                    name="product_id"
                    value={product.id}
                  />

                  <label className={styles.uploadField}>
                    <span>Customer file name</span>

                    <input
                      type="text"
                      name="display_name"
                      placeholder="e.g. Complete Booking System"
                    />

                    <small>
                      Optional — the original file name is used if
                      blank.
                    </small>
                  </label>

                  <label className={styles.filePicker}>
                    <span className={styles.filePickerIcon}>
                      ⇧
                    </span>

                    <span className={styles.filePickerText}>
                      <strong>Choose file</strong>
                      <small>
                        ZIP, PDF, images, documents and more · max
                        50 MB
                      </small>
                    </span>

                    <input
                      type="file"
                      name="file"
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    className={styles.uploadButton}
                  >
                    Upload File
                    <span>→</span>
                  </button>
                </form>
              </div>

              <div className={styles.libraryHeader}>
                <div>
                  <span>FILE LIBRARY</span>
                  <h3>Files assigned to this product</h3>
                </div>

                <small>
                  Only active files are shown to buyers.
                </small>
              </div>

              {productFiles.length > 0 ? (
                <div className={styles.fileList}>
                  {productFiles.map((file, index) => {
                    const storageFileName =
                      file.storage_path.split("/").pop() ??
                      file.storage_path;

                    return (
                      <article
                        key={file.id}
                        className={styles.fileCard}
                      >
                        <div className={styles.fileCardTop}>
                          <div className={styles.fileTypeIcon}>
                            {index + 1}
                          </div>

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

                          <input
                            type="hidden"
                            name="file_id"
                            value={file.id}
                          />

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

                            <span className={styles.toggleCopy}>
                              Active
                            </span>
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
                            <small>
                              Private storage · signed links only
                            </small>
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
                    Add the files customers should receive after
                    purchasing {product.name}.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="store-admin-danger-zone">
            <div>
              <span>DANGER ZONE</span>

              <h2>Delete product</h2>

              <p>
                Permanently delete this product from the catalog.
                Its assigned private product files will also be
                removed.
              </p>
            </div>

            <form action={deleteProduct}>
              <input
                type="hidden"
                name="product_id"
                value={product.id}
              />

              <button
                type="submit"
                className="store-admin-delete-product"
              >
                Delete Product
              </button>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}
