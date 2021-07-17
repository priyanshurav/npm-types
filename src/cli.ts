#!/usr/bin/env node

import yargs from "yargs/yargs";
import { info } from "./logger";
import { getPkgsToBeInstalled, runNpm } from "./utils";

const cli = yargs(process.argv.slice(2)).option("install-deprecated-types", {
  boolean: true,
  description: "Install deprecated types",
  alias: "d",
});

const usage = `Usage:
    npm-types [<pkg>]...`;

cli.usage(usage);

async function main() {
  const pkgsToBeInstalled = await getPkgsToBeInstalled(
    (cli.argv as any)._,
    (cli.argv as any).installDeprecatedTypes
  );
  console.log(pkgsToBeInstalled);

  info(`Production dependencies to be installed: ${pkgsToBeInstalled.prodDeps.join(", ")}`);
  info("Installing production dependencies...");
  await runNpm(`install ${pkgsToBeInstalled.prodDeps.join(" ")}`);
  if (pkgsToBeInstalled.devDeps.length !== 0) {
    info(`Development dependencies to be installed: ${pkgsToBeInstalled.devDeps.join(", ")}`);
    info("Installing development dependencies...");
    await runNpm(`install ${pkgsToBeInstalled.devDeps.join(" ")} --save-dev`);
  }
  info("Finished");
}

main();
