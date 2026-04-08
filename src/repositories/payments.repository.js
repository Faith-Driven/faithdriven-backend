import { supabase } from "../config/supabase.js";
import { AppError } from "../utils/errors.js";

export async function insertPayment({
  orderId,
  provider,
  providerOrderId,
  providerCaptureId,
  amountCents,
  currency,
  status,
  rawResponse
}) {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      order_id: orderId,
      provider,
      provider_order_id: providerOrderId,
      provider_capture_id: providerCaptureId,
      amount_cents: amountCents,
      currency,
      status,
      raw_response: rawResponse
    })
    .select()
    .single();

  if (error) {
    throw new AppError("Fehler beim Speichern der Zahlung", 500, error);
  }

  return data;
}