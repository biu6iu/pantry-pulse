import { prisma } from "@/lib/config/db";
 
export async function seedFixtures() {
    //arbitrary values given to the impact scores
    const recipientA = await prisma.user.create({
        data: {
        name: "Recipient A",
        contactName: "Steve Harvey",
        email: "recipient-a@test.com",
        city: "Cleveland",
        country: "US",
        },
    });
    
    const recipientB = await prisma.user.create({
        data: {
        name: "Recipient B",
        contactName: "John Pork",
        email: "recipient-b@test.com",
        city: "Shanghai",
        country: "CN",
        },
    });
    
    const itemPump = await prisma.donatedItem.create({
        data: { name: "Infusion Pump", category: "Equipment" },
    });
    
    const itemGivingSet = await prisma.donatedItem.create({
        data: { name: "IV Giving Set", category: "Medical Supplies" },
    });
    
    const itemBandages = await prisma.donatedItem.create({
        data: { name: "Bandages", category: null },
    });
    
    // Donation A1: Recipient A, 2 entries, different categories, has impacts
    const donationA1 = await prisma.donation.create({
        data: {
        id: "#TEST-A1",
        status: "completed",
        createdAt: new Date("2026-08-29T00:00:00Z"),
        recipientId: recipientA.id,
        },
    });
    const entryA1_1 = await prisma.donationEntry.create({
        data: { donationId: donationA1.id, itemId: itemPump.id, quantity: 2 },
    });
    await prisma.healthImpact.create({
        data: { donationEntryId: entryA1_1.id, score: 10 },
    });
    const entryA1_2 = await prisma.donationEntry.create({
        data: { donationId: donationA1.id, itemId: itemGivingSet.id, quantity: 5 },
    });
    await prisma.healthImpact.create({
        data: { donationEntryId: entryA1_2.id, score: 5 },
    });
    await prisma.environmentalImpact.create({
        data: { donationId: donationA1.id, co2Saved: 20, score: 8 },
    });
    
    // Donation A2: Recipient A, 1 entry, uncategorised item, no health or environmental impacts
    const donationA2 = await prisma.donation.create({
        data: {
        id: "#TEST-A2",
        status: "open",
        createdAt: new Date("2026-07-29T00:00:00Z"),
        recipientId: recipientA.id,
        },
    });
    await prisma.donationEntry.create({
        data: { donationId: donationA2.id, itemId: itemBandages.id, quantity: 10 },
    });
    
    // Donation B1: Recipient B, 3 entries, has impacts
    const donationB1 = await prisma.donation.create({
        data: {
        id: "#TEST-B1",
        status: "completed",
        createdAt: new Date("2026-06-29T00:00:00Z"),
        recipientId: recipientB.id,
        },
    });
    const entryB1_1 = await prisma.donationEntry.create({
        data: { donationId: donationB1.id, itemId: itemPump.id, quantity: 1 },
    });
    await prisma.healthImpact.create({
        data: { donationEntryId: entryB1_1.id, score: 3 },
    });
    const entryB1_2 = await prisma.donationEntry.create({
        data: { donationId: donationB1.id, itemId: itemGivingSet.id, quantity: 2 },
    });
    await prisma.healthImpact.create({
        data: { donationEntryId: entryB1_2.id, score: 2 },
    });
    const entryB1_3 = await prisma.donationEntry.create({
        data: { donationId: donationB1.id, itemId: itemBandages.id, quantity: 4 },
    });
    await prisma.healthImpact.create({
        data: { donationEntryId: entryB1_3.id, score: 1 },
    });
    await prisma.environmentalImpact.create({
        data: { donationId: donationB1.id, co2Saved: 15, score: 6 },
    });
    
    return {
        recipientA,
        recipientB,
        itemPump,
        itemGivingSet,
        itemBandages,
        donationA1,
        donationA2,
        donationB1,
    };
}
 
export async function clearFixtures() {
    await prisma.healthImpact.deleteMany({});
    await prisma.environmentalImpact.deleteMany({});
    await prisma.donationEntry.deleteMany({});
    await prisma.donation.deleteMany({});
    await prisma.donatedItem.deleteMany({});
    await prisma.user.deleteMany({});
}