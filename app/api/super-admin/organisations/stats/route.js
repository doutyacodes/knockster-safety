import { db } from "@/utils/index";
import { ORGANISATIONS } from "@/utils/schema/schema";
import { NextResponse } from "next/server";
import { count, sql } from "drizzle-orm";

export async function GET() {
  try {
    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(ORGANISATIONS);

    // Get counts by type
    const [schoolsResult] = await db
      .select({ count: count() })
      .from(ORGANISATIONS)
      .where(sql`type = 'school'`);

    const [itCompaniesResult] = await db
      .select({ count: count() })
      .from(ORGANISATIONS)
      .where(sql`type = 'it_company'`);

    const [mallsResult] = await db
      .select({ count: count() })
      .from(ORGANISATIONS)
      .where(sql`type = 'mall'`);

    const [othersResult] = await db
      .select({ count: count() })
      .from(ORGANISATIONS)
      .where(sql`type IS NULL OR type NOT IN ('school', 'it_company', 'mall')`);

    return NextResponse.json({
      total: totalResult.count,
      active: totalResult.count, // You can add active logic if needed
      schools: schoolsResult.count,
      itCompanies: itCompaniesResult.count,
      malls: mallsResult.count,
      others: othersResult.count
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}