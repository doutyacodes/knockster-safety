import { db } from "@/utils/index";
import { 
  USERS, USER_PROFILES, ROLES, USER_ROLES, 
  ORGANISATIONS, ORG_USERS 
} from "@/utils/schema/schema";
import { NextResponse } from "next/server";
import { eq, and, count } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
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

    // Get user's organisation
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

    // Get user role id
    const [userRole] = await db
      .select()
      .from(ROLES)
      .where(eq(ROLES.name, "user"))
      .limit(1);

    if (!userRole) {
      return NextResponse.json(
        { message: "User role not found" },
        { status: 500 }
      );
    }

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(ORG_USERS)
      .where(
        and(
          eq(ORG_USERS.org_id, orgId),
          eq(ORG_USERS.role_id, userRole.id)
        )
      );

    // Get active count
    const [activeResult] = await db
      .select({ count: count() })
      .from(ORG_USERS)
      .innerJoin(USERS, eq(ORG_USERS.user_id, USERS.id))
      .where(
        and(
          eq(ORG_USERS.org_id, orgId),
          eq(ORG_USERS.role_id, userRole.id),
        )
      );

    // Get inactive count
    const [inactiveResult] = await db
      .select({ count: count() })
      .from(ORG_USERS)
      .innerJoin(USERS, eq(ORG_USERS.user_id, USERS.id))
      .where(
        and(
          eq(ORG_USERS.org_id, orgId),
          eq(ORG_USERS.role_id, userRole.id),
        )
      );

    return NextResponse.json({
      total: totalResult.count,
      active: activeResult.count,
      inactive: inactiveResult.count
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}