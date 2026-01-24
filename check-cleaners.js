const mongoose = require("mongoose");
const CleanerProfile = require("./models/CleanerProfile");
const User = require("./models/User");
require("dotenv").config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const count = await CleanerProfile.countDocuments();
  console.log("Total CleanerProfiles:", count);

  const pending = await CleanerProfile.find({ approvalStatus: "pending" });
  console.log("Pending Profiles:", pending.length);

  const approved = await CleanerProfile.find({ approvalStatus: "approved" });
  console.log("Approved Profiles:", approved.length);
  approved.forEach((p) =>
    console.log(` - ${p.firstName} ${p.lastName} (${p._id})`),
  );

  const all = await CleanerProfile.find().limit(10);
  console.log("Recent 10 profiles:");
  all.forEach((p) => {
    console.log(
      ` - ${p.firstName}: status=${p.approvalStatus}, verified=${p.verified}`,
    );
  });

  await mongoose.connection.close();
}

check().catch(console.error);
