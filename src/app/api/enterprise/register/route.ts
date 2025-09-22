import { NextRequest, NextResponse } from "next/server";
import {
  createAccountForEnterprise,
  hashPassword,
} from "@/services/auth.service";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Schema validation for enterprise registration
const enterpriseRegisterSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().max(100),
  password: z.string().min(6),
  enterpriseName: z.string().min(2).max(100),
  address: z.string().min(5).max(255),
  phoneNumber: z.string().min(10).max(15),
  description: z.string().max(255).optional(),
  openHours: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  closeHours: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = enterpriseRegisterSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      username,
      email,
      password,
      enterpriseName,
      address,
      phoneNumber,
      description,
      openHours,
      closeHours,
    } = parsed.data;

    // Check if username, email, enterprise name, or phone number already exists
    const [accountExists, enterpriseExists] = await Promise.all([
      prisma.account.findFirst({
        where: {
          OR: [{ Email: email }, { Username: username }],
        },
        select: { AccountID: true, Email: true, Username: true },
      }),
      prisma.enterprise.findFirst({
        where: {
          OR: [
            { EnterpriseName: enterpriseName },
            { PhoneNumber: phoneNumber },
          ],
        },
        select: { EnterpriseName: true, PhoneNumber: true },
      }),
    ]);

    // Check account conflicts
    if (accountExists) {
      const field = accountExists.Email === email ? "email" : "username";
      return NextResponse.json(
        {
          error: `${field} already exists`,
          field: field,
        },
        { status: 400 }
      );
    }

    // Check enterprise conflicts
    if (enterpriseExists) {
      const field =
        enterpriseExists.EnterpriseName === enterpriseName
          ? "enterprise name"
          : "phone number";
      return NextResponse.json(
        {
          error: `Enterprise ${field} already exists`,
          field: field === "enterprise name" ? "enterpriseName" : "phoneNumber",
        },
        { status: 400 }
      );
    }

    // Validate time logic (open should be before close)
    const [openHour, openMin] = openHours.split(":").map(Number);
    const [closeHour, closeMin] = closeHours.split(":").map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    if (openTime >= closeTime) {
      return NextResponse.json(
        {
          error: "Open hours must be before close hours",
          field: "hours",
        },
        { status: 400 }
      );
    }

    // Hash password and create account with enterprise record
    const passwordHash = await hashPassword(password);
    const account = await createAccountForEnterprise({
      username,
      email,
      passwordHash,
      enterpriseName,
      address,
      phoneNumber,
      description,
      openHours,
      closeHours,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Enterprise registration successful",
        account: {
          id: account.AccountID,
          username: account.Username,
          email: account.Email,
          role: account.role?.RoleName,
          status: account.Status,
          enterprise: account.enterprise,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enterprise registration error:", error);
    return NextResponse.json(
      {
        error: "Registration failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
