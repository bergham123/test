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

const waitForSession = async () => {
  const sessionPath = `${SESSION_DIR}/LocalAuth-main`;
  let attempts = 0;
  while (!(await fs.pathExists(sessionPath)) && attempts < 20) {
    console.log("⏳ Waiting for session files to be written...");
    await new Promise(r => setTimeout(r, 500));
    attempts++;
  }
  if (await fs.pathExists(sessionPath)) {
    console.log("📁 Session folder confirmed");
  } else {
    console.warn("⚠️ Session folder not found after waiting");
  }
};

client.on("ready", async () => {
  console.log("✅ WhatsApp Ready");

  // Ensure session files are fully written
  await waitForSession();

  console.log("✅ Session fully saved, job will finish now");

  // Exit safely after small delay to ensure GitHub Actions can detect session
  setTimeout(() => process.exit(0), 1000);
});

client.on("auth_failure", msg => {
  console.error("❌ Authentication failure:", msg);
  process.exit(1);
});

// Initialize client
client.initialize();
