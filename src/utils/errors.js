export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFound(message = "Nicht gefunden") {
  return new AppError(message, 404);
}

export function badRequest(message = "Ungültige Anfrage", details = null) {
  return new AppError(message, 400, details);
}

export function conflict(message = "Konflikt", details = null) {
  return new AppError(message, 409, details);
}