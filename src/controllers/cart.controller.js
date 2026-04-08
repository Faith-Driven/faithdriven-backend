import { validateCart } from "../services/cart.service.js";

export async function validateCartController(req, res, next) {
  try {
    const { items } = req.body;
    const result = await validateCart(items);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}