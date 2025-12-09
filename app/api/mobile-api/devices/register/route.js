// FILE LOCATION: app/api/mobile-api/devices/register/route.js

import { db } from '@/utils';
import { USER_DEVICES } from '@/utils/schema/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * POST /api/mobile-api/devices/register
 * Register or update user's device FCM token for push notifications
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, device_token, device_type, device_name } = body;

    // Validation
    if (!user_id || !device_token || !device_type) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'user_id, device_token, and device_type are required' 
        },
        { status: 400 }
      );
    }

    // Validate device_type
    if (!['ios', 'android'].includes(device_type)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'device_type must be either "ios" or "android"' 
        },
        { status: 400 }
      );
    }

    // Check if device token already exists
    const existingDevice = await db
      .select()
      .from(USER_DEVICES)
      .where(eq(USER_DEVICES.device_token, device_token))
      .limit(1);

    if (existingDevice && existingDevice.length > 0) {
      // Update existing device
      await db
        .update(USER_DEVICES)
        .set({
          user_id,
          device_name: device_name || null,
          is_active: true,
          last_used_at: new Date(),
        })
        .where(eq(USER_DEVICES.device_token, device_token));

      return NextResponse.json(
        {
          success: true,
          message: 'Device token updated successfully',
        },
        { status: 200 }
      );
    }

    // Insert new device
    await db
      .insert(USER_DEVICES)
      .values({
        user_id,
        device_token,
        device_type,
        device_name: device_name || null,
        is_active: true,
        last_used_at: new Date(),
      });

    // Optional: Mark other devices for this user as inactive (single device policy)
    // Uncomment if you want only one active device per user
    // await db
    //   .update(USER_DEVICES)
    //   .set({ is_active: false })
    //   .where(
    //     and(
    //       eq(USER_DEVICES.user_id, user_id),
    //       sql`${USER_DEVICES.device_token} != ${device_token}`
    //     )
    //   );

    return NextResponse.json(
      {
        success: true,
        message: 'Device token registered successfully',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Device registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/mobile-api/devices/register
 * Deactivate a device token
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const { device_token } = body;

    if (!device_token) {
      return NextResponse.json(
        { success: false, message: 'device_token is required' },
        { status: 400 }
      );
    }

    await db
      .update(USER_DEVICES)
      .set({ is_active: false })
      .where(eq(USER_DEVICES.device_token, device_token));

    return NextResponse.json(
      {
        success: true,
        message: 'Device deactivated successfully',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Device deactivation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}