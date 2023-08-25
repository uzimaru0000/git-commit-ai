import { init } from "./lib/mod.ts";
import config from "./config.json" assert { type: "json" };

Deno.addSignalListener("SIGINT", () => {
  Deno.exit(1);
});

await init(config).parse(Deno.args);
