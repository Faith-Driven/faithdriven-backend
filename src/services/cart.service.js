import { findVariantsByIds } from "../repositories/products.repository.js";
import { badRequest, conflict } from "../utils/errors.js";
import { calculateLineTotal, sumCents } from "../utils/money.js";

function validateCartInput(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw badRequest("Der Warenkorb ist leer");
  }

  for (const item of items) {
    if (!item || !Number.isInteger(item.variant_id)) {
      throw badRequest("Jeder Artikel benötigt eine gültige variant_id");
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw badRequest("Jeder Artikel benötigt eine gültige quantity");
    }
  }
}

export async function validateCart(items) {
  validateCartInput(items);

  const mergedItemsMap = new Map();

  for (const item of items) {
    const current = mergedItemsMap.get(item.variant_id) || 0;
    mergedItemsMap.set(item.variant_id, current + item.quantity);
  }

  const normalizedInputItems = Array.from(mergedItemsMap.entries()).map(
    ([variantId, quantity]) => ({
      variant_id: variantId,
      quantity
    })
  );

  const variantIds = normalizedInputItems.map((item) => item.variant_id);
  const variants = await findVariantsByIds(variantIds);

  if (variants.length !== variantIds.length) {
    throw badRequest("Mindestens eine Variante existiert nicht mehr");
  }

  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));

  const resultItems = [];

  for (const item of normalizedInputItems) {
    const variant = variantsById.get(item.variant_id);
    const product = variant?.products;

    if (!variant || !product) {
      throw badRequest(`Variante ${item.variant_id} ist ungültig`);
    }

    if (!variant.active || !product.active) {
      throw conflict(`Artikel ${product.name} ist aktuell nicht verfügbar`);
    }

    const availableStock =
      Number(variant.stock || 0) - Number(variant.reserved_stock || 0);

    if (item.quantity > availableStock) {
      throw conflict(
        `Nicht genug Bestand für ${product.name} (${variant.size}). Verfügbar: ${availableStock}`
      );
    }

    const unitPriceCents = Number(product.price_cents || 0);
    const quantity = item.quantity;
    const lineTotalCents = calculateLineTotal(unitPriceCents, quantity);

    resultItems.push({
      product_id: product.id,
      variant_id: variant.id,
      product_slug: product.slug,
      product_name: product.name,
      color: variant.color || product.color || null,
      size: variant.size,
      sku: variant.sku,
      image_url: product.image_url || null,
      unit_price_cents: unitPriceCents,
      quantity,
      line_total_cents: lineTotalCents,
      currency: product.currency || "EUR"
    });
  }

  const subtotalCents = sumCents(resultItems.map((item) => item.line_total_cents));

  return {
    items: resultItems,
    subtotal_cents: subtotalCents,
    currency: "EUR"
  };
}