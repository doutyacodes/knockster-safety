import { db } from "@/utils";
import { 
  SAFETY_CHECKINS, 
  USER_PROFILES, 
  USERS,
  ORGANISATIONS,
  SAFETY_ALERTS,
  ORG_USERS
} from "@/utils/schema/schema";
import { and, eq, desc, between, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
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

    const moderatorId = decoded.id;
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status') || 'resolved';

    // Get moderator's organisation
    const [moderatorOrg] = await db
      .select({ org_id: ORG_USERS.org_id })
      .from(ORG_USERS)
      .where(eq(ORG_USERS.user_id, moderatorId))
      .limit(1);

    if (!moderatorOrg) {
      return NextResponse.json(
        { message: "You are not assigned to any organisation" },
        { status: 403 }
      );
    }

    const orgId = moderatorOrg.org_id;

    // Build query conditions
    let conditions = [
      eq(SAFETY_CHECKINS.org_id, orgId),
      eq(SAFETY_CHECKINS.status, status)
    ];

    // Add date filter if provided
    if (startDate && endDate) {
      conditions.push(
        between(SAFETY_CHECKINS.resolved_at, new Date(startDate), new Date(endDate))
      );
    }

    // Get resolved alerts
    const resolvedAlerts = await db
      .select({
        id: SAFETY_CHECKINS.id,
        user_id: SAFETY_CHECKINS.user_id,
        full_name: USER_PROFILES.full_name,
        profile_pic_url: USER_PROFILES.profile_pic_url,
        status: SAFETY_CHECKINS.status,
        scheduled_time: SAFETY_CHECKINS.scheduled_time,
        checkin_date: SAFETY_CHECKINS.checkin_date,
        snooze_count: SAFETY_CHECKINS.snooze_count,
        pin_type_used: SAFETY_CHECKINS.pin_type_used,
        resolved_at: SAFETY_CHECKINS.resolved_at,
        resolved_by: SAFETY_CHECKINS.resolved_by,
        created_at: SAFETY_CHECKINS.created_at,
        organisation_name: ORGANISATIONS.name,
        resolution_type: sql`
          CASE 
            WHEN ${SAFETY_CHECKINS.pin_type_used} = 'danger' THEN 'Danger Pin'
            WHEN ${SAFETY_CHECKINS.snooze_count} >= 3 THEN 'No Response'
            WHEN ${SAFETY_CHECKINS.snooze_count} > 0 THEN 'Late Response'
            ELSE 'On Time'
          END
        `.as('resolution_type'),
      })
      .from(SAFETY_CHECKINS)
      .innerJoin(USERS, eq(SAFETY_CHECKINS.user_id, USERS.id))
      .innerJoin(USER_PROFILES, eq(USERS.id, USER_PROFILES.user_id))
      .innerJoin(ORGANISATIONS, eq(SAFETY_CHECKINS.org_id, ORGANISATIONS.id))
      .where(and(...conditions))
      .orderBy(desc(SAFETY_CHECKINS.resolved_at))
      .limit(100);

    return NextResponse.json({
      alerts: resolvedAlerts,
      total: resolvedAlerts.length
    });

  } catch (error) {
    console.error("Error fetching resolved alerts:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}