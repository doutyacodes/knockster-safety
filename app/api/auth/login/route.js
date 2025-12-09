import { db } from "@/utils/index";
import { USERS, USER_PROFILES, ROLES, USER_ROLES } from "@/utils/schema/schema";
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, and } from "drizzle-orm";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, rememberMe = false } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Find user by email with profile and role information
    const userResult = await db
      .select({
        user_id: USERS.id,
        email: USERS.email,
        password_hash: USERS.password_hash,
        created_at: USERS.created_at,
        profile_id: USER_PROFILES.id,
        full_name: USER_PROFILES.full_name,
        phone: USER_PROFILES.phone,
        profile_pic_url: USER_PROFILES.profile_pic_url,
        role_id: ROLES.id,
        role_name: ROLES.name,
        role_display_name: ROLES.display_name,
      })
      .from(USERS)
      .leftJoin(USER_PROFILES, eq(USERS.id, USER_PROFILES.user_id))
      .innerJoin(USER_ROLES, eq(USERS.id, USER_ROLES.user_id))
      .innerJoin(ROLES, eq(USER_ROLES.role_id, ROLES.id))
      .where(eq(USERS.email, email.toLowerCase()))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const foundUser = userResult[0];

    // Check if user has admin role (super_admin, org_admin, or moderator)
    const allowedRoles = ['super_admin', 'org_admin', 'moderator'];
    if (!allowedRoles.includes(foundUser.role_name)) {
      return NextResponse.json(
        { 
          message: "Access denied. Please use the user app for sign in.",
          details: "This portal is only for administrators"
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, foundUser.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token with user information
    const tokenPayload = {
      id: foundUser.user_id,
      email: foundUser.email,
      created_at: foundUser.created_at,
      profile: {
        id: foundUser.profile_id,
        full_name: foundUser.full_name,
        phone: foundUser.phone,
        profile_pic_url: foundUser.profile_pic_url,
      },
      role: {
        id: foundUser.role_id,
        name: foundUser.role_name,
        display_name: foundUser.role_display_name,
      },
    };

    // Set token expiration based on remember me
    const expiresIn = rememberMe ? "30d" : "7d";
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Determine redirect path based on role
    let redirectPath = '/admin/dashboard'; // fallback
    switch (foundUser.role_name) {
      case 'super_admin':
        redirectPath = '/super-admin/dashboard';
        break;
      case 'org_admin':
        redirectPath = '/org-admin/dashboard';
        break;
      case 'moderator':
        redirectPath = '/moderator/dashboard';
        break;
      default:
        redirectPath = '/unauthorized';
    }

    // Create response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: foundUser.user_id,
          email: foundUser.email,
          profile: {
            full_name: foundUser.full_name,
            phone: foundUser.phone,
            profile_pic_url: foundUser.profile_pic_url,
          },
          role: {
            id: foundUser.role_id,
            name: foundUser.role_name,
            display_name: foundUser.role_display_name,
          },
        },
        redirect_to: redirectPath
      },
      { status: 200 }
    );

    // Set cookie with user_token
    response.cookies.set("user_token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}