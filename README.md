# git-commit-ai

A CLI tool to help you write better commit messages powered by GPT.

## Installation

```bash
deno install --force --allow-env --allow-read --allow-run --allow-net --allow-write --name git-commit-ai https://raw.githubusercontent.com/uzimaru0000/git-commit-ai/main/main.ts
```

## Usage

```bash
$ git-commit-ai
```

Set git-hook to your repository.

```bash
$ git-commit-ai hook > .git/hooks/prepare-commit-msg
$ chmod +x .git/hooks/prepare-commit-msg

$ git commit
```

## Configuration

```toml
# ~/.commit_ai.toml
model = "gpt-3.5-turbo-16k" # "gpt-3.5-turbo", "gpt-3.5-turbo-16k", "gpt-4", "gpt-4-32k"
temperature = 1 # 0.0 ~ 2.0
format = "<gitmoji> <description>" # can use <gitmoji>, <angular>, <scope>, <description>
lang = "ja" # or "en"
apiKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```
