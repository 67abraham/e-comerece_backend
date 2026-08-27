import type { Request, Response } from "express";
import { logger } from "../../lib/logger";
import { prisma } from "../../lib/prisma";
import { broadcastMessage } from "../utility/websock";

const userId = (req: Request) => (req as any).user.id as string;
const isObjectId = (value: unknown): value is string => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

export const createCartItem = async (req: Request, res: Response) => {
  try {
    const productId = typeof req.body.productId === "string" ? req.body.productId : "";
    const quantity = Number(req.body.quantity);
    const selectedColor = typeof req.body.selectedColor === "string" && req.body.selectedColor.trim() ? req.body.selectedColor.trim() : null;
    const selectedSize = typeof req.body.selectedSize === "string" && req.body.selectedSize.trim() ? req.body.selectedSize.trim() : null;
    if (!isObjectId(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 1_000_000) {
      return res.status(400).json({ message: "A valid productId and quantity are required" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== "AVAILABLE") {
      return res.status(404).json({ message: "Product is not available" });
    }
    if (quantity < product.minimumOrder) {
      return res.status(400).json({ message: `Minimum order quantity is ${product.minimumOrder}` });
    }

    const cart = await prisma.$transaction(async tx => {
      const existing = await tx.cartItem.findFirst({
        where: { userId: userId(req), productId, ordered: false, selectedColor, selectedSize },
      });

      if (existing) {
        return tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity, unitPrice: product.price },
        });
      }

      return tx.cartItem.create({
        data: { userId: userId(req), productId, quantity, selectedColor, selectedSize, unitPrice: product.price },
      });
    });

    broadcastMessage({ event: "cart:updated", data: { userId: userId(req) } });
    return res.status(200).json(cart);
  } catch (error) {
    logger.error(`Error creating cart item: ${error}`);
    return res.status(500).json({ message: "Unable to add item to cart" });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const quantity = Number(req.body.quantity);
    if (!isObjectId(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 1_000_000) {
      return res.status(400).json({ message: "Invalid cart item or quantity" });
    }

    const existing = await prisma.cartItem.findFirst({
      where: { id, userId: userId(req), ordered: false },
      include: { product: { select: { minimumOrder: true, status: true } } },
    });
    if (!existing) return res.status(404).json({ message: "Cart item not found" });
    if (existing.product.status !== "AVAILABLE") return res.status(400).json({ message: "Product is no longer available" });
    if (quantity < existing.product.minimumOrder) return res.status(400).json({ message: `Minimum order quantity is ${existing.product.minimumOrder}` });

    const updated = await prisma.cartItem.update({ where: { id }, data: { quantity } });
    broadcastMessage({ event: "cart:updated", data: { userId: userId(req) } });
    return res.status(200).json(updated);
  } catch (error) {
    logger.error(`Error updating cart item: ${error}`);
    return res.status(500).json({ message: "Unable to update cart item" });
  }
};

export const delCartItem = async (req: Request, res: Response) => {
  try {
    const id = typeof req.body.id === "string" ? req.body.id : "";
    if (!isObjectId(id)) return res.status(400).json({ message: "Cart item id is required" });

    const existing = await prisma.cartItem.findFirst({ where: { id, userId: userId(req) } });
    if (!existing) return res.status(404).json({ message: "Cart item not found" });

    await prisma.cartItem.delete({ where: { id } });
    broadcastMessage({ event: "cart:updated", data: { userId: userId(req) } });
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting cart item: ${error}`);
    return res.status(500).json({ message: "Unable to delete cart item" });
  }
};

export const getCartItem = async (req: Request, res: Response) => {
  try {
    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);
    const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 100_000) : 1;
    const limit = Number.isSafeInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20;
    const skip = (page - 1) * limit;
    const uid = userId(req);

    const [getAllCart, totalCart, billingAddress] = await Promise.all([
      prisma.cartItem.findMany({
        skip,
        take: limit,
        where: { userId: uid, ordered: false },
        include: { product: true },
        orderBy: { createAt: "desc" },
      }),
      prisma.cartItem.count({ where: { userId: uid, ordered: false } }),
      prisma.billingInfo.findFirst({ where: { userId: uid } }),
    ]);

    const totalPrice = getAllCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalPage = Math.ceil(totalCart / limit);

    return res.status(200).json({
      getAllCart,
      totalPrice,
      totalPage,
      skip,
      billingAddress: billingAddress ? [billingAddress] : [],
      hasNextPage: page < totalPage,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    logger.error(`Error getting cart: ${error}`);
    return res.status(500).json({ message: "Unable to fetch cart" });
  }
};
