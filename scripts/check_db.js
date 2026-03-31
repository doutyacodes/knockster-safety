import { db } from '../utils/index.js';
import { USERS, USER_PROFILES, USER_ROLES, ROLES } from '../utils/schema/schema.js';
import { eq } from 'drizzle-orm';

async function check() {
  const users = await db.select().from(USERS).where(eq(USERS.email, 'moderator@sandbox.test'));
  console.log("USERS:", users);

  if (users.length > 0) {
    const profiles = await db.select().from(USER_PROFILES).where(eq(USER_PROFILES.user_id, users[0].id));
    console.log("PROFILES:", profiles);

    const userRoles = await db.select().from(USER_ROLES).where(eq(USER_ROLES.user_id, users[0].id));
    console.log("USER_ROLES:", userRoles);
  }
  process.exit(0);
}

check();
