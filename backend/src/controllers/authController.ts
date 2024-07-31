import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../configs/prisma";

// User Registration
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, username, name } = req.body;

  try {
    if (!email || !password || !username || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        name,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json({ userData: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ error: "Failed to register user" });
  }
};

// User Login
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token, userId: user.id });
  } catch (error) {
    return res.status(500).json({ error: "Failed to login" });
  }
};

// Get All Users (Example Route)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Do not select the password field
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!users) {
      return res.status(404).json({ error: "No users found" });
    }

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};
