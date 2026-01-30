import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import qrcode from "qrcode-terminal";
import fs from "fs-extra";

const SESSION_DIR = "./session";
await fs.ensureDir(SESSION_DIR);

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "main",
    dataPath: SESSION_DIR
  }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  }
});

// QR code for first-time authentication
client.on("qr", qr => {
  console.log("=== SCAN THIS QR ONCE ===");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("✅ Authenticated, session saved");
});

client.on("ready", () => {
  console.log("✅ WhatsApp Ready, session active");

  // GitHub Actions will detect session folder naturally
  console.log("📁 Session folder location:", SESSION_DIR);

  // Exit naturally
  process.exit(0);
});

client.on("auth_failure", msg => {
  console.error("❌ Authentication failure:", msg);
  process.exit(1);
});

client.initialize();
