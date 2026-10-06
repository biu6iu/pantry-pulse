import { prisma } from "@/lib/config/db";
 
export async function seedFixtures() {
    // Impact is calculated from the item factors below; itemBandages has none, like a custom order
    const recipientA = await prisma.user.create({
        data: {
        name: "Recipient A",
        contactName: "Steve Harvey",
        email: "recipient-a@test.com",
        city: "Cleveland",
        country: "US",
        lat: 41.4993,
        lng: -81.6944,
        },
    });

    const recipientB = await prisma.user.create({
        data: {
        name: "Recipient B",
        contactName: "John Pork",
        email: "recipient-b@test.com",
        city: "Shanghai",
        country: "CN"
        },
    });
    
    const itemPump = await prisma.donatedItem.create({
        data: {
            name: "Infusion Pump",
            category: "Equipment",
            unitsPerPack: 1,
            unitWeightKg: 4,
            co2eKgPerUnit: 20,
            healthImpactTier: 1,
        },
    });
    
    const itemGivingSet = await prisma.donatedItem.create({
        data: {
            name: "IV Giving Set",
            category: "Medical Supplies",
            unitsPerPack: 20,
            unitWeightKg: 0.05,
            co2eKgPerUnit: 0.1,
            healthImpactTier: 3,
        },
    });
    
    const itemBandages = await prisma.donatedItem.create({
        data: { name: "Bandages", category: null },
    });
    
    // Donation A1: Recipient A, 2 entries, different categories, counts towards impact
    const donationA1 = await prisma.donation.create({
        data: {
        id: "#TEST-A1",
        status: "completed",
        createdAt: new Date("2026-08-29T00:00:00Z"),
        recipientId: recipientA.id,
        },
    });
    await prisma.donationEntry.create({
        data: { donationId: donationA1.id, itemId: itemPump.id, quantity: 2 },
    });
    await prisma.donationEntry.create({
        data: { donationId: donationA1.id, itemId: itemGivingSet.id, quantity: 5 },
    });
    
    // Donation A2: Recipient A, 1 entry, uncategorised item, still open so it has no impact
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
    
    // Donation B1: Recipient B, 3 entries (one without item factors), counts towards impact
    const donationB1 = await prisma.donation.create({
        data: {
        id: "#TEST-B1",
        status: "completed",
        createdAt: new Date("2026-06-29T00:00:00Z"),
        completedAt: new Date("2026-07-03T00:00:00Z"),
        recipientId: recipientB.id,
        },
    });
    await prisma.donationEntry.create({
        data: { donationId: donationB1.id, itemId: itemPump.id, quantity: 1 },
    });
    await prisma.donationEntry.create({
        data: { donationId: donationB1.id, itemId: itemGivingSet.id, quantity: 2 },
    });
    await prisma.donationEntry.create({
        data: { donationId: donationB1.id, itemId: itemBandages.id, quantity: 4 },
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
    await prisma.donationEntry.deleteMany({});
    await prisma.donation.deleteMany({});
    await prisma.donatedItem.deleteMany({});
    await prisma.user.deleteMany({});
}