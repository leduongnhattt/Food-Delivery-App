import { NextRequest, NextResponse } from "next/server";
import {
  findAccountByUsernameWithEnterprise,
  verifyPassword,
  issueTokens,
} from "@/services/auth.service";

function setRefreshCookie(res: NextResponse, token: string, expires: Date) {
  res.cookies.set("refresh_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find account by username with enterprise details
    const account = await findAccountByUsernameWithEnterprise(username);

    if (!account) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if account is enterprise
    if (account.role?.RoleName !== "Enterprise") {
      return NextResponse.json(
        { error: "Access denied. Enterprise account required." },
        { status: 403 }
      );
    }

    // Check password
    const isPasswordValid = await verifyPassword(
      password,
      account.PasswordHash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Issue tokens
    const { accessToken, refreshToken, expiredAt } = await issueTokens(
      account.AccountID,
      account.role?.RoleName || "Enterprise"
    );

    // Create response with enterprise-specific data
    const response = NextResponse.json({
      success: true,
      user: {
        id: account.AccountID,
        username: account.Username,
        email: account.Email,
        role: account.role?.RoleName,
        status: account.Status,
        enterprise: account.enterprise
          ? {
              id: account.enterprise.EnterpriseID,
              name: account.enterprise.EnterpriseName,
              address: account.enterprise.Address,
              phoneNumber: account.enterprise.PhoneNumber,
              description: account.enterprise.Description,
              openHours: account.enterprise.OpenHours,
              closeHours: account.enterprise.CloseHours,
              isActive: account.enterprise.IsActive,
            }
          : null,
      },
      accessToken,
    });

    // Set refresh token cookie
    setRefreshCookie(response, refreshToken, expiredAt);
    return response;
  } catch (error) {
    console.error("Enterprise login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
