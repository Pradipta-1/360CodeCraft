
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("--- Testing RoutineRequest ---");
    const requests = await prisma.routineRequest.findMany({
      include: {
        user: true,
        trainer: true
      }
    });
    console.log("Found " + requests.length + " routine requests.");
  } catch (err) {
    console.error("RoutineRequest query FAILED!");
    console.error(err.message);
  }

  try {
    console.log("\n--- Testing WorkoutPlan ---");
    const plans = await prisma.workoutPlan.findMany({
      include: {
        client: true,
        trainer: true
      }
    });
    console.log("Found " + plans.length + " workout plans.");
    if (plans.length > 0) {
      console.log("First plan title:", plans[0].title);
    }
  } catch (err) {
    console.error("WorkoutPlan query FAILED!");
    console.error(err.message);
  }

  try {
    console.log("\n--- Testing Routine ---");
    const routines = await prisma.routine.findMany({
      include: {
        user: true,
        trainer: true
      }
    });
    console.log("Found " + routines.length + " routines.");
  } catch (err) {
    console.error("Routine query FAILED!");
    console.error(err.message);
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error("Fatal error during test script invocation:");
  console.error(err);
  process.exit(1);
});
