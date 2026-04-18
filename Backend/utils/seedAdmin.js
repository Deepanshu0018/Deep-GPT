import User from "../models/User.js";
import { hashPassword } from "./auth.js";

const DEFAULT_ADMIN = {
  name: "Deepanshu",
  email: "deepanshu.admin@deepgpt.local",
  password: "admin@123",
  role: "admin",
};

const seedAdmin = async () => {
  const existingAdmin = await User.findOne({
    $or: [{ email: DEFAULT_ADMIN.email }, { name: DEFAULT_ADMIN.name }],
  });

  if (existingAdmin) {
    let didChange = false;

    if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      didChange = true;
    }

    if (existingAdmin.email !== DEFAULT_ADMIN.email) {
      existingAdmin.email = DEFAULT_ADMIN.email;
      didChange = true;
    }

    if (didChange) {
      await existingAdmin.save();
    }

    return;
  }

  await User.create({
    name: DEFAULT_ADMIN.name,
    email: DEFAULT_ADMIN.email,
    passwordHash: hashPassword(DEFAULT_ADMIN.password),
    role: DEFAULT_ADMIN.role,
  });
};

export default seedAdmin;
