import { supabase } from "../config/supabase.js";
import { AppError } from "../utils/errors.js";

export async function createOrder({
  customer,
  items,
  totals,
  paypalOrderId
}) {
  const orderNumber = `FD-${Date.now()}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_email: customer.email,
      customer_name: [customer.first_name, customer.last_name].filter(Boolean).join(" "),
      first_name: customer.first_name,
      last_name: customer.last_name,
      address: customer.address,
      shipping_address_1: customer.address,
      shipping_address_2: customer.apartment || null,
      postal_code: customer.postal_code,
      city: customer.city,
      country: customer.country,
      phone: customer.phone || null,
      payment_method: "paypal",
      payment_status: "paid",
      order_status: "confirmed",
      fulfillment_status: "pending",
      shipping_method: totals.shipping_cents > 0 ? "standard" : "standard_free",
      shipping_cents: totals.shipping_cents,
      subtotal_cents: totals.subtotal_cents,
      total_cents: totals.total_cents,
      currency: "EUR",
      paypal_order_id: paypalOrderId
    })
    .select()
    .single();

  if (orderError) {
    throw new AppError("Fehler beim Erstellen der Bestellung", 500, orderError);
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_slug: item.product_slug,
    product_name: item.product_name,
    color: item.color,
    size: item.size,
    sku: item.sku,
    quantity: item.quantity,
    unit_price_cents: item.unit_price_cents,
    total_price_cents: item.line_total_cents,
    image_url: item.image_url || null
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    throw new AppError("Fehler beim Speichern der Order Items", 500, itemsError);
  }

  return order;
}