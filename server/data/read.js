// All args after the script name
/*const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node read.js <arg> [more args]");
  process.exit(1);
}
read(args);*/
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(args) {
  const scriptDir = __dirname; // /.../server/data
  const repoRoot = path.resolve(scriptDir, "..", "..");

  // Look for compiled Read.class in common locations
  const packageClassPath = path.join(repoRoot, "server", "data", "Read.class");
  const rootClassPath = path.join(scriptDir, "Read.class");

  let classpath;
  let className;

  if (fs.existsSync(packageClassPath)) {
    classpath = repoRoot; // so `server.data.Read` is resolvable
    className = "server.data.Read";
  } else if (fs.existsSync(rootClassPath)) {
    classpath = scriptDir; // so `Read` is resolvable
    className = "Read";
  } else {
    // Default to package style (common in this project layout)
    classpath = repoRoot;
    className = "server.data.Read";
    console.warn(
      "Warning: Read.class not found in expected locations. Defaulting to",
      className
    );
  }

  const javaArgs = ["-cp", classpath, className, ...args];

  // Forward stdio (stdout/stderr/stdin) to parent process for simplicity
  const javaProcess = spawn("java", javaArgs, { stdio: "inherit" });

  javaProcess.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

export { read };
