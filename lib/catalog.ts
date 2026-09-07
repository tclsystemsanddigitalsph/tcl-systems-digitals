import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import type { Product } from "@/lib/products";

// Only public catalog fields leave this server module. Never select delivery secrets.
const fields = "id,name,slug,short_description,description,category,product_type,price,processing_fee_percent,sale_price,badge,image_url,demo_url,is_featured,display_order,created_at";
export async function getCatalog(): Promise<{ products: Product[]; failed: boolean }> {
  try {
    const { data, error } = await createAdminSupabaseClient().from("products")
      .select(fields).eq("is_active", true).order("display_order").order("name");
    if (error) throw error;
    return { products: (data ?? []) as Product[], failed: false };
  } catch {
    console.error("Unable to load the public product catalog.");
    return { products: [], failed: true };
  }
}
export async function getCatalogProduct(slug: string): Promise<Product | null> {
  const { data, error } = await createAdminSupabaseClient().from("products")
    .select(fields).eq("is_active", true).eq("slug", slug).maybeSingle();
  if (error) throw new Error("Unable to load this product.");
  return data as Product | null;
}
