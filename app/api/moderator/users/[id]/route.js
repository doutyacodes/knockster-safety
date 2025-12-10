import { db } from "@/utils/index";
import { ORG_USERS, USERS } from "@/utils/schema/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function DELETE(req, { params }) {
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
        { message: "You are not assigned to any organisation" },
        { status: 403 }
      );
    }

    const orgId = orgUser.org_id;
    const { id } = await params;

    // Check if user is in that org
    const [existing] = await db
      .select()
      .from(ORG_USERS)
      .where(
        and(eq(ORG_USERS.user_id, id), eq(ORG_USERS.org_id, orgId))
      );

    if (!existing) {
      return NextResponse.json(
        { message: "User not found in your organisation" },
        { status: 404 }
      );
    }

    // Soft delete - set user as inactive
    await db
      .update(USERS)
      .set({ is_active: false })
      .where(eq(USERS.id, id));

    return NextResponse.json(
      { message: "User deactivated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}