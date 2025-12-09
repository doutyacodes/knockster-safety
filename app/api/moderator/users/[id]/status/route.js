import { db } from "@/utils/index";
import { USERS } from "@/utils/schema/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function PATCH(req, { params }) {
  try {
    // Await params - this is required in newer Next.js versions
    const { id } = await params;

    const token = req.cookies.get("user_token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    // Validate status
    if (!['active', 'suspended', 'deleted'].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 }
      );
    }

    // Convert id to number (important for MySQL int comparison)
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Update user status
    const result = await db
      .update(USERS)
      .set({ 
        status,
        updated_at: new Date()
      })
      .where(eq(USERS.id, userId));

    return NextResponse.json(
      { 
        message: `User ${status === 'active' ? 'activated' : status === 'suspended' ? 'suspended' : 'marked as deleted'} successfully`,
        success: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}