import { Request, Response } from "express";
import prisma from "../configs/prisma";
import cloudinary from "../configs/cloudinary";
import { unlink } from "fs/promises";

// Create Product
export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price } = req.body;

  try {
    if (!name || !description || !price) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let imageUrl = null;

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "products",
          use_filename: true,
        });
        imageUrl = result.secure_url;
        await unlink(req.file.path);
      } catch (uploadError) {
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
      },
    });
    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create product" });
  }
};

// Get All Products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get Product by ID
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch product" });
  }
};

// Update Product
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    let imageUrl = existingProduct.imageUrl;

    // Upload new image to the cloudinary if it exists
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "products",
          use_filename: true,
        });
        imageUrl = result.secure_url;
        await unlink(req.file.path); // Delete temporary file

        // Delete old image from Cloudinary if it exists
        if (existingProduct.imageUrl) {
          const publicId = existingProduct.imageUrl
            .split("/")
            .pop()
            ?.split(".")[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`products/${publicId}`);
          }
        }
      } catch (uploadError) {
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingProduct.name,
        description: description || existingProduct.description,
        price: price ? parseFloat(price) : existingProduct.price,
        imageUrl,
      },
    });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update product" });
  }
};

// Delete Product
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete image from Cloudinary if it exists
    if (product.imageUrl) {
      const publicId = product.imageUrl.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      }
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete product" });
  }
};
