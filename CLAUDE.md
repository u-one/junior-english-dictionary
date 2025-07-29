# Junior English Dictionary

日本の中学生向けの英英辞典webアプリケーション

## 概要

このプロジェクトは、日本の中学生が英単語を調べて、分かりやすい英語で意味を学習できるwebアプリケーションです。OpenAI GPT-3.5-turboを使用して、平易な英語での説明を提供します。

## 主要機能

### 🔍 単語検索
- テキストフィールドに英単語を入力して検索
- OpenAI APIを使用した中学生向けの分かりやすい英語での説明
- 品詞、定義、例文を含む構造化された出力

### 🖱️ クリック可能な単語
- 説明文内の英単語（2文字以上）が自動的にクリック可能
- 単語をクリックすると即座にその単語の意味を検索
- 関連語彙の連鎖的な学習を促進

### 📚 履歴機能
- **ナビゲーション履歴**: ブラウザ風の戻る・進む機能
- **サイドバー履歴**: 左側に検索履歴をリスト表示
- **最近の検索**: よく使う単語への素早いアクセス

### 🎨 ユーザーインターフェース
- レスポンシブデザイン（デスクトップ・モバイル対応）
- ダークモード対応
- 直感的なナビゲーション
- ローディング状態とエラーハンドリング

## 技術スタック

### フロントエンド
- **Next.js 15.4.4** - React フレームワーク
- **React 19.1.0** - UI ライブラリ
- **TypeScript** - 型安全性
- **Tailwind CSS v4** - スタイリング

### バックエンド
- **Next.js API Routes** - サーバーサイド API
- **OpenAI SDK 5.10.2** - AI API統合

### 開発ツール
- **ESLint** - コード品質
- **Git** - バージョン管理

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.local` ファイルを作成し、OpenAI API キーを設定：
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 開発サーバーの起動
```bash
npm run dev
```

アプリケーションは http://localhost:3000 でアクセス可能です。

## API エンドポイント

### POST `/api/dictionary`
英単語の意味を取得するAPI

**リクエスト:**
```json
{
  "word": "apple"
}
```

**レスポンス:**
```json
{
  "definition": "**apple** (*noun*)\n\nAn apple is a round fruit that grows on trees. It has red, green, or yellow skin and white flesh inside. Apples are sweet and crunchy.\n\n**Examples:**\n- I eat an apple for lunch every day.\n- She picked red apples from the tree."
}
```

## プロンプト設計

中学生向けの説明を生成するため、以下のガイドラインでプロンプトを設計：

- 簡単な語彙（初級〜中級レベル）を使用
- 短くて明確な文章
- 品詞の明記
- 1-2個の簡単な例文
- 現在時制の使用を推奨
- 複雑な文法構造を避ける

## ファイル構造

```
junior-english-dictionary/
├── src/
│   └── app/
│       ├── api/
│       │   └── dictionary/
│       │       └── route.ts          # OpenAI API統合
│       ├── globals.css               # グローバルスタイル
│       ├── layout.tsx               # レイアウトコンポーネント
│       └── page.tsx                 # メインページ
├── .env.local                       # 環境変数（Git除外）
├── .gitignore                      # Git除外設定
├── CLAUDE.md                       # このファイル
├── next.config.ts                  # Next.js設定
├── package.json                    # 依存関係
├── postcss.config.mjs             # PostCSS設定
├── tailwind.config.ts             # Tailwind CSS設定
└── tsconfig.json                  # TypeScript設定
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# リンター実行
npm run lint
```

## 学習効果

このアプリケーションは以下の学習効果を提供します：

1. **語彙拡張**: クリック可能な単語により関連語彙を自然に学習
2. **文脈理解**: 例文を通じた実用的な使用方法の習得
3. **反復学習**: 履歴機能による効率的な復習
4. **自律学習**: 興味に応じた能動的な語彙探索

## 今後の拡張予定

- [ ] 音声読み上げ機能
- [ ] お気に入り単語の保存
- [ ] 学習進捗の可視化
- [ ] オフライン対応
- [ ] 多言語サポート

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

🤖 Generated with [Claude Code](https://claude.ai/code)