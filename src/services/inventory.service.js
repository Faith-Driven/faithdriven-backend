import { supabase } from "../config/supabase.js";
import { AppError, conflict } from "../utils/errors.js";

export async function reduceStockByItems(items) {
  for (const item of items) {
    const { data: variant, error: loadError } = await supabase
      .from("product_variants")
      .select("id, stock, reserved_stock")
      .eq("id", item.variant_id)
      .single();

    if (loadError) {
      throw new AppError("Fehler beim Laden des Bestands", 500, loadError);
    }

    const currentStock = Number(variant.stock || 0);
    const reservedStock = Number(variant.reserved_stock || 0);
    const availableStock = currentStock - reservedStock;

    if (item.quantity > availableStock) {
      throw conflict(
        `Bestand reicht nicht mehr für Variante ${item.variant_id}. Verfügbar: ${availableStock}`
      );
    }

    const newStock = currentStock - item.quantity;

    const { error: updateError } = await supabase
      .from("product_variants")
      .update({
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq("id", item.variant_id);

    if (updateError) {
      throw new AppError("Fehler beim Reduzieren des Bestands", 500, updateError);
    }
  }
}