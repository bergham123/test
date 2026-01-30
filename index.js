import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import qrcode from "qrcode-terminal";
import fs from "fs-extra";

const SESSION_DIR = "./session";
await fs.ensureDir(SESSION_DIR);

// Initialize WhatsApp client
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

// ===== Events =====
client.on("qr", qr => {
  console.log("=== SCAN THIS QR ONCE ===");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("✅ Authenticated, session saved");
});

const waitForSession = async () => {
  const sessionPath = `${SESSION_DIR}/LocalAuth-main`;
  while (!(await fs.pathExists(sessionPath))) {
    console.log("⏳ Waiting for session files to be written...");
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log("📁 Session folder confirmed");
};

client.on("ready", async () => {
  console.log("✅ WhatsApp Ready");

  // Wait until session folder exists to ensure GitHub Actions can commit
  await waitForSession();

  console.log("✅ Session fully saved, exiting safely");
  process.exit(0);
});

client.on("auth_failure", msg => {
  console.error("❌ Authentication failure:", msg);
  process.exit(1);
});

// Start client
client.initialize();
