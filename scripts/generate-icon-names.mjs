import { readdir, writeFile } from "node:fs/promises";

const iconDirectory = new URL("../node_modules/lucide/dist/esm/icons/", import.meta.url);
const output = new URL("../src/generated-icon-names.ts", import.meta.url);
const files = await readdir(iconDirectory);
const names = files
  .filter((name) => name.endsWith(".mjs"))
  .map((name) => name.slice(0, -4))
  .sort();

const source = `// Generated from the installed Lucide package. Do not edit manually.\nexport const generatedIconNames = ${JSON.stringify(names)} as const;\n`;
await writeFile(output, source, "utf8");
