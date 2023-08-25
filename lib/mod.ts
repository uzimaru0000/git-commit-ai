import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.2/command/mod.ts";
import {
  Input,
  Secret,
  Select,
} from "https://deno.land/x/cliffy@v1.0.0-rc.2/prompt/mod.ts";
import ora from "npm:ora";
import { Config, readConfig, saveConfig } from "./config.ts";
import { getDiff } from "./git.ts";
import { completion } from "./openai.ts";
import { format } from "./message.ts";

const hook = new Command()
  .description("Output shell script for git commit-msg hook")
  .action(() => {
    console.log(`#!/usr/bin/env bash

# copy this file to .git/hooks/prepare-commit-msg
#
# git-commit-ai hook > .git/hooks/prepare-commit-msg
# chmod +x .git/hooks/prepare-commit-msg

if [ -z $2 ]; then
  git-commit-ai > $1
fi
`);
  });

const main = (name: string, version: string, description: string) => {
  return new Command()
    .name(name)
    .version(`v${version}`)
    .description(description)
    .option("--key <key:string>", "An OpenAI API key", {
      required: false,
    })
    .option(
      "-f, --format <format:string>",
      "The format of the commit message. Takes a string with the following placeholders: <gitmoji>, <angular>, <scope>, <description>"
    )
    .option("-m, --model <model:string>", "The model to use.")
    .option("-t, --temperature <temperature:number>", "The temperature to use.")
    .option(
      "-l, --max-tokens <maxTokens:number>",
      "The maximum number of tokens to use."
    )
    .option(
      "-c, --config <path:string>",
      "The path to the config file. Defaults to $HOME/.commit_ai.toml"
    )
    .option(
      "--hint <hint:string>",
      "A hint to help the model generate better results."
    )
    .action(async ({ config: configPath, key, hint, ...args }) => {
      const config = await readConfig(configPath);

      const apiKey =
        key ??
        config.apiKey ??
        (await Secret.prompt({
          message: "Enter your OpenAI API key",
          writer: Deno.stderr,
        }));

      const fullConfig: Config = {
        ...config,
        ...(args as Config),
        apiKey,
      };

      const diff = await getDiff();
      if (!diff) {
        console.log("No changes");
        Deno.exit(0);
      }

      const spinner = ora("Generating commit message").start();
      try {
        const res = await completion(diff, { ...fullConfig, hint });
        spinner.succeed();

        let message = await Select.prompt({
          message: "Choice a commit message",
          options: [...format(res ?? "").map((line) => line), "custom"],
          writer: Deno.stderr,
        });

        if (!message) {
          Deno.exit(1);
        }

        if (message === "custom") {
          message = await Input.prompt({
            message: "Enter your commit message",
            writer: Deno.stderr,
          });
        }

        console.log(message);

        await saveConfig(
          config,
          configPath
        );
      } catch {
        spinner.fail();
        Deno.exit(1);
      }
    });
};

type CliConfig = {
  name: string;
  version: string;
  description: string;
};
export const init = (config: CliConfig) => {
  return main(config.name, config.version, config.description).command(
    "hook",
    hook
  );
};
