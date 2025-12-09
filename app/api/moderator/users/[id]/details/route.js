import { db } from "@/utils/index";
import { 
  USERS, USER_PROFILES, ORGANISATIONS, 
  ORG_USERS, SAFETY_TIMINGS 
} from "@/utils/schema/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req, { params }) {
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

    const { id } = params;

    // Get user details with profile and organisation info
    const user = await db
      .select({
        id: USERS.id,
        email: USERS.email,
        status: USERS.status,
        timezone: USERS.timezone,
        created_at: USERS.created_at,
        updated_at: USERS.updated_at,
        full_name: USER_PROFILES.full_name,
        phone: USER_PROFILES.phone,
        profile_pic_url: USER_PROFILES.profile_pic_url,
        safe_pin_hash: USER_PROFILES.safe_pin_hash,
        danger_pin_hash: USER_PROFILES.danger_pin_hash,
        emergency_contact_name: USER_PROFILES.emergency_contact_name,
        emergency_contact_phone: USER_PROFILES.emergency_contact_phone,
        organisation: {
          id: ORGANISATIONS.id,
          name: ORGANISATIONS.name,
          address: ORGANISATIONS.address,
        },
        org_joined_at: ORG_USERS.joined_at,
        safety_timings: {
          id: SAFETY_TIMINGS.id,
          label: SAFETY_TIMINGS.label,
          time: SAFETY_TIMINGS.time,
          active_days: SAFETY_TIMINGS.active_days,
          is_active: SAFETY_TIMINGS.is_active,
        }
      })
      .from(USERS)
      .leftJoin(USER_PROFILES, eq(USERS.id, USER_PROFILES.user_id))
      .leftJoin(ORG_USERS, eq(USERS.id, ORG_USERS.user_id))
      .leftJoin(ORGANISATIONS, eq(ORG_USERS.org_id, ORGANISATIONS.id))
      .leftJoin(SAFETY_TIMINGS, eq(USERS.id, SAFETY_TIMINGS.user_id))
      .where(eq(USERS.id, id))
      .limit(1);

    if (!user[0]) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Get safety timings separately for better structure
    const safetyTimings = await db
      .select()
      .from(SAFETY_TIMINGS)
      .where(eq(SAFETY_TIMINGS.user_id, id));

    const userData = {
      ...user[0],
      safety_timings: safetyTimings
    };

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}