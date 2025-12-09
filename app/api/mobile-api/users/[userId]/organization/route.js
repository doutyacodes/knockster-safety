// FILE LOCATION: app/api/mobile-api/users/[userId]/organization/route.js

import { db } from '@/utils';
import { USERS, USER_PROFILES, ORG_USERS, ORGANISATIONS, ROLES } from '@/utils/schema/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * GET /api/mobile-api/users/[userId]/organization
 * Get user's primary organization for FCM topic subscription
 * Used by Flutter app to subscribe admins to org_X_alerts topic
 */
export async function GET(request, { params }) {
  try {
    const userId = parseInt(params.userId);

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Valid user ID is required' },
        { status: 400 }
      );
    }

    // Get user's organizations with role information
    const userOrgs = await db
      .select({
        org_id: ORG_USERS.org_id,
        org_name: ORGANISATIONS.name,
        role_id: ORG_USERS.role_id,
        role_name: ROLES.name,
        is_primary_admin: ORG_USERS.is_primary_admin,
        status: ORG_USERS.status,
      })
      .from(ORG_USERS)
      .leftJoin(ORGANISATIONS, eq(ORG_USERS.org_id, ORGANISATIONS.id))
      .leftJoin(ROLES, eq(ORG_USERS.role_id, ROLES.id))
      .where(
        and(
          eq(ORG_USERS.user_id, userId),
          eq(ORG_USERS.status, 'active')
        )
      );

    if (!userOrgs || userOrgs.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No active organization found for user' },
        { status: 404 }
      );
    }

    // Get primary organization (first one with is_primary_admin = true, or just first one)
    const primaryOrg = userOrgs.find(org => org.is_primary_admin) || userOrgs[0];

    return NextResponse.json(
      {
        success: true,
        data: {
          org_id: primaryOrg.org_id,
          org_name: primaryOrg.org_name,
          role: primaryOrg.role_name,
          is_admin: ['org_admin', 'super_admin', 'moderator'].includes(primaryOrg.role_name),
          all_organizations: userOrgs.map(org => ({
            org_id: org.org_id,
            org_name: org.org_name,
            role: org.role_name,
          })),
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get user organization error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}