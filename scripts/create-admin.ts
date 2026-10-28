// npm run admin:create -- --email you@example.com --name "Owner" [--password "…"] [--role owner|staff]
// Creates the user, or resets the password if the email already exists. Prints a generated password if none given.
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const arg = (k: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

async function main() {
  const email = arg("email")?.trim().toLowerCase();
  const name = arg("name") ?? "Admin";
  const role = arg("role") === "staff" ? "staff" : "owner";
  if (!email || !email.includes("@")) throw new Error("--email is required");
  const generated = !arg("password");
  const password = arg("password") ?? randomBytes(9).toString("base64url");
  if (password.length < 10) throw new Error("Password must be at least 10 characters");

  const db = new PrismaClient();
  const passwordHash = await hashPassword(password);
  const user = await db.adminUser.upsert({ where: { email }, update: { passwordHash, name, role }, create: { email, name, role, passwordHash } });
  await db.$disconnect();
  console.log(`Admin ready: ${user.email} (${user.role})`);
  if (generated) console.log(`Password: ${password}\nChange it after first login (Settings → Account).`);
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
