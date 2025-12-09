import { db } from "@/utils";
import { 
  SAFETY_CHECKINS, 
  USER_PROFILES, 
  USERS,
  ORGANISATIONS,
  SAFETY_TIMINGS,
  SAFETY_ALERTS,
  ORG_USERS
} from "@/utils/schema/schema";
import { and, eq, desc, gte, lt, or, sql, inArray } from "drizzle-orm";
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

    // Get active alerts (pending, snoozed, escalated_no_response)
    const activeAlerts = await db
      .select({
        id: SAFETY_CHECKINS.id,
        user_id: SAFETY_CHECKINS.user_id,
        full_name: USER_PROFILES.full_name,
        profile_pic_url: USER_PROFILES.profile_pic_url,
        phone: USER_PROFILES.phone,
        alert_type: sql`
          CASE 
            WHEN ${SAFETY_CHECKINS.pin_type_used} = 'danger' THEN 'danger_pin'
            WHEN ${SAFETY_CHECKINS.snooze_count} >= 3 THEN 'no_response_3'
            WHEN ${SAFETY_CHECKINS.snooze_count} > 0 THEN 'no_response_snooze'
            ELSE 'pending'
          END
        `.as('alert_type'),
        status: SAFETY_CHECKINS.status,
        scheduled_time: SAFETY_CHECKINS.scheduled_time,
        checkin_date: SAFETY_CHECKINS.checkin_date,
        snooze_count: SAFETY_CHECKINS.snooze_count,
        pin_type_used: SAFETY_CHECKINS.pin_type_used,
        last_snooze_at: SAFETY_CHECKINS.last_snooze_at,
        created_at: SAFETY_CHECKINS.created_at,
        organisation_name: ORGANISATIONS.name,
      })
      .from(SAFETY_CHECKINS)
      .innerJoin(USERS, eq(SAFETY_CHECKINS.user_id, USERS.id))
      .innerJoin(USER_PROFILES, eq(USERS.id, USER_PROFILES.user_id))
      .innerJoin(ORGANISATIONS, eq(SAFETY_CHECKINS.org_id, ORGANISATIONS.id))
      .where(
        and(
          eq(SAFETY_CHECKINS.org_id, orgId),
          inArray(SAFETY_CHECKINS.status, ['pending', 'snoozed', 'escalated_no_response', 'acknowledged_danger'])
        )
      )
      .orderBy(desc(SAFETY_CHECKINS.created_at))
      .limit(50);

    // Calculate priority and format response
    const formattedAlerts = activeAlerts.map(alert => {
      let priority = 'low';
      let alertDisplay = '';
      let statusColor = 'yellow';
      
      if (alert.pin_type_used === 'danger') {
        priority = 'critical';
        alertDisplay = 'Danger';
        statusColor = 'red';
      } else if (alert.snooze_count >= 3) {
        priority = 'high';
        alertDisplay = `⏳ No Response (${alert.snooze_count} snoozes)`;
        statusColor = 'orange';
      } else if (alert.snooze_count > 0) {
        priority = 'medium';
        alertDisplay = `⏳ No Response (${alert.snooze_count} snooze${alert.snooze_count > 1 ? 's' : ''})`;
        statusColor = 'yellow';
      } else {
        alertDisplay = '⏳ Pending Response';
        statusColor = 'blue';
      }

      // Calculate time ago
      const createdAt = new Date(alert.created_at);
      const now = new Date();
      const diffMinutes = Math.floor((now - createdAt) / (1000 * 60));
      let timeAgo = '';
      
      if (diffMinutes < 1) timeAgo = 'Just now';
      else if (diffMinutes < 60) timeAgo = `${diffMinutes} min ago`;
      else if (diffMinutes < 1440) timeAgo = `${Math.floor(diffMinutes / 60)} hours ago`;
      else timeAgo = `${Math.floor(diffMinutes / 1440)} days ago`;

      return {
        ...alert,
        priority,
        alertDisplay,
        statusColor,
        timeAgo,
        statusText: getStatusText(alert.status, alert.pin_type_used, alert.snooze_count)
      };
    });

    // Sort by priority: critical > high > medium > low
    formattedAlerts.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return NextResponse.json({
      alerts: formattedAlerts,
      total: formattedAlerts.length
    });

  } catch (error) {
    console.error("Error fetching active alerts:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

function getStatusText(status, pinType, snoozeCount) {
  if (pinType === 'danger') return 'Awaiting Moderator';
  if (snoozeCount >= 3) return 'Needs Moderator Call';
  if (snoozeCount > 0) return 'Waiting User Response';
  return 'Waiting Initial Response';
}