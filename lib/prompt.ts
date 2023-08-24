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
    "ci",
    "chore",
    "revert",
  ],
  scope: [
    "(codebase)",
    "(database)",
    "(deprecated)",
    "(auth)",
    "(security)",
    "(user-profile)",
    "(readme)",
    "(production)",
    "(login-page)",
    "(project)",
    "(user-login)",
  ],
};

const lang = ['en', 'ja'] as const
const body = ["description"] as const;
type Body = (typeof body)[number];
type Lang = (typeof lang)[number];
const bodyMap: Record<Body, Record<Lang, string[]>> = {
  description: {
    en: [
    "Implement new caching mechanism",
    "Resolve database connection issues",
    "Update documentation regarding deprecated features",
    "Improve UI of authentication module",
    "Enhance password encryption methods",
    "Boost performance of user profile loading",
    "Add unit tests for README file parser",
    "Setup Docker for production environment",
    "Add continuous integration for login page",
    "Update project dependencies",
    "Revert changes to user login process due to bugs",
  ],
  ja: [
    "新しいキャッシュメカニズムを実装する",
    "データベース接続の問題を解決する",
    "非推奨の機能に関するドキュメントを更新する",
    "認証モジュールのUIを改善する",
    "パスワード暗号化方法を改善する",
    "ユーザープロファイルの読み込みパフォーマンスを向上させる",
    "READMEファイルパーサーのユニットテストを追加する",
    "本番環境のDockerをセットアップする",
    "ログインページの継続的な統合を追加する",
    "プロジェクトの依存関係を更新する",
    "バグのためユーザーログインプロセスの変更を元に戻す",
  ]
  }
};
const langMap: Record<Lang, string> = {
  en: "English",
  ja: "Japanese"
}

export const createPrompt = (format: string, lang: Lang, diff: string, hint?: string) => {
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
    .replace("{{diff}}", `\`\`\`\n${diff}\n\`\`\``)
    .replace("{{hint}}", hint ? `hint: ${hint}` : "");
};
