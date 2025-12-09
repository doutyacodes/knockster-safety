import { db } from "@/utils/index";
import { 
  USERS, USER_PROFILES, ROLES, USER_ROLES, 
  ORGANISATIONS, ORG_USERS 
} from "@/utils/schema/schema";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { BASE_IMG_URL } from "@/lib/constants";

export async function POST(req) {
  try {
    const body = await req.json();
    const { organisation, admin } = body;

    // Validation
    if (!organisation.name || !organisation.contact_email) {
      return NextResponse.json(
        { message: "Organisation name and contact email are required" },
        { status: 400 }
      );
    }

    if (!admin.email || !admin.password || !admin.full_name) {
      return NextResponse.json(
        { message: "Admin email, password, and full name are required" },
        { status: 400 }
      );
    }

    // Check if organisation email already exists
    const existingOrgEmail = await db
      .select()
      .from(ORGANISATIONS)
      .where(eq(ORGANISATIONS.contact_email, organisation.contact_email))
      .limit(1);

    if (existingOrgEmail.length > 0) {
      return NextResponse.json(
        { message: "An organisation with this email already exists" },
        { status: 409 }
      );
    }

    // Check if admin email already exists
    const existingAdminEmail = await db
      .select()
      .from(USERS)
      .where(eq(USERS.email, admin.email))
      .limit(1);

    if (existingAdminEmail.length > 0) {
      return NextResponse.json(
        { message: "Admin email is already registered" },
        { status: 409 }
      );
    }

    // Get admin role
    const [adminRole] = await db
      .select()
      .from(ROLES)
      .where(eq(ROLES.name, 'org_admin'))
      .limit(1);

    if (!adminRole) {
      return NextResponse.json(
        { message: "Admin role not found" },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await hash(admin.password, 12);

    // Start transaction
    const result = await db.transaction(async (tx) => {
      // 1. Create organisation
      const [newOrg] = await tx
        .insert(ORGANISATIONS)
        .values({
          name: organisation.name,
          type: organisation.type || null,
          profile_pic_url: BASE_IMG_URL + organisation.profile_pic_url,
          address: organisation.address || null,
          contact_email: organisation.contact_email,
          contact_phone: organisation.contact_phone || null,
        })
        .execute();

      const orgId = newOrg.insertId;

      // 2. Create admin user
      await tx
        .insert(USERS)
        .values({
          email: admin.email,
          password_hash: hashedPassword,
        })
        .execute();

      // 3. Get the created user
      const [newUser] = await tx
        .select()
        .from(USERS)
        .where(eq(USERS.email, admin.email))
        .limit(1);

      // 4. Create user profile
      await tx
        .insert(USER_PROFILES)
        .values({
          user_id: newUser.id,
          full_name: admin.full_name,
          phone: admin.phone || null,
        });

      // 5. Assign admin role to user
      await tx
        .insert(USER_ROLES)
        .values({
          user_id: newUser.id,
          role_id: adminRole.id,
        });

      // 6. Add user to organisation as admin
      await tx
        .insert(ORG_USERS)
        .values({
          org_id: orgId,
          user_id: newUser.id,
          role_id: adminRole.id,
          is_primary_admin: true,
        });

      // 7. Get complete organisation data
      const [completeOrg] = await tx
        .select()
        .from(ORGANISATIONS)
        .where(eq(ORGANISATIONS.id, orgId))
        .limit(1);

      return {
        organisation: completeOrg,
        admin: {
          id: newUser.id,
          email: newUser.email,
          full_name: admin.full_name,
          phone: admin.phone,
        }
      };
    });

    return NextResponse.json(
      {
        message: "Organisation created successfully",
        organisation: result.organisation,
        admin: result.admin
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating organisation:", error);
    return NextResponse.json(
      { message: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const organisations = await db
      .select({
        id: ORGANISATIONS.id,
        name: ORGANISATIONS.name,
        type: ORGANISATIONS.type,
        profile_pic_url: ORGANISATIONS.profile_pic_url,
        address: ORGANISATIONS.address,
        contact_email: ORGANISATIONS.contact_email,
        contact_phone: ORGANISATIONS.contact_phone,
        created_at: ORGANISATIONS.created_at,
      })
      .from(ORGANISATIONS)
      .orderBy(ORGANISATIONS.created_at, 'desc');

    return NextResponse.json(
      { organisations },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching organisations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}