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

// QR for first time
client.on("qr", qr => {
  console.log("=== SCAN QR ONCE ===");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("✅ Authenticated, session saved");
});

// When ready, wait small time to ensure session files are written
client.on("ready", async () => {
  console.log("✅ WhatsApp Ready");

  const sessionPath = `${SESSION_DIR}/LocalAuth-main`;

  // Wait max 5 seconds to ensure session folder is saved
  let waited = 0;
  while (!(await fs.pathExists(sessionPath)) && waited < 5000) {
    await new Promise(r => setTimeout(r, 500));
    waited += 500;
  }

  if (await fs.pathExists(sessionPath)) {
    console.log("📁 Session folder confirmed");
  } else {
    console.warn("⚠️ Session folder not found, but job will continue");
  }

  console.log("✅ Ready to finish job");
  
  // Instead of process.exit, just allow Node to finish naturally
  // GitHub Actions will continue after script ends
  setTimeout(() => {
    console.log("🏁 Ending script");
    process.exit(0);
  }, 1000); // 1s delay to ensure files saved
});

client.on("auth_failure", msg => {
  console.error("❌ Authentication failure:", msg);
  process.exit(1);
});

client.initialize();
