require("dotenv").config();
const mongoose = require("mongoose");
const connectDatabase = require("../src/config/db");
const User = require("../src/models/User");
const Property = require("../src/models/Property");

const sampleUsers = [
  { name: "Aarav Sharma", email: "aarav.tenant@example.test", password: "TenantPass123", role: "tenant", phone: "9000000001" },
  { name: "Diya Patel", email: "diya.tenant@example.test", password: "TenantPass123", role: "tenant", phone: "9000000002" },
  { name: "Kabir Rao", email: "kabir.tenant@example.test", password: "TenantPass123", role: "tenant", phone: "9000000003" },
  { name: "Ananya Reddy", email: "ananya.owner@example.test", password: "OwnerPass123", role: "owner", phone: "9000000004" },
  { name: "Ishaan Mehta", email: "ishaan.owner@example.test", password: "OwnerPass123", role: "owner", phone: "9000000005" },
  { name: "NearNest Demo Admin", email: "admin@example.test", password: "AdminPass123", role: "admin", phone: "9000000006" }
];

const sampleProperties = [
  {
    title: "Sunny two-bedroom near the park",
    description: "Bright apartment with a balcony, secure parking, and an easy commute to HITEC City.",
    rent: 26000, deposit: 52000, bhk: 2, propertyType: "Apartment", furnishing: "Semi Furnished",
    amenities: ["Balcony", "Parking", "Lift"], images: [], address: "12 Botanical Garden Road",
    locality: "Kondapur", city: "Hyderabad", latitude: 17.4614, longitude: 78.3568
  },
  {
    title: "Comfortable family home in Madhapur",
    description: "Well-maintained three-bedroom home close to shops, offices, and public transport.",
    rent: 42000, deposit: 84000, bhk: 3, propertyType: "House", furnishing: "Unfurnished",
    amenities: ["Parking", "Power backup"], images: [], address: "8 Kavuri Hills Lane",
    locality: "Madhapur", city: "Hyderabad", latitude: 17.4483, longitude: 78.3915
  },
  {
    title: "Furnished apartment near the metro",
    description: "Move-in-ready apartment with a bright living room and reliable building security.",
    rent: 35000, deposit: 70000, bhk: 2, propertyType: "Apartment", furnishing: "Fully Furnished",
    amenities: ["Lift", "Security", "Gym"], images: [], address: "24 Greenlands Avenue",
    locality: "Ameerpet", city: "Hyderabad", latitude: 17.4375, longitude: 78.4483
  },
  {
    title: "Affordable shared PG room",
    description: "Clean shared accommodation with meals nearby and convenient bus connections.",
    rent: 9000, deposit: 9000, bhk: 1, propertyType: "PG", furnishing: "Fully Furnished",
    amenities: ["Wi-Fi", "Laundry"], images: [], address: "5 College Street",
    locality: "Dilsukhnagar", city: "Hyderabad", latitude: 17.3688, longitude: 78.5247
  },
  {
    title: "Quiet villa with garden space",
    description: "Spacious villa with a private garden, family-friendly streets, and covered parking.",
    rent: 68000, deposit: 136000, bhk: 4, propertyType: "Villa", furnishing: "Semi Furnished",
    amenities: ["Garden", "Parking", "Pet friendly"], images: [], address: "19 Lake View Road",
    locality: "Miyapur", city: "Hyderabad", latitude: 17.4968, longitude: 78.357
  },
  {
    title: "Modern one-bedroom in Bengaluru",
    description: "Practical apartment with a sunny balcony and easy access to the neighborhood market.",
    rent: 24000, deposit: 48000, bhk: 1, propertyType: "Apartment", furnishing: "Unfurnished",
    amenities: ["Balcony", "Lift"], images: [], address: "31 Indiranagar Main Road",
    locality: "Indiranagar", city: "Bengaluru", latitude: 12.9784, longitude: 77.6408
  },
  {
    title: "Spacious house in Pune",
    description: "Comfortable independent home with a family room and a quiet residential setting.",
    rent: 32000, deposit: 64000, bhk: 3, propertyType: "House", furnishing: "Semi Furnished",
    amenities: ["Parking", "Terrace"], images: [], address: "7 University Road",
    locality: "Aundh", city: "Pune", latitude: 18.559, longitude: 73.8077
  },
  {
    title: "Simple private room in Chennai",
    description: "An affordable private room with shared kitchen access close to local transit.",
    rent: 11000, deposit: 22000, bhk: 1, propertyType: "Room", furnishing: "Unfurnished",
    amenities: ["Shared kitchen", "Transit nearby"], images: [], address: "14 Lake View Street",
    locality: "Velachery", city: "Chennai", latitude: 12.975, longitude: 80.2212
  }
];

async function findOrCreateUser(data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) return existing;
  return User.create(data);
}

async function seed() {
  await connectDatabase();
  const users = new Map();
  for (const data of sampleUsers) users.set(data.email, await findOrCreateUser(data));

  for (const [index, data] of sampleProperties.entries()) {
    if (await Property.exists({ title: data.title })) continue;
    const ownerEmail = index % 2 === 0 ? "ananya.owner@example.test" : "ishaan.owner@example.test";
    await Property.create({ ...data, owner: users.get(ownerEmail).id });
  }
  console.log("Fictional demo data is ready: 1 admin, 2 owners, 3 tenants, and 8 rental listings.");
  console.log("Demo admin: admin@example.test / AdminPass123");
  console.log("Demo owner: ananya.owner@example.test / OwnerPass123");
  console.log("Demo tenant: aarav.tenant@example.test / TenantPass123");
}

seed()
  .catch((error) => {
    console.error(`Unable to seed database: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
