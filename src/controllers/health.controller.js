export function healthController(req, res) {
  res.status(200).json({
    ok: true,
    service: "faithdriven-backend",
    timestamp: new Date().toISOString()
  });
}