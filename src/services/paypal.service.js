import { paypalClient, paypal } from "../config/paypal.js";

export async function createPaypalOrder({ totalCents, currency = "EUR" }) {
  const request = new paypal.orders.OrdersCreateRequest();

  request.prefer("return=representation");

  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: (totalCents / 100).toFixed(2)
        }
      }
    ]
  });

  const response = await paypalClient.execute(request);
  return response.result;
}

export async function capturePaypalOrder(paypalOrderId) {
  const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
  request.requestBody({});

  const response = await paypalClient.execute(request);
  return response.result;
}