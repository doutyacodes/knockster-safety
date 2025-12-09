// FILE LOCATION: services/push-notification-service.js

import admin from '../lib/firebase-admin.js';
import { db } from '../utils/index.js';
import { USER_DEVICES, NOTIFICATION_LOGS } from '../utils/schema/schema.js';
import { eq, and } from 'drizzle-orm';

/**
 * Send push notification to a single device
 * @param {string} deviceToken - FCM device token
 * @param {object} notification - { title, body }
 * @param {object} data - Additional data payload
 * @returns {Promise} FCM response
 */
export async function sendToDevice(deviceToken, notification, data = {}) {
  try {
    const message = {
      token: deviceToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        // Ensure all data values are strings
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}),
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'safety_checkin_channel',
          sound: 'default',
          priority: 'max',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'content-available': 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    throw error;
  }
}

/**
 * Send push notification to all active devices of a user
 * @param {number} userId - User ID
 * @param {object} notification - { title, body }
 * @param {object} data - Additional data payload
 * @returns {Promise} Array of results
 */
export async function sendToUser(userId, notification, data = {}) {
  try {
    // Get all active devices for user
    const devices = await db
      .select()
      .from(USER_DEVICES)
      .where(
        and(
          eq(USER_DEVICES.user_id, userId),
          eq(USER_DEVICES.is_active, true)
        )
      );

    if (!devices || devices.length === 0) {
      console.log(`⚠️ No active devices found for user ${userId}`);
      return { success: false, message: 'No active devices' };
    }

    console.log(`📱 Sending notification to ${devices.length} device(s) for user ${userId}`);

    // Send to all devices
    const promises = devices.map(device =>
      sendToDevice(device.device_token, notification, data)
        .then(result => ({ device: device.device_token, success: true, result }))
        .catch(error => ({ device: device.device_token, success: false, error: error.message }))
    );

    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`✅ Sent to ${successful} devices, ❌ Failed: ${failed}`);

    return {
      success: successful > 0,
      total: devices.length,
      successful,
      failed,
      results,
    };
  } catch (error) {
    console.error('❌ Error sending to user:', error);
    throw error;
  }
}

/**
 * Send push notification to a topic (for admin alerts)
 * @param {string} topic - Topic name (e.g., 'org_1_alerts')
 * @param {object} notification - { title, body }
 * @param {object} data - Additional data payload
 * @returns {Promise} FCM response
 */
export async function sendToTopic(topic, notification, data = {}) {
  try {
    const message = {
      topic: topic,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...Object.keys(data).reduce((acc, key) => {
          acc[key] = String(data[key]);
          return acc;
        }, {}),
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'admin_alerts_channel',
          sound: 'default',
          priority: 'max',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ Topic notification sent to "${topic}":`, response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error(`❌ Failed to send topic notification to "${topic}":`, error);
    throw error;
  }
}

/**
 * Subscribe a device token to a topic
 * @param {string} deviceToken - FCM device token
 * @param {string} topic - Topic name
 * @returns {Promise}
 */
export async function subscribeToTopic(deviceToken, topic) {
  try {
    const response = await admin.messaging().subscribeToTopic([deviceToken], topic);
    console.log(`✅ Subscribed to topic "${topic}":`, response);
    return { success: true, ...response };
  } catch (error) {
    console.error(`❌ Failed to subscribe to topic "${topic}":`, error);
    throw error;
  }
}

/**
 * Unsubscribe a device token from a topic
 * @param {string} deviceToken - FCM device token
 * @param {string} topic - Topic name
 * @returns {Promise}
 */
export async function unsubscribeFromTopic(deviceToken, topic) {
  try {
    const response = await admin.messaging().unsubscribeFromTopic([deviceToken], topic);
    console.log(`✅ Unsubscribed from topic "${topic}":`, response);
    return { success: true, ...response };
  } catch (error) {
    console.error(`❌ Failed to unsubscribe from topic "${topic}":`, error);
    throw error;
  }
}

/**
 * Log notification to database
 * @param {number} checkinId - Check-in ID
 * @param {number} userId - User ID
 * @param {string} notificationType - Type of notification
 * @param {string} deliveryStatus - 'sent', 'delivered', or 'failed'
 * @param {string} errorMessage - Error message if failed
 */
export async function logNotification(checkinId, userId, notificationType, deliveryStatus, errorMessage = null) {
  try {
    await db.insert(NOTIFICATION_LOGS).values({
      checkin_id: checkinId,
      user_id: userId,
      notification_type: notificationType,
      sent_at: new Date(),
      delivery_status: deliveryStatus,
      error_message: errorMessage,
    });
  } catch (error) {
    console.error('❌ Failed to log notification:', error);
  }
}

/**
 * Send check-in alert notification
 * @param {number} userId - User ID
 * @param {number} checkinId - Check-in ID
 * @param {string} label - Timing label
 * @param {string} scheduledTime - Scheduled time
 */
export async function sendCheckinAlert(userId, checkinId, label, scheduledTime) {
  const notification = {
    title: '⏰ Safety Check-in Required',
    body: `Time for your ${label} check-in`,
  };

  const data = {
    type: 'checkin_alert',
    checkin_id: checkinId.toString(),
    label,
    scheduled_time: scheduledTime,
  };

  try {
    const result = await sendToUser(userId, notification, data);
    await logNotification(checkinId, userId, 'initial_checkin', 'sent');
    return result;
  } catch (error) {
    await logNotification(checkinId, userId, 'initial_checkin', 'failed', error.message);
    throw error;
  }
}

/**
 * Send snooze reminder notification
 * @param {number} userId - User ID
 * @param {number} checkinId - Check-in ID
 * @param {number} snoozeNumber - Snooze attempt number
 * @param {number} remainingSnoozes - Remaining snoozes
 */
export async function sendSnoozeReminder(userId, checkinId, snoozeNumber, remainingSnoozes) {
  const notification = {
    title: '⏰ Check-in Reminder',
    body: `Please complete your safety check-in (${remainingSnoozes} snoozes remaining)`,
  };

  const data = {
    type: 'checkin_alert',
    checkin_id: checkinId.toString(),
  };

  try {
    const result = await sendToUser(userId, notification, data);
    await logNotification(checkinId, userId, `snooze_reminder_${snoozeNumber}`, 'sent');
    return result;
  } catch (error) {
    await logNotification(checkinId, userId, `snooze_reminder_${snoozeNumber}`, 'failed', error.message);
    throw error;
  }
}

/**
 * Send danger PIN alert to admins
 * @param {number} orgId - Organization ID
 * @param {number} alertId - Alert ID
 * @param {string} userName - User name who entered danger PIN
 */
export async function sendDangerPinAlert(orgId, alertId, userName) {
  const topic = `org_${orgId}_alerts`;
  
  const notification = {
    title: '🚨 CRITICAL: Danger PIN Entered',
    body: `${userName} has entered their danger PIN - immediate action required`,
  };

  const data = {
    type: 'admin_alert',
    alert_id: alertId.toString(),
    alert_type: 'danger_pin_entered',
    priority: 'critical',
  };

  return await sendToTopic(topic, notification, data);
}

/**
 * Send no response alert to admins
 * @param {number} orgId - Organization ID
 * @param {number} alertId - Alert ID
 * @param {string} userName - User name who didn't respond
 */
export async function sendNoResponseAlert(orgId, alertId, userName) {
  const topic = `org_${orgId}_alerts`;
  
  const notification = {
    title: '🚨 No Response Alert',
    body: `${userName} has not responded after 3 snooze attempts`,
  };

  const data = {
    type: 'admin_alert',
    alert_id: alertId.toString(),
    alert_type: 'no_response_after_snooze',
    priority: 'high',
  };

  return await sendToTopic(topic, notification, data);
}