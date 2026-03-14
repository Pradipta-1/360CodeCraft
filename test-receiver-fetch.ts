import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.message.findMany({
    where: {
      imageUrl: { not: null }
    },
    orderBy: { createdAt: "desc" },
    take: 5
  });
  
  console.log("Found messages with images:", messages.map(m => ({
    id: m.id,
    senderId: m.senderId,
    receiverId: m.receiverId,
    content: m.content,
    imageUrl: m.imageUrl
  })));

  // Try fetching as the receiver (simulate the query from the route)
  if (messages.length > 0) {
    const msg = messages[0];
    const receiverId = msg.receiverId;
    const otherId = msg.senderId;

    const fetchedForReceiver = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: receiverId, receiverId: otherId },
          { senderId: otherId, receiverId: receiverId }
        ]
      },
      orderBy: { createdAt: "asc" }
    });
    
    const targetMsg = fetchedForReceiver.find(m => m.id === msg.id);
    console.log("For receiver, the message imageUrl is:", targetMsg?.imageUrl);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
