export function calculateShipping({ country, subtotalCents }) {
  const normalizedCountry = String(country || "").trim().toUpperCase();

  if (normalizedCountry !== "DE" && normalizedCountry !== "DEUTSCHLAND") {
    return {
      shipping_method: "international_standard",
      shipping_cents: 1490
    };
  }

  if (subtotalCents >= 8000) {
    return {
      shipping_method: "standard_free",
      shipping_cents: 0
    };
  }

  return {
    shipping_method: "standard_de",
    shipping_cents: 490
  };
}

export function buildTotals({ subtotalCents, shippingCents }) {
  return {
    subtotal_cents: subtotalCents,
    shipping_cents: shippingCents,
    total_cents: subtotalCents + shippingCents
  };
}