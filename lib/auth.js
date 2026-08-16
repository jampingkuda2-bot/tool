import crypto from "crypto";

export function getExpectedToken() {
  const password = process.env.ADMIN_PASSWORD || "ganti-password-ini";
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function checkPassword(input) {
  const password = process.env.ADMIN_PASSWORD || "ganti-password-ini";
  return input === password;
}
