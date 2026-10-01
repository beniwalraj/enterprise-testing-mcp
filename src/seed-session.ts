import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractEnterpriseSession() {
  console.log("🔒 Launching Interactive Browser for Enterprise Authentication...");
  
  // Launch a headed browser instance so you can interact with the MFA screen
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to your corporate gateway (using Okta/Auth0 style target as example)
  await page.goto("https://github.com"); 

  console.log("💡 ACTION REQUIRED: Log in manually and pass all required MFA checks in the browser window...");

  // The script will wait until it detects you have successfully bypassed the auth gate
  // Adjust this selector to point to a core dashboard element inside your app
  await page.waitForURL("https://github.com", { timeout: 120000 });
  console.log("✅ Authentication detected! Extracting secure session state...");

  // Save cookies, local storage, and session tokens to a secure JSON profile
  const authStatePath = path.resolve(__dirname, "../.auth/session-state.json");
  await context.storageState({ path: authStatePath });
  
  console.log(`💾 Secure session cache successfully written to: ${authStatePath}`);
  await browser.close();
  process.exit(0);
}

extractEnterpriseSession().catch(console.error);
