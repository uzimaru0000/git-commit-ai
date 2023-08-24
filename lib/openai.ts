import { OpenAI } from "https://deno.land/x/openai@1.4.2/mod.ts";
import { Config, defaultConfig } from "./config.ts";
import { createPrompt } from "./prompt.ts";

const userPrompt = `
The following is a list of commit messages. Please select the one that best describes the changes you made.
`.trim()

export const completion = async (diff: string, config: Config & { hint?: string }) => {
  const openai = new OpenAI(config.apiKey!);

  const prompt = createPrompt(config.format ?? defaultConfig.format, config.lang ?? defaultConfig.lang, diff, config.hint);
  const response = await openai.createChatCompletion({
    model: config.model ?? defaultConfig.model,
    temperature: config.temperature ?? defaultConfig.temperature,
    messages: [
      { role: 'system', content: prompt },
      { role: "user", content: userPrompt }
    ],
  });

  return response.choices[0].message.content;
};
