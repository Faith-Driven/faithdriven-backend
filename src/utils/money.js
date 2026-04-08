import { badRequest } from "./errors.js";

export function centsToPaypalString(cents) {
  if (!Number.isInteger(cents) || cents < 0) {
    throw badRequest("Ungültiger Geldbetrag in Cents");
  }
  return (cents / 100).toFixed(2);
}

export function calculateLineTotal(unitPriceCents, quantity) {
  if (!Number.isInteger(unitPriceCents) || unitPriceCents < 0) {
    throw badRequest("Ungültiger Einzelpreis");
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw badRequest("Ungültige Menge");
  }
  return unitPriceCents * quantity;
}

export function sumCents(values) {
  return values.reduce((sum, value) => sum + value, 0);
}