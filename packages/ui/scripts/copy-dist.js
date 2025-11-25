import { cpSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceDir = join(__dirname, "../dist");
const targetDir = join(__dirname, "../../ui-public/dist");

try {
  // Copy dist folder to ui-public
  cpSync(sourceDir, targetDir, { recursive: true, force: true });
  console.info(`✓ Successfully copied dist from ui to ui-public`);
} catch (error) {
  console.error("✗ Error copying dist folder:", error.message);
  process.exit(1);
}
