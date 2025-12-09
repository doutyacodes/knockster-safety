// FILE LOCATION: app/api/mobile-api/test/send-notification/route.js

import { db } from '@/utils';
import { SAFETY_CHECKINS, USER_PROFILES, USERS } from '@/utils/schema/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { 
  sendCheckinAlert, 
  sendSnoozeReminder, 
  sendDangerPinAlert,
  sendNoResponseAlert 
} from '@/services/push-notification-service';

/**
 * POST /api/mobile-api/test/send-notification
 * Manually trigger notification for testing (DEVELOPMENT ONLY)
 * 
 * IMPORTANT: Disable this endpoint in production or add authentication
 */
export async function POST(request) {
  // SECURITY: Uncomment in production to disable this endpoint
  // if (process.env.NODE_ENV === 'production') {
  //   return NextResponse.json(
  //     { success: false, message: 'Test endpoint disabled in production' },
  //     { status: 403 }
  //   );
  // }

  try {
    const body = await request.json();
    const { user_id, type, checkin_id, org_id, alert_id } = body;

    if (!user_id || !type) {
      return NextResponse.json(
        { success: false, message: 'user_id and type are required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'checkin_alert':
        // Test regular check-in notification
        if (!checkin_id) {
          return NextResponse.json(
            { success: false, message: 'checkin_id required for checkin_alert' },
            { status: 400 }
          );
        }

        result = await sendCheckinAlert(
          user_id,
          checkin_id,
          'Test Check-in',
          '10:00:00'
        );
        break;

      case 'snooze_reminder':
        // Test snooze reminder notification
        if (!checkin_id) {
          return NextResponse.json(
            { success: false, message: 'checkin_id required for snooze_reminder' },
            { status: 400 }
          );
        }

        result = await sendSnoozeReminder(
          user_id,
          checkin_id,
          1, // snooze number
          2  // remaining snoozes
        );
        break;

      case 'danger_pin_alert':
        // Test danger PIN admin alert
        if (!org_id || !alert_id) {
          return NextResponse.json(
            { success: false, message: 'org_id and alert_id required for danger_pin_alert' },
            { status: 400 }
          );
        }

        // Get user name
        const userInfo = await db
          .select({ full_name: USER_PROFILES.full_name })
          .from(USERS)
          .leftJoin(USER_PROFILES, eq(USERS.id, USER_PROFILES.user_id))
          .where(eq(USERS.id, user_id))
          .limit(1);

        const userName = userInfo[0]?.full_name || 'Test User';

        result = await sendDangerPinAlert(org_id, alert_id, userName);
        break;

      case 'no_response_alert':
        // Test no response admin alert
        if (!org_id || !alert_id) {
          return NextResponse.json(
            { success: false, message: 'org_id and alert_id required for no_response_alert' },
            { status: 400 }
          );
        }

        // Get user name
        const userInfo2 = await db
          .select({ full_name: USER_PROFILES.full_name })
          .from(USERS)
          .leftJoin(USER_PROFILES, eq(USERS.id, USER_PROFILES.user_id))
          .where(eq(USERS.id, user_id))
          .limit(1);

        const userName2 = userInfo2[0]?.full_name || 'Test User';

        result = await sendNoResponseAlert(org_id, alert_id, userName2);
        break;

      default:
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid type. Use: checkin_alert, snooze_reminder, danger_pin_alert, or no_response_alert' 
          },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Test notification sent successfully`,
        type,
        result,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send test notification', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mobile-api/test/send-notification
 * Show usage documentation
 */
export async function GET() {
  return NextResponse.json(
    {
      message: 'Test Notification Endpoint (POST only)',
      usage: {
        endpoint: 'POST /api/mobile-api/test/send-notification',
        examples: [
          {
            type: 'checkin_alert',
            body: {
              user_id: 123,
              type: 'checkin_alert',
              checkin_id: 456,
            },
          },
          {
            type: 'snooze_reminder',
            body: {
              user_id: 123,
              type: 'snooze_reminder',
              checkin_id: 456,
            },
          },
          {
            type: 'danger_pin_alert',
            body: {
              user_id: 123,
              type: 'danger_pin_alert',
              org_id: 1,
              alert_id: 789,
            },
          },
          {
            type: 'no_response_alert',
            body: {
              user_id: 123,
              type: 'no_response_alert',
              org_id: 1,
              alert_id: 789,
            },
          },
        ],
      },
      warning: 'This endpoint should be disabled in production',
    },
    { status: 200 }
  );
}