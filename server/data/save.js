// All args after the script name
/*const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node save.js <arg> [more args]");
  process.exit(1);
}
save(args);*/
export default function save(args) {
  const { spawn } = require("child_process");
  const path = require("path");
  const fs = require("fs");

  const scriptDir = __dirname; // /.../server/data
  const repoRoot = path.resolve(scriptDir, "..", "..");

  // Look for compiled Save.class in common locations
  const packageClassPath = path.join(repoRoot, "server", "data", "Save.class");
  const rootClassPath = path.join(scriptDir, "Save.class");

  let classpath;
  let className;

  if (fs.existsSync(packageClassPath)) {
    classpath = repoRoot; // so `server.data.Save` is resolvable
    className = "server.data.Save";
  } else if (fs.existsSync(rootClassPath)) {
    classpath = scriptDir; // so `Save` is resolvable
    className = "Save";
  } else {
    // Default to package style (common in this project layout)
    classpath = repoRoot;
    className = "server.data.Save";
    console.warn(
      "Warning: Save.class not found in expected locations. Defaulting to",
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
