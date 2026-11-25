import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const frontendDir = path.join(rootDir, "sentinelops", "sentinelops-app", "services", "frontend");
const frontendDist = path.join(frontendDir, "dist");
const rootDist = path.join(rootDir, "dist");
const rootBuild = path.join(rootDir, "build");

console.log("==> Building SentinelOps for Render Deployment...");

// 1. Ensure frontend dependencies are installed
if (!fs.existsSync(path.join(frontendDir, "node_modules"))) {
  console.log("==> Installing frontend dependencies...");
  execSync("npm install", { cwd: frontendDir, stdio: "inherit" });
}

// 2. Run frontend build
console.log("==> Running Vite build...");
execSync("npm run build", { cwd: frontendDir, stdio: "inherit" });

// 3. Helper to copy folder recursively
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 4. Copy build output to both root ./dist and root ./build
console.log("==> Populating root ./dist and ./build directories for Render...");
fs.rmSync(rootDist, { recursive: true, force: true });
fs.rmSync(rootBuild, { recursive: true, force: true });

copyDirSync(frontendDist, rootDist);
copyDirSync(frontendDist, rootBuild);

// 5. Add SPA redirect support for Render and GitHub Pages
const redirectsContent = "/* /index.html 200\n";
fs.writeFileSync(path.join(rootDist, "_redirects"), redirectsContent);
fs.writeFileSync(path.join(rootBuild, "_redirects"), redirectsContent);

// Add .nojekyll for static hosts
fs.writeFileSync(path.join(rootDist, ".nojekyll"), "");
fs.writeFileSync(path.join(rootBuild, ".nojekyll"), "");

// Ensure 404.html is present in dist and build for GitHub Pages SPA routing
if (fs.existsSync(path.join(frontendDist, "404.html"))) {
  fs.copyFileSync(path.join(frontendDist, "404.html"), path.join(rootDist, "404.html"));
  fs.copyFileSync(path.join(frontendDist, "404.html"), path.join(rootBuild, "404.html"));
} else if (fs.existsSync(path.join(rootDist, "index.html"))) {
  fs.copyFileSync(path.join(rootDist, "index.html"), path.join(rootDist, "404.html"));
  fs.copyFileSync(path.join(rootBuild, "index.html"), path.join(rootBuild, "404.html"));
}

console.log("==> Render build complete! Output ready in both ./dist and ./build.");
