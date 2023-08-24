import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.2/command/mod.ts";
import {
  Input,
  Secret,
  Select,
} from "https://deno.land/x/cliffy@v1.0.0-rc.2/prompt/mod.ts";
import ora from "npm:ora";
import { Config, readConfig, saveConfig } from "./lib/config.ts";
import { getDiff } from "./lib/git.ts";
import { completion } from "./lib/openai.ts";
import { format } from "./lib/message.ts";
import config from './config.json' assert { type: "json" }

const hook = new Command()
  .description("Output shell script for git commit-msg hook")
  .action(() => {
    console.log(`#!/bin/sh

git-commit-ai > $1
`);
  });

const main = new Command()
  .name(config.name)
  .version(`v${config.version}`)
  .description(config.description)
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

      if (message === "custom") {
        message = await Input.prompt({
          message: "Enter your commit message",
          writer: Deno.stderr,
        });
      }

      console.log(message);

      await saveConfig(
        {
          ...config,
          apiKey,
        },
        configPath
      );
    } catch (e) {
      spinner.fail();
      console.log(e);
      Deno.exit(1);
    }
  });

await main.command("hook", hook).parse(Deno.args);
