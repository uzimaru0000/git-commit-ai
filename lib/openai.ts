import { OpenAI } from "https://deno.land/x/openai@1.4.2/mod.ts";
import { Config, defaultConfig } from "./config.ts";
import { createPrompt } from "./prompt.ts";

export const completion = async (
  diff: string,
  config: Config & { hint?: string }
) => {
  const openai = new OpenAI(config.apiKey!);

  const prompt = createPrompt(
    config.format ?? defaultConfig.format,
    config.lang ?? defaultConfig.lang,
    diff,
    config.hint
  );
  const genCommitMsg = await openai.createChatCompletion({
    model: config.model ?? defaultConfig.model,
    temperature: config.temperature ?? defaultConfig.temperature,
    messages: [{ role: "user", content: prompt }],
  });

  const convJSON = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    temperature: config.temperature ?? defaultConfig.temperature,
    messages: [
      { role: "user", content: genCommitMsg.choices[0].message.content ?? "" },
    ],
    functions: [
      {
        name: "generate_commit_message",
        description: "Generate a commit message from a diff",
        parameters: {
          type: "object",
          required: ["commit_messages"],
          properties: {
            commit_messages: {
              type: "array",
              description: "The commit messages to be created",
              items: {
                type: "string",
              },
            },
          },
        },
      },
    ],
    function_call: "auto",
  });

  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  const args: string = convJSON.choices[0].message.function_call.arguments;
  return JSON.parse(args) as { commit_messages: string[] };
};
