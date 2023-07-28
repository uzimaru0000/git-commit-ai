import TOML from "npm:@iarna/toml";
import {
  enumType,
  maxRange,
  minRange,
  number,
  object,
  optional,
  Output,
  safeParseAsync,
  string,
} from "npm:valibot@0.3.0";

const models = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-16k",
  "gpt-4",
  "gpt-4-32k",
] as const;

const ConfigSchema = object({
  apiKey: string(),
  model: optional(enumType(models)),
  temperature: optional(number([minRange(0), maxRange(1)])),
  format: optional(string()),
});

export type Config = Partial<Output<typeof ConfigSchema>>;

const configPath = () => {
  return `${Deno.env.get("HOME") ?? ""}/.commit_ai.toml`;
};

export const defaultConfig: Required<Omit<Config, "apiKey">> = {
  model: "gpt-3.5-turbo",
  temperature: 1.0,
  format: "<angular> <scope>: <description>",
};

const exists = async (path: string) => {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
};

export const readConfig = async (inputPath?: string): Promise<Config> => {
  const path = inputPath ?? configPath();

  if (!(await exists(path))) {
    return defaultConfig;
  }

  const file = await Deno.readTextFile(path);
  const tomlData = TOML.parse(file);

  const config = await safeParseAsync(ConfigSchema, tomlData);

  if (!config.success) {
    return defaultConfig;
  }

  return {
    ...defaultConfig,
    ...config.data,
  };
};

export const saveConfig = async (config: Config, inputPath?: string) => {
  const path = inputPath ?? configPath();
  const tomlData = TOML.stringify(
    Object.fromEntries(
      Object.entries(config).filter(([_, v]) => v !== undefined) as [
        string,
        any,
      ],
    ),
  );

  await Deno.writeTextFile(path, tomlData);
};
