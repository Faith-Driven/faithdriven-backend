import { supabase } from "../config/supabase.js";
import { AppError } from "../utils/errors.js";

export async function findVariantsByIds(variantIds) {
  const { data, error } = await supabase
    .from("product_variants")
    .select(`
      id,
      product_id,
      size,
      color,
      sku,
      stock,
      reserved_stock,
      active,
      products (
        id,
        slug,
        name,
        color,
        price_cents,
        image_url,
        active,
        currency
      )
    `)
    .in("id", variantIds);

  if (error) {
    throw new AppError("Fehler beim Laden der Varianten", 500, error);
  }

  return data || [];
}