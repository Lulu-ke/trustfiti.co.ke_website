import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding TrustFiti database...\n");

  // Hash admin password
  const hashedPassword = await bcrypt.hash("Admin@100%", 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@trustfiti.co.ke" },
    update: {},
    create: {
      email: "admin@trustfiti.co.ke",
      phoneNumber: "+254700000000",
      fullName: "TrustFiti Admin",
      role: "ADMIN",
      isVerified: true,
      isActive: true,
    },
  });

  console.log(`Admin user created/verified: ${admin.email}`);
  console.log(`  ID: ${admin.id}`);
  console.log(`  Phone: ${admin.phoneNumber}`);
  console.log(`  Role: ${admin.role}`);

  // Create platform settings
  const settings = [
    { key: "site_name", value: "TrustFiti", description: "Platform name" },
    { key: "site_description", value: "Kenya's trusted review platform", description: "Platform description" },
    { key: "default_country", value: "Kenya", description: "Default country for companies" },
    { key: "claim_expiry_days", value: "7", description: "Days before claim request expires" },
    { key: "max_review_length", value: "5000", description: "Maximum review content length" },
    { key: "min_review_length", value: "20", description: "Minimum review content length" },
    { key: "review_flag_threshold", value: "3", description: "Number of flags before auto-hide" },
  ];

  for (const setting of settings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
    console.log(`  Setting: ${setting.key} = ${setting.value}`);
  }

  // Create default categories
  const categories = [
    { name: "Restaurants & Food", slug: "restaurants-food", description: "Restaurants, cafes, bars, and food delivery" },
    { name: "Banking & Finance", slug: "banking-finance", description: "Banks, SACCOs, insurance, and financial services" },
    { name: "Technology", slug: "technology", description: "IT companies, software, and tech services" },
    { name: "Healthcare", slug: "healthcare", description: "Hospitals, clinics, pharmacies, and health services" },
    { name: "Education", slug: "education", description: "Schools, universities, and training centers" },
    { name: "Real Estate", slug: "real-estate", description: "Property management, agents, and construction" },
    { name: "Retail & Shopping", slug: "retail-shopping", description: "Stores, malls, and e-commerce" },
    { name: "Transport & Logistics", slug: "transport-logistics", description: "Airlines, matatus, logistics, and delivery" },
    { name: "Telecommunications", slug: "telecommunications", description: "Mobile networks, ISPs, and communication" },
    { name: "Government Services", slug: "government-services", description: "Government offices and public services" },
    { name: "Professional Services", slug: "professional-services", description: "Legal, accounting, consulting firms" },
    { name: "Entertainment", slug: "entertainment", description: "Events, nightlife, sports, and recreation" },
    { name: "Hospitality & Travel", slug: "hospitality-travel", description: "Hotels, travel agencies, and tourism" },
    { name: "Automotive", slug: "automotive", description: "Car dealers, garages, and fuel stations" },
    { name: "Beauty & Wellness", slug: "beauty-wellness", description: "Salons, spas, gyms, and personal care" },
  ];

  for (let i = 0; i < categories.length; i++) {
    await prisma.category.upsert({
      where: { slug: categories[i].slug },
      update: {},
      create: {
        ...categories[i],
        sortOrder: i,
        isActive: true,
      },
    });
  }
  console.log(`  ${categories.length} categories seeded`);

  console.log("\nSeed completed successfully!");
  console.log("\n--- Admin Login ---");
  console.log("Email: admin@trustfiti.co.ke");
  console.log("Password: Admin@100%");
  console.log("Dashboard: https://control_panel.trustfiti.co.ke");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
