import { db } from "@/utils/index";
import {
  USERS, USER_PROFILES, ROLES, USER_ROLES,
  ORGANISATIONS, ORG_USERS
} from "@/utils/schema/schema";
import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { hash } from "bcryptjs";
import { BASE_IMG_URL } from "@/lib/constants";

export async function GET(req) {
  try {
    // 🔐 Read token
    const token = req.cookies.get("user_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id;

    // 🔥 GET THE ORG OF THIS USER
    const [orgUser] = await db
      .select()
      .from(ORG_USERS)
      .where(eq(ORG_USERS.user_id, userId))
      .limit(1);

    if (!orgUser) {
      return NextResponse.json(
        { message: "User is not assigned to any organisation" },
        { status: 403 }
      );
    }

    const orgId = orgUser.org_id;

    // Get moderator role id
    const [moderatorRole] = await db
      .select()
      .from(ROLES)
      .where(eq(ROLES.name, "moderator"))
      .limit(1);

    if (!moderatorRole) {
      return NextResponse.json(
        { message: "Moderator role not found" },
        { status: 500 }
      );
    }

    // Get moderators in this organisation
    const moderators = await db
      .select({
        id: USERS.id,
        email: USERS.email,
        created_at: USERS.created_at,
        full_name: USER_PROFILES.full_name,
        phone: USER_PROFILES.phone,
        profile_pic_url: USER_PROFILES.profile_pic_url,
      })
      .from(ORG_USERS)
      .innerJoin(USERS, eq(ORG_USERS.user_id, USERS.id))
      .innerJoin(USER_PROFILES, eq(USERS.id, USER_PROFILES.user_id))
      .where(
        and(
          eq(ORG_USERS.org_id, orgId),
          eq(ORG_USERS.role_id, moderatorRole.id)
        )
      )
      .orderBy(desc(USERS.created_at));

    return NextResponse.json({ moderators }, { status: 200 });
  } catch (error) {
    console.error("Error fetching moderators:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const token = req.cookies.get("user_token")?.value;

    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id;

    // Get user's organisation
    const [orgUser] = await db
      .select()
      .from(ORG_USERS)
      .where(eq(ORG_USERS.user_id, userId))
      .limit(1);

    if (!orgUser) {
      return NextResponse.json(
        { message: "You are not assigned to an organisation" },
        { status: 403 }
      );
    }

    const orgId = orgUser.org_id;

    const body = await req.json();
    const { full_name, email, password, phone, profile_pic_url } = body;

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { message: "Full name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existing] = await db
      .select()
      .from(USERS)
      .where(eq(USERS.email, email));

    if (existing) {
      return NextResponse.json(
        { message: "Email is already registered" },
        { status: 409 }
      );
    }

    // Get moderator role
    const [moderatorRole] = await db
      .select()
      .from(ROLES)
      .where(eq(ROLES.name, "moderator"))
      .limit(1);

    const hashedPassword = await hash(password, 12);

    const result = await db.transaction(async (tx) => {
      // Create user
      const insertUser = await tx
        .insert(USERS)
        .values({
          email: email,
          password_hash: hashedPassword,
        })
        .execute();

      const newUserId = insertUser[0].insertId;

      // User profile
      await tx.insert(USER_PROFILES).values({
        user_id: newUserId,
        full_name,
        phone,
        profile_pic_url : BASE_IMG_URL + profile_pic_url,
      });

      // Global role
      await tx.insert(USER_ROLES).values({
        user_id: newUserId,
        role_id: moderatorRole.id,
      });

      // Assign to org
      await tx.insert(ORG_USERS).values({
        org_id: orgId,
        user_id: newUserId,
        role_id: moderatorRole.id,
      });

      return newUserId;
    });

    return NextResponse.json(
      { message: "Moderator created successfully", id: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating moderator:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
