import { Request, Response } from "express";
import prisma from "../configs/prisma";

// Create Order
export const createOrder = async (req: Request, res: Response) => {
  const { userId, products, totalAmount, status } = req.body;

  try {
    if (
      !userId ||
      !products ||
      !Array.isArray(products) ||
      products.length === 0 ||
      !totalAmount ||
      !status
    ) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        status,
        products: {
          create: products.map((product: any) => ({
            productId: product.productId,
            quantity: product.quantity,
            price: product.price,
          })),
        },
      },
      include: {
        products: true,
      },
    });

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create order" });
  }
};

// Get All Orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!orders) {
      return res.status(404).json({ error: "No orders found" });
    }

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get Order by ID
export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch order" });
  }
};

// Update Order Status
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update order status" });
  }
};
