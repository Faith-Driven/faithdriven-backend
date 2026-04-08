import paypal from "@paypal/checkout-server-sdk";
import { env } from "./env.js";

function buildEnvironment() {
  if (env.paypalEnv === "live") {
    return new paypal.core.LiveEnvironment(
      env.paypalClientId,
      env.paypalClientSecret
    );
  }

  return new paypal.core.SandboxEnvironment(
    env.paypalClientId,
    env.paypalClientSecret
  );
}

const environment = buildEnvironment();

export const paypalClient = new paypal.core.PayPalHttpClient(environment);
export { paypal };