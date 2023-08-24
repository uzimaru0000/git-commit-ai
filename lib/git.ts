export const getDiff = async () => {
  const cmd = new Deno.Command("git", {
    args: ["diff", "--cached"],
  });

  const output = await cmd.output();
  const diff = new TextDecoder().decode(output.stdout);

  if (diff === "") {
    return null;
  }

  return diff;
};

export const commit = async (message: string) => {
  const cmd = new Deno.Command("git", {
    args: ["commit", "-m", message],
  });

  await cmd.output();
}
