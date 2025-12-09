// /api/moderator/users/stats
import { db } from "@/utils/index";
import { 
  USERS, ORG_USERS, ROLES 
} from "@/utils/schema/schema";
import { eq, and, count } from "drizzle-orm";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
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

    // Get stats by status
    const stats = await db
      .select({
        status: USERS.status,
        count: count()
      })
      .from(ORG_USERS)
      .innerJoin(USERS, eq(ORG_USERS.user_id, USERS.id))
      .where(
        and(
          eq(ORG_USERS.org_id, orgId),
          eq(ORG_USERS.role_id, userRole.id)
        )
      )
      .groupBy(USERS.status);

    // Calculate totals
    const total = stats.reduce((sum, item) => sum + item.count, 0);
    const active = stats.find(item => item.status === 'active')?.count || 0;
    const suspended = stats.find(item => item.status === 'suspended')?.count || 0;
    const deleted = stats.find(item => item.status === 'deleted')?.count || 0;

    return NextResponse.json({
      total,
      active,
      suspended,
      deleted
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}