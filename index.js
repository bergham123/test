import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import qrcode from "qrcode-terminal";
import fs from "fs-extra";

// Paths
const SESSION_DIR = "./session";

// Ensure session directory exists
await fs.ensureDir(SESSION_DIR);

// Init WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "main",
    dataPath: SESSION_DIR
  }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  }
});

// Fired only if NO session exists
client.on("qr", qr => {
  console.log("🔐 No session found. Scan this QR once:");
  qrcode.generate(qr, { small: true });
});

// Fired when session is restored OR after QR scan
client.on("ready", () => {
  console.log("✅ WhatsApp session is ready");
  console.log("📁 Session saved in:", SESSION_DIR);
  process.exit(0);
});

// Optional: session saved confirmation
client.on("authenticated", () => {
  console.log("🔐 Authenticated & session stored");
});

// Error handling
client.on("auth_failure", msg => {
  console.error("❌ Authentication failure:", msg);
});

client.initialize();
