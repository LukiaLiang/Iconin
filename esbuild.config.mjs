import esbuild from "esbuild";
import builtinModules from "builtin-modules";
import { copyFile, mkdir } from "node:fs/promises";

const production = process.argv[2] === "production";
const testPluginDir = "test-vault/.obsidian/plugins/iconin";

const copyPluginFiles = {
  name: "copy-plugin-files",
  setup(build) {
    build.onEnd(async (result) => {
      if (result.errors.length > 0) return;
      await mkdir(testPluginDir, { recursive: true });
      await Promise.all([
        copyFile("main.js", `${testPluginDir}/main.js`),
        copyFile("manifest.json", `${testPluginDir}/manifest.json`),
        copyFile("styles.css", `${testPluginDir}/styles.css`),
      ]);
    });
  },
};

const context = await esbuild.context({
  banner: { js: "/* Iconin: generated bundle; source lives in this repository. */" },
  bundle: true,
  entryPoints: ["src/main.ts"],
  external: ["obsidian", "electron", "@codemirror/*", ...builtinModules],
  format: "cjs",
  logLevel: "info",
  minify: production,
  outfile: "main.js",
  platform: "browser",
  sourcemap: production ? false : "inline",
  target: "es2022",
  plugins: [copyPluginFiles],
});

if (production) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
}
