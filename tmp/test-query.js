
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing RoutineRequest query...");
    const requests = await prisma.routineRequest.findMany({
      include: {
        user: true,
        trainer: true
      }
    });
    console.log("Success! Found " + requests.length + " requests.");
  } catch (err) {
    console.error("QUERY FAILED!");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
