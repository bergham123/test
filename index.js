import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import qrcode from "qrcode-terminal";
import fs from "fs-extra";

const SESSION_DIR = "./session";
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

// ===== Events =====
client.on("qr", qr => {
  console.log("=== SCAN THIS QR ONCE ===");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("✅ Authenticated, session saved");
});

const waitForSessionFiles = async () => {
  const pathToSession = `${SESSION_DIR}/LocalAuth-main`;
  let attempts = 0;
  while (!(await fs.pathExists(pathToSession)) && attempts < 20) {
    console.log("⏳ Waiting for session files to be written...");
    await new Promise(r => setTimeout(r, 500));
    attempts++;
  }
  if (await fs.pathExists(pathToSession)) {
    console.log("📁 Session folder confirmed");
  } else {
    console.warn("⚠️ Session folder not found after wait");
  }
};

client.on("ready", async () => {
  console.log("✅ WhatsApp Ready");

  // Ensure session is fully saved
  await waitForSessionFiles();

  console.log("✅ Session fully saved, exiting safely");

  // Force exit for GitHub Actions
  process.exit(0);
});

client.on("auth_failure", msg => {
  console.error("❌ Authentication failure:", msg);
  process.exit(1);
});

// Start WhatsApp
client.initialize();
