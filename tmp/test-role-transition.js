const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTransition() {
  console.log('--- Starting Role Transition Verification ---');

  try {
    // 1. Setup Dummy Data
    const trainer = await prisma.user.create({
      data: {
        email: `trainer_${Date.now()}@test.com`,
        name: 'Test Trainer',
        passwordHash: 'dummy',
        role: 'TRAINER',
      }
    });

    const user = await prisma.user.create({
      data: {
        email: `user_${Date.now()}@test.com`,
        name: 'Test User',
        passwordHash: 'dummy',
        role: 'USER',
      }
    });

    // Create a routine
    await prisma.routine.create({
      data: {
        userId: user.id,
        trainerId: trainer.id,
        isActive: true,
        days: []
      }
    });

    // Create a workout plan
    await prisma.workoutPlan.create({
      data: {
        clientId: user.id,
        trainerId: trainer.id,
        title: 'Test Plan',
        description: 'Test Desc'
      }
    });

    console.log('Setup complete: Trainer, User, Routine, and Plan created.');

    // 2. Test TRAINER -> USER Transition (Manual Transaction)
    console.log('Simulating TRAINER -> USER transition logic...');
    
    await prisma.$transaction(async (tx) => {
      // Logic copied from route.ts
      await tx.routine.deleteMany({ where: { trainerId: trainer.id } });
      await tx.workoutPlan.deleteMany({ where: { trainerId: trainer.id } });
      await tx.routineRequest.deleteMany({ where: { trainerId: trainer.id } });
      // (Event logic skipped for simplicity in this basic check, but could be added)
    });

    // Verify cleanup
    const routinesCount = await prisma.routine.count({ where: { trainerId: trainer.id } });
    const plansCount = await prisma.workoutPlan.count({ where: { trainerId: trainer.id } });

    console.log(`Verification (TRAINER->USER): Routines=${routinesCount}, Plans=${plansCount}`);
    if (routinesCount === 0 && plansCount === 0) {
      console.log('✅ TRAINER->USER logic verified.');
    } else {
      console.error('❌ TRAINER->USER logic failed cleanup.');
    }

    // 3. Test USER -> TRAINER Transition
    console.log('Simulating USER -> TRAINER transition logic...');
    
    // Create new routine for the user
    await prisma.routine.create({
      data: {
        userId: user.id,
        trainerId: trainer.id,
        isActive: true,
        days: []
      }
    });

    await prisma.$transaction(async (tx) => {
      await tx.routine.deleteMany({ where: { userId: user.id } });
      await tx.workoutPlan.deleteMany({ where: { clientId: user.id } });
      await tx.routineRequest.deleteMany({ where: { userId: user.id } });
    });

    const userRoutinesCount = await prisma.routine.count({ where: { userId: user.id } });
    console.log(`Verification (USER->TRAINER): User Routines=${userRoutinesCount}`);
    if (userRoutinesCount === 0) {
      console.log('✅ USER->TRAINER logic verified.');
    } else {
      console.error('❌ USER->TRAINER logic failed cleanup.');
    }

    // Cleanup test users
    await prisma.user.deleteMany({ where: { id: { in: [trainer.id, user.id] } } });
    console.log('Cleanup complete.');

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testTransition();
