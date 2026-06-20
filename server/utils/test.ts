import { prisma } from '../config/db';

async function testDatabase() {
  console.log('[Test] Initiating health checks...');
  
  try {
    // 1. Verify Prisma connection by querying the user count
    console.log('[Test] Testing PostgreSQL connection via Prisma...');
    const userCount = await prisma.user.count();
    console.log(`[Test] Connection successful! Found ${userCount} users in database.`);

    // 2. Perform a test user lookup
    console.log('[Test] Testing user table schema compatibility...');
    const tempEmail = `test-${Date.now()}@example.com`;
    const testUser = await prisma.user.findFirst({
      where: { email: tempEmail },
    });
    console.log('[Test] Read operation succeeded.');

    console.log('[Test] All database health checks passed successfully!');
    process.exit(0);
  } catch (err: any) {
    console.error('[Test Error] Database connection or query assertion failed:', err.message || err);
    process.exit(1);
  }
}

testDatabase();
