import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Umgebungsvariable fehlt: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 8080),
  nodeEnv: process.env.NODE_ENV || "development",

  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),

  paypalClientId: required("PAYPAL_CLIENT_ID"),
  paypalClientSecret: required("PAYPAL_CLIENT_SECRET"),
  paypalEnv: process.env.PAYPAL_ENV || "sandbox",

  allowedOrigins: (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
};