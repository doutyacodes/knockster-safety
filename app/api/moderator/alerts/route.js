import { db } from "@/utils/index";
import { 
  SAFETY_CHECKINS, 
  USER_PROFILES, 
  USERS,
  ORGANISATIONS,
  SAFETY_TIMINGS,
  SAFETY_ALERTS,
  ADMIN_CALL_LOGS,
  SAFETY_SNOOZE_LOGS,
  NOTIFICATION_LOGS,
  ORG_USERS
} from "@/utils/schema/schema";
import { and, eq, desc, asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// GET alert details
export async function GET(req, { params }) {
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
    const { checkinId } = params;

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

    // Get alert details
    const [alert] = await db
      .select({
        checkin: {
          id: SAFETY_CHECKINS.id,
          user_id: SAFETY_CHECKINS.user_id,
          status: SAFETY_CHECKINS.status,
          scheduled_time: SAFETY_CHECKINS.scheduled_time,
          checkin_date: SAFETY_CHECKINS.checkin_date,
          snooze_count: SAFETY_CHECKINS.snooze_count,
          pin_type_used: SAFETY_CHECKINS.pin_type_used,
          last_snooze_at: SAFETY_CHECKINS.last_snooze_at,
          user_response_time: SAFETY_CHECKINS.user_response_time,
          resolved_at: SAFETY_CHECKINS.resolved_at,
          created_at: SAFETY_CHECKINS.created_at,
        },
        user: {
          id: USERS.id,
          email: USERS.email,
          full_name: USER_PROFILES.full_name,
          phone: USER_PROFILES.phone,
          profile_pic_url: USER_PROFILES.profile_pic_url,
          emergency_contact_name: USER_PROFILES.emergency_contact_name,
          emergency_contact_phone: USER_PROFILES.emergency_contact_phone,
        },
        organisation: {
          id: ORGANISATIONS.id,
          name: ORGANISATIONS.name,
          contact_phone: ORGANISATIONS.contact_phone,
        },
        timing: {
          label: SAFETY_TIMINGS.label,
          time: SAFETY_TIMINGS.time,
        }
      })
      .from(SAFETY_CHECKINS)
      .innerJoin(USERS, eq(SAFETY_CHECKINS.user_id, USERS.id))
      .innerJoin(USER_PROFILES, eq(USERS.id, USER_PROFILES.user_id))
      .innerJoin(ORGANISATIONS, eq(SAFETY_CHECKINS.org_id, ORGANISATIONS.id))
      .leftJoin(SAFETY_TIMINGS, eq(SAFETY_CHECKINS.timing_id, SAFETY_TIMINGS.id))
      .where(
        and(
          eq(SAFETY_CHECKINS.id, parseInt(checkinId)),
          eq(SAFETY_CHECKINS.org_id, orgId)
        )
      )
      .limit(1);

    if (!alert) {
      return NextResponse.json(
        { message: "Alert not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Get timeline events
    const snoozeLogs = await db
      .select({
        id: SAFETY_SNOOZE_LOGS.id,
        type: sql`'snooze'`.as('type'),
        description: sql`CONCAT('Snooze ', ${SAFETY_SNOOZE_LOGS.snooze_number}, ' sent')`,
        timestamp: SAFETY_SNOOZE_LOGS.sent_at,
      })
      .from(SAFETY_SNOOZE_LOGS)
      .where(eq(SAFETY_SNOOZE_LOGS.checkin_id, parseInt(checkinId)))
      .orderBy(asc(SAFETY_SNOOZE_LOGS.sent_at));

    const callLogs = await db
      .select({
        id: ADMIN_CALL_LOGS.id,
        type: sql`'call'`.as('type'),
        description: sql`CONCAT('Moderator call - ', ${ADMIN_CALL_LOGS.call_status})`,
        timestamp: ADMIN_CALL_LOGS.call_time,
        details: {
          call_status: ADMIN_CALL_LOGS.call_status,
          notes: ADMIN_CALL_LOGS.notes,
          admin_id: ADMIN_CALL_LOGS.admin_id,
        }
      })
      .from(ADMIN_CALL_LOGS)
      .where(eq(ADMIN_CALL_LOGS.alert_id, 
        db.select({ id: SAFETY_ALERTS.id })
          .from(SAFETY_ALERTS)
          .where(eq(SAFETY_ALERTS.checkin_id, parseInt(checkinId)))
          .limit(1)
      ))
      .orderBy(asc(ADMIN_CALL_LOGS.call_time));

    const safetyAlerts = await db
      .select({
        id: SAFETY_ALERTS.id,
        type: sql`'alert'`.as('type'),
        description: sql`CONCAT('Safety alert created - ', ${SAFETY_ALERTS.alert_type})`,
        timestamp: SAFETY_ALERTS.alert_sent_at,
        details: {
          alert_type: SAFETY_ALERTS.alert_type,
          priority: SAFETY_ALERTS.priority,
        }
      })
      .from(SAFETY_ALERTS)
      .where(eq(SAFETY_ALERTS.checkin_id, parseInt(checkinId)))
      .orderBy(asc(SAFETY_ALERTS.alert_sent_at));

    // Combine all timeline events
    const timeline = [
      {
        id: 0,
        type: 'alert_triggered',
        description: alert.checkin.pin_type_used === 'danger' 
          ? 'Danger pin entered' 
          : 'Check-in notification sent',
        timestamp: alert.checkin.created_at,
      },
      ...snoozeLogs,
      ...callLogs,
      ...safetyAlerts,
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Determine alert badge
    let badge = {
      type: 'info',
      text: 'Pending',
      color: 'blue'
    };

    if (alert.checkin.pin_type_used === 'danger') {
      badge = { type: 'danger', text: 'DANGER PIN', color: 'red' };
    } else if (alert.checkin.snooze_count >= 3) {
      badge = { type: 'no_response', text: 'NO RESPONSE AFTER 3 SNOOZES', color: 'orange' };
    } else if (alert.checkin.snooze_count > 0) {
      badge = { type: 'snooze', text: `SNOOZE ${alert.checkin.snooze_count} IN PROGRESS`, color: 'yellow' };
    } else if (alert.checkin.status === 'resolved') {
      badge = { type: 'resolved', text: 'RESOLVED', color: 'green' };
    }

    return NextResponse.json({
      alert: {
        ...alert,
        badge,
        timeline,
      }
    });

  } catch (error) {
    console.error("Error fetching alert details:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// POST - log a call
export async function POST(req, { params }) {
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
    const { checkinId } = params;
    const body = await req.json();
    const { call_status, notes } = body;

    // Validate call status
    const validStatuses = ['attended_safe', 'attended_not_safe', 'not_attended'];
    if (!validStatuses.includes(call_status)) {
      return NextResponse.json(
        { message: "Invalid call status" },
        { status: 400 }
      );
    }

    // Get the safety alert for this checkin
    const [safetyAlert] = await db
      .select({ id: SAFETY_ALERTS.id })
      .from(SAFETY_ALERTS)
      .where(eq(SAFETY_ALERTS.checkin_id, parseInt(checkinId)))
      .limit(1);

    if (!safetyAlert) {
      return NextResponse.json(
        { message: "No safety alert found for this checkin" },
        { status: 404 }
      );
    }

    // Get checkin details
    const [checkin] = await db
      .select({
        user_id: SAFETY_CHECKINS.user_id,
        org_id: SAFETY_CHECKINS.org_id,
      })
      .from(SAFETY_CHECKINS)
      .where(eq(SAFETY_CHECKINS.id, parseInt(checkinId)))
      .limit(1);

    // Create call log
    const [callLog] = await db.insert(ADMIN_CALL_LOGS).values({
      alert_id: safetyAlert.id,
      admin_id: moderatorId,
      user_id: checkin.user_id,
      call_status: call_status,
      notes: notes || null,
    }).returning();

    // Update checkin status based on call result
    let newStatus = 'pending';
    let pinTypeUsed = null;

    if (call_status === 'attended_safe') {
      newStatus = 'resolved';
      pinTypeUsed = 'safe';
    } else if (call_status === 'attended_not_safe' || call_status === 'not_attended') {
      newStatus = 'acknowledged_danger';
      pinTypeUsed = 'danger';
      
      // Create a safety alert for danger situation
      await db.insert(SAFETY_ALERTS).values({
        checkin_id: parseInt(checkinId),
        user_id: checkin.user_id,
        org_id: checkin.org_id,
        alert_type: 'manual_alert',
        priority: 'high',
        alert_status: 'pending',
      });
    }

    // Update the checkin
    await db.update(SAFETY_CHECKINS)
      .set({
        status: newStatus,
        pin_type_used: pinTypeUsed,
        resolved_at: call_status === 'attended_safe' ? new Date() : null,
        resolved_by: call_status === 'attended_safe' ? moderatorId : null,
      })
      .where(eq(SAFETY_CHECKINS.id, parseInt(checkinId)));

    return NextResponse.json({
      message: "Call logged successfully",
      callLog,
      updatedStatus: newStatus
    });

  } catch (error) {
    console.error("Error logging call:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// PUT - mark as resolved
export async function PUT(req, { params }) {
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
    const { checkinId } = params;

    // Update checkin status to resolved
    await db.update(SAFETY_CHECKINS)
      .set({
        status: 'resolved',
        resolved_at: new Date(),
        resolved_by: moderatorId,
      })
      .where(eq(SAFETY_CHECKINS.id, parseInt(checkinId)));

    // Update related safety alerts
    await db.update(SAFETY_ALERTS)
      .set({
        alert_status: 'resolved',
        resolved_at: new Date(),
        resolved_by: moderatorId,
      })
      .where(eq(SAFETY_ALERTS.checkin_id, parseInt(checkinId)));

    return NextResponse.json({
      message: "Alert marked as resolved",
    });

  } catch (error) {
    console.error("Error resolving alert:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}