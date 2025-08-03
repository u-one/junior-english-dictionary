# Junior English Dictionary

日本の中学生向けの英英辞典webアプリケーション

[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)

## 🎯 概要

Junior English Dictionaryは、日本の中学生（12-15歳）が英単語を学習するためのインタラクティブな英英辞典です。OpenAI GPT-3.5-turboを活用して、中学生にも理解しやすい平易な英語で単語の意味を説明します。

### 主な特徴

- 🔍 **シンプルな検索**: 英単語を入力するだけで詳細な説明を取得
- 🔊 **発音記号表示**: IPA（国際音声記号）で正確な発音を学習
- 🖱️ **クリック可能な単語**: 説明文内の英単語をクリックして関連検索
- 📚 **関連語表示**: 類義語、対義語、類似語を色分けして表示
- 📖 **検索履歴**: ブラウザ風のナビゲーションと左サイドバーでの履歴管理
- 🌙 **ダークモード**: ライト・ダークテーマの自動切り替え対応
- 📱 **レスポンシブデザイン**: デスクトップ・タブレット・モバイル対応

## 🚀 クイックスタート

### 必要な環境

- Node.js 18.0以上
- npm 9.0以上
- OpenAI APIキー

### インストール

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd junior-english-dictionary
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
```bash
cp .env.local.example .env.local
```

`.env.local`ファイルを編集してOpenAI APIキーを設定:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. **開発サーバーの起動**
```bash
npm run dev
```

5. **ブラウザでアクセス**
[http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認

## 🎮 使い方

### 基本的な検索
1. 検索フィールドに英単語を入力（例: "apple"）
2. 「検索」ボタンをクリックまたはEnterキーを押下
3. 単語の意味、発音記号、例文、関連語が表示される

### 高度な機能
- **関連語検索**: 説明文内の青いリンクになった単語をクリック
- **履歴ナビゲーション**: 「戻る」「進む」ボタンで過去の検索結果を閲覧
- **サイドバー履歴**: 左側の履歴リストから直接過去の検索にアクセス
- **最近の検索**: 結果画面下部の履歴タグから再検索

## 🏗️ プロジェクト構成

```
junior-english-dictionary/
├── docs/                    # 設計ドキュメント
│   ├── DESIGN.md           # 総合設計書
│   ├── API.md              # API仕様書
│   ├── FRONTEND.md         # フロントエンド設計書
│   └── DEVELOPMENT.md      # 開発ガイド
├── src/
│   └── app/
│       ├── api/
│       │   └── dictionary/
│       │       └── route.ts # OpenAI API統合
│       ├── globals.css     # グローバルスタイル
│       ├── layout.tsx      # ルートレイアウト
│       └── page.tsx        # メインページ
├── public/                 # 静的ファイル
├── .env.local             # 環境変数（要作成）
├── CLAUDE.md              # プロジェクト概要
└── README.md              # このファイル
```

## 🛠️ 開発

### 利用可能なスクリプト

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run start    # 本番サーバー起動
npm run lint     # ESLintによるコード検査
```

### 技術スタック

**フロントエンド:**
- Next.js 15.4.4 (App Router)
- React 19.1.0
- TypeScript
- Tailwind CSS v4

**バックエンド:**
- Next.js API Routes
- OpenAI GPT-3.5-turbo

**開発ツール:**
- ESLint
- Git

### コーディング規約

- **TypeScript**: 厳密な型定義を使用
- **ESLint**: Next.js推奨設定に準拠
- **命名規則**: camelCase（変数・関数）、PascalCase（コンポーネント）
- **コミットメッセージ**: 日本語で簡潔に記述

詳細な開発ガイドラインは必要に応じて追加予定です。

## 📖 ドキュメント

- **[設計概要](docs/DESIGN.md)**: システム全体の構成と主要機能の概要

## 🌟 機能詳細

### OpenAI統合
```typescript
// プロンプト例
const prompt = `
あなたは日本の中学生向けの英英辞典です。
"${word}"を中学生にも理解できる平易な英語で説明してください。

出力形式:
**[単語]** /[IPA発音記号]/ (*品詞*)
[簡潔な定義]
**Examples:**
- [例文1]
- [例文2]
**Synonyms:** 類義語1, 類義語2
**Antonyms:** 対義語1, 対義語2
**Similar words:** 類似語1, 類似語2
`;
```

### Markdownパーサー
説明文を視覚的にフォーマット:
- **太字**: `**text**` → **text**
- **見出し**: `**Word** /pronunciation/ (*pos*)` → 構造化表示
- **リスト**: `- item` → 箇条書き表示
- **関連語**: カテゴリ別色分けタグ

### 状態管理
```typescript
interface SearchEntry {
  word: string;
  result: string;
  timestamp: number;
}

// React Hooks による状態管理
const [navigationHistory, setNavigationHistory] = useState<SearchEntry[]>([]);
const [currentIndex, setCurrentIndex] = useState<number>(-1);
const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
```

## 🚀 デプロイメント

### Vercel（推奨）
```bash
# Vercel CLI のインストール
npm i -g vercel

# デプロイ
vercel

# 環境変数の設定
vercel env add OPENAI_API_KEY

# 本番デプロイ
vercel --prod
```

### その他のプラットフォーム
- **Netlify**: `npm run build` → `out/` フォルダをデプロイ
- **AWS Amplify**: Git連携で自動デプロイ
- **Docker**: Dockerfileを作成してコンテナ化

## 🧪 テスト

```bash
# テスト実行（将来実装）
npm test

# カバレッジ取得
npm run test:coverage

# E2Eテスト
npm run test:e2e
```

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m '機能追加: 素晴らしい機能を実装'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

詳細な貢献ガイドラインは必要に応じて追加予定です。

## 📋 今後の拡張予定

### Phase 2: ユーザビリティ向上
- [ ] 音声読み上げ機能（Web Speech API）
- [ ] 「もしかして」候補機能の改良
- [ ] 検索履歴の永続化（LocalStorage）
- [ ] お気に入り単語機能

### Phase 3: 学習支援強化
- [ ] 単語の難易度レベル表示
- [ ] 学習進捗追跡
- [ ] 復習システム
- [ ] クイズ機能

### Phase 4: 多機能化
- [ ] 例文検索機能
- [ ] イディオム・句動詞対応
- [ ] PWA化（オフライン対応）
- [ ] 多言語サポート

## 🐛 既知の問題

- OpenAI APIのレート制限により、大量の検索で一時的に制限される場合があります
- クライアントサイド状態管理のため、ページリロード時に履歴が消失します
- 複雑な専門用語への対応が不完全な場合があります

詳細は [Issues](https://github.com/your-repo/issues) を参照してください。

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 👥 開発者

- **Claude Code Assistant** - 初期開発・設計
- **あなたの名前** - プロジェクト管理・機能拡張

## 🙏 謝辞

- [OpenAI](https://openai.com/) - GPT-3.5-turbo API
- [Next.js](https://nextjs.org/) - React フレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク
- [Vercel](https://vercel.com/) - ホスティングプラットフォーム

## 📞 サポート

質問や問題がある場合:

1. [Issues](https://github.com/your-repo/issues) で既存の問題を検索
2. 新しい Issue を作成
3. [Discussions](https://github.com/your-repo/discussions) で議論を開始

---

**🎓 学習を楽しく、効果的に！**

このアプリケーションが中学生の英語学習に役立つことを願っています。機能の改善やバグ報告など、どんな貢献も歓迎します。

---

🤖 **Generated with [Claude Code](https://claude.ai/code)**