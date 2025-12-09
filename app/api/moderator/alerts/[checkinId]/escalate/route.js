import { db } from "@/utils/index";
import { 
  SAFETY_ALERTS,
  SAFETY_CHECKINS,
  USER_PROFILES,
  ORGANISATIONS,
  ORG_ESCALATION_CHAIN
} from "@/utils/schema/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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
    const { escalation_type } = body; // 'police', 'family', 'admin'

    // Validate escalation type
    const validTypes = ['police', 'family', 'admin'];
    if (!validTypes.includes(escalation_type)) {
      return NextResponse.json(
        { message: "Invalid escalation type" },
        { status: 400 }
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

    if (!checkin) {
      return NextResponse.json(
        { message: "Checkin not found" },
        { status: 404 }
      );
    }

    // Create safety alert for escalation
    let alertType = 'manual_alert';
    let priority = 'high';
    
    if (escalation_type === 'police') {
      alertType = 'danger_pin_entered';
      priority = 'critical';
    }

    const [safetyAlert] = await db.insert(SAFETY_ALERTS).values({
      checkin_id: parseInt(checkinId),
      user_id: checkin.user_id,
      org_id: checkin.org_id,
      alert_type: alertType,
      priority: priority,
      alert_status: 'in_progress',
      alert_sent_at: new Date(),
    }).returning();

    // Update checkin status if not already in danger
    await db.update(SAFETY_CHECKINS)
      .set({
        status: 'acknowledged_danger',
        pin_type_used: 'danger',
      })
      .where(eq(SAFETY_CHECKINS.id, parseInt(checkinId)));

    return NextResponse.json({
      message: `Escalation to ${escalation_type} initiated`,
      alert: safetyAlert,
    });

  } catch (error) {
    console.error("Error escalating alert:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}