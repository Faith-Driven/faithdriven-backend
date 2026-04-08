import { validateCart } from "../services/cart.service.js";
import { calculateShipping, buildTotals } from "../services/pricing.service.js";
import {
  createPaypalOrder,
  capturePaypalOrder
} from "../services/paypal.service.js";
import { createOrder } from "../services/order.service.js";
import { reduceStockByItems } from "../services/inventory.service.js";
import { insertPayment } from "../repositories/payments.repository.js";
import { badRequest } from "../utils/errors.js";

export async function createPaypalOrderController(req, res, next) {
  try {
    const { items, customer } = req.body;

    if (!customer || !customer.country) {
      throw badRequest("Kundendaten unvollständig");
    }

    const cart = await validateCart(items);

    const shipping = calculateShipping({
      country: customer.country,
      subtotalCents: cart.subtotal_cents
    });

    const totals = buildTotals({
      subtotalCents: cart.subtotal_cents,
      shippingCents: shipping.shipping_cents
    });

    const paypalOrder = await createPaypalOrder({
      totalCents: totals.total_cents,
      currency: cart.currency || "EUR"
    });

    return res.status(200).json({
      paypal_order_id: paypalOrder.id,
      shipping_method: shipping.shipping_method,
      totals,
      items: cart.items
    });
  } catch (error) {
    next(error);
  }
}

export async function capturePaypalOrderController(req, res, next) {
  try {
    const { paypal_order_id, items, customer } = req.body;

    if (!paypal_order_id) {
      throw badRequest("paypal_order_id fehlt");
    }

    if (!customer) {
      throw badRequest("customer fehlt");
    }

    const capture = await capturePaypalOrder(paypal_order_id);

    if (capture.status !== "COMPLETED") {
      return res.status(400).json({
        message: "Zahlung nicht erfolgreich",
        paypal_status: capture.status
      });
    }

    const cart = await validateCart(items);

    const shipping = calculateShipping({
      country: customer.country,
      subtotalCents: cart.subtotal_cents
    });

    const totals = buildTotals({
      subtotalCents: cart.subtotal_cents,
      shippingCents: shipping.shipping_cents
    });

    const order = await createOrder({
      customer,
      items: cart.items,
      totals,
      paypalOrderId: paypal_order_id
    });

    const captureUnit = capture.purchase_units?.[0];
    const paypalCapture =
      captureUnit?.payments?.captures?.[0];

    await insertPayment({
      orderId: order.id,
      provider: "paypal",
      providerOrderId: paypal_order_id,
      providerCaptureId: paypalCapture?.id || null,
      amountCents: totals.total_cents,
      currency: "EUR",
      status: "paid",
      rawResponse: capture
    });

    await reduceStockByItems(cart.items);

    return res.status(200).json({
      message: "Bestellung erfolgreich gespeichert",
      order_id: order.id,
      order_number: order.order_number,
      payment_status: "paid",
      order_status: "confirmed"
    });
  } catch (error) {
    next(error);
  }
}