import { requireEnterprise } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireEnterprise(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    const user = authResult.user!;
    const body = await request.json();
    const { DishName, Description, Price, Stock, ImageURL, FoodCategoryID } =
      body;
    if (!DishName || Price == null || Stock == null || !FoodCategoryID) {
      return NextResponse.json(
        { error: "Dish name, price, stock, and category are required" },
        { status: 400 }
      );
    }
    const enterprise = await prisma.enterprise.findUnique({
      where: { AccountID: user.id },
    });
    if (!enterprise) {
      return NextResponse.json(
        { error: "Enterprise profile not found" },
        { status: 404 }
      );
    }
    const newDish = await prisma.food.create({
      data: {
        DishName,
        Description,
        Price,
        Stock,
        ImageURL,
        FoodCategoryID,
        EnterpriseID: enterprise.EnterpriseID,
      },
    });
    return NextResponse.json({ dish: newDish }, { status: 201 });
  } catch (error) {
    console.error("Error creating dish:", error);
    return NextResponse.json(
      { error: "Failed to create dish" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireEnterprise(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    const user = authResult.user!;
    const { searchParams } = new URL(request.url);
    const foodId = searchParams.get("foodId");

    if (!foodId) {
      return NextResponse.json(
        { error: "Food ID is required" },
        { status: 400 }
      );
    }
    const enterprise = await prisma.enterprise.findUnique({
      where: { AccountID: user.id },
    });

    if (!enterprise) {
      return NextResponse.json(
        { error: "Enterprise profile not found" },
        { status: 404 }
      );
    }

    const existingFood = await prisma.food.findUnique({
      where: { FoodID: foodId },
    });

    if (
      !existingFood ||
      existingFood.EnterpriseID !== enterprise.EnterpriseID
    ) {
      return NextResponse.json({ error: "Food not found" }, { status: 404 });
    }

    await prisma.food.delete({
      where: { FoodID: foodId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting food item:", error);
    return NextResponse.json(
      { error: "Failed to delete food item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireEnterprise(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const user = authResult.user!;
    const body = await request.json();

    console.log(body)

    const {
      FoodID,
      DishName,
      Description,
      Price,
      Stock,
      ImageURL,
      FoodCategoryID,
    } = body;

    if (!FoodID) {
      return NextResponse.json(
        { error: "FoodId is required" },
        { status: 400 }
      );
    }

    if (!DishName || Price == null || Stock == null || !FoodCategoryID) {
      return NextResponse.json(
        { error: "Dish name, price, stock, and category are required" },
        { status: 400 }
      );
    }

    const enterprise = await prisma.enterprise.findUnique({
      where: { AccountID: user.id },
    });

    if (!enterprise) {
      return NextResponse.json(
        { error: "Enterprise profile not found" },
        { status: 404 }
      );
    }

    const updatedDish = await prisma.food.update({
      where: { FoodID: FoodID },
      data: {
        DishName,
        Description,
        Price,
        Stock,
        ImageURL,
        FoodCategoryID,
        EnterpriseID: enterprise.EnterpriseID,
      },
    });

    return NextResponse.json({ dish: updatedDish }, { status: 200 });
  } catch (error) {
    console.error("Error updating dish:", error);
    return NextResponse.json(
      { error: "Failed to update dish" },
      { status: 500 }
    );
  }
}
