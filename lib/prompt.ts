// @deno-types="npm:@types/lodash-es"
import { zip } from "npm:lodash-es";

const promptTemplate = `
suggest 10 commit messages based on the following diff:
{{diff}}
commit messages should:
 - follow conventional commits
 - message format should be: {{format}}
 - You MUST write the commit message in "{{lang}}"

examples:
{{examples}}

{{hint}}
`;

const prefix = ["gitmoji", "angular", "scope"] as const;
type Prefix = (typeof prefix)[number];
const prefixMap: Record<Prefix, string[]> = {
  gitmoji: [
    ":sparkles:",
    ":bug:",
    ":memo:",
    ":lipstick:",
    ":art:",
    ":zap:",
    ":white_check_mark:",
    ":construction_worker:",
    ":ferris_wheel:",
    ":wrench:",
    ":rewind:",
  ],
  angular: [
    "feat",
    "fix",
    "docs",
    "style",
    "refactor",
    "perf",
    "test",
    "build",
    "chore",
    "chore",
    "revert",
  ],
  scope: [
    "(auth)",
    "(login)",
    "(README)",
    "(buttons)",
    "(login)",
    "(images)",
    "(registration)",
    "(ci)",
    "(dependencies)",
    "(config)",
    "(login)",
  ],
};

const lang = ["en", "ja"] as const;
const body = ["description"] as const;
type Body = (typeof body)[number];
type Lang = (typeof lang)[number];
const bodyMap: Record<Body, Record<Lang, string[]>> = {
  description: {
    en: [
      "Add new user authentication feature",
      "Fix issue with user login not working",
      "Update README with new installation steps",
      "Improve button styling on main page",
      "Refactor login function for clarity",
      "Optimize image loading for faster page render",
      "Add tests for user registration flow",
      "Update Travis CI to include new test suite",
      "Update dependencies to latest versions",
      "Update .gitignore to exclude new temp files",
      "Revert to previous version of login page",
    ],
    ja: [
      "新しいユーザー認証機能を追加",
      "ユーザーログインが機能しない問題を修正",
      "新しいインストール手順でREADMEを更新",
      "メインページのボタンスタイルを改善",
      "クラリティのためにログイン機能をリファクタリング",
      "画像の読み込みを最適化してページのレンダリングを高速化",
      "ユーザー登録フローのテストを追加",
      "新しいテストスイートを含むTravis CIを更新",
      "最新バージョンの依存関係を更新",
      "新しい一時ファイルを除外するように.gitignoreを更新",
      "以前のバージョンのログインページに戻す",
    ],
  },
};
const langMap: Record<Lang, string> = {
  en: "English",
  ja: "Japanese",
};

export const createPrompt = (
  format: string,
  lang: Lang,
  diff: string,
  hint?: string
) => {
  const examples = zip(
    ...prefix.map((p) => prefixMap[p]),
    ...body.map((b) => bodyMap[b][lang])
  )
    .map((x) => {
      return ` - ${format
        .replace("<gitmoji>", x[0] ?? "")
        .replace("<angular>", x[1] ?? "")
        .replace("<scope>", x[2] ?? "")
        .replace("<description>", x[3] ?? "")}`;
    })
    .join("\n");

  return promptTemplate
    .replace("{{format}}", format)
    .replace("{{examples}}", examples)
    .replace("{{lang}}", langMap[lang])
    .replace("{{diff}}", `\`\`\`diff\n${diff}\n\`\`\``)
    .replace("{{hint}}", hint ? `hint: ${hint}` : "");
};
