import { requireEnterprise } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authResult = await requireEnterprise(request);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const user = authResult.user!;
  try {
    const enterpriseProfile = await prisma.enterprise.findUnique({
      where: { AccountID: user.id },
      select: {
        EnterpriseID: true,
        EnterpriseName: true,
        Address: true,
        PhoneNumber: true,
        Description: true,
        Logo: true,
        OpenHours: true,
        CloseHours: true,
        account: {
          select: {
            Email: true,
          },
        },
        menus: {
          select: {
            MenuID: true,
            MenuName: true,
            Description: true,
          },
          orderBy: { MenuName: "asc" },
        },
        foods: {
          select: {
            FoodID: true,
            DishName: true,
            Description: true,
            Price: true,
            ImageURL: true,
            Stock: true,
            foodCategory: { select: { CategoryName: true } },
          },
        },
      },
    });
    if (!enterpriseProfile) {
      return NextResponse.json(
        { error: "Enterprise profile not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ enterprise: enterpriseProfile });
  } catch (error) {
    console.error("Error fetching enterprise profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch enterprise profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireEnterprise(request);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const user = authResult.user!;

  try {
    const body = await request.json();
    const {
      EnterpriseName,
      Address,
      PhoneNumber,
      Description,
      Logo,
      OpenHours,
      CloseHours,
    } = body;

    // Validate required fields
    if (!EnterpriseName?.trim()) {
      return NextResponse.json(
        { error: "Enterprise name is required" },
        { status: 400 }
      );
    }

    // Check if enterprise profile exists
    const existingEnterprise = await prisma.enterprise.findUnique({
      where: { AccountID: user.id },
    });

    if (!existingEnterprise) {
      return NextResponse.json(
        { error: "Enterprise profile not found" },
        { status: 404 }
      );
    }

    // Update enterprise profile
    const updatedEnterprise = await prisma.enterprise.update({
      where: { AccountID: user.id },
      data: {
        EnterpriseName: EnterpriseName.trim(),
        Address: Address?.trim() || null,
        PhoneNumber: PhoneNumber?.trim() || null,
        Description: Description?.trim() || null,
        Logo: Logo || null,
        OpenHours: OpenHours || null,
        CloseHours: CloseHours || null,
        UpdatedAt: new Date(),
      },
      select: {
        EnterpriseID: true,
        EnterpriseName: true,
        Address: true,
        PhoneNumber: true,
        Description: true,
        Logo: true,
        OpenHours: true,
        CloseHours: true,
        account: {
          select: {
            Email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Enterprise profile updated successfully",
      enterprise: updatedEnterprise,
    });
  } catch (error) {
    console.error("Error updating enterprise profile:", error);
    return NextResponse.json(
      { error: "Failed to update enterprise profile" },
      { status: 500 }
    );
  }
}
