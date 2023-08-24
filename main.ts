import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.2/command/mod.ts";
// @deno-types="npm:@types/prompts"
import prompts from "npm:prompts";
import ora from "npm:ora";
import { Config, readConfig, saveConfig } from "./lib/config.ts";
import { getDiff } from "./lib/git.ts";
import { completion } from "./lib/openai.ts";
import { format } from "./lib/message.ts";
import { stderr } from "node:process";

await new Command()
  .name("git-commit-ai")
  .description("A CLI tool to help you write better commit messages.")
  .version("v0.1.0")
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

    let apiKey = key || config.apiKey;
    if (!apiKey) {
      const input = await prompts({
        type: "password",
        name: "apiKey",
        message: "Enter your OpenAI API key",
      });
      apiKey = input.apiKey;
    }

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

      let { message } = await prompts({
        type: "select",
        name: "message",
        message: "Choice a commit message",
        choices: [
          ...format(res ?? "").map((line) => ({
            title: line,
            value: line,
          })),
          {
            title: "Custom",
            value: "custom",
          },
        ],
        stdout: stderr,
      });

      if (message === "custom") {
        const input = await prompts({
          type: "text",
          name: "message",
          message: "Enter your commit message",
          stdout: stderr,
        });

        message = input.message;
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
  })
  .parse();
