# Junior English Dictionary - 設計概要

## プロジェクト概要
日本の中学生（12-15歳）向けの英英辞典webアプリ。OpenAI GPT-3.5-turboを使用して平易な英語で単語の意味を説明。

**技術スタック**: Next.js 15 + React 19 + TypeScript + Tailwind CSS + OpenAI API

## システム構成
```
ユーザー入力 → Next.js API Route → OpenAI API → Markdown処理 → 結果表示
```

## 主要機能
1. **単語検索** - 英単語入力で定義・発音・例文・関連語を取得
2. **クリック可能単語** - 説明文内の単語をクリックして関連検索
3. **履歴管理** - ブラウザ風の戻る/進むナビゲーション
4. **サイドバー履歴** - 検索履歴の一覧表示
5. **レスポンシブUI** - ダークモード対応、モバイル最適化

## ファイル構成
```
src/app/
├── api/dictionary/route.ts  # OpenAI API統合
├── page.tsx                 # メインUI（検索・表示・履歴）
├── layout.tsx               # レイアウト
└── globals.css              # スタイル
```

## 状態管理
```typescript
// 検索状態
const [word, setWord] = useState<string>("");
const [result, setResult] = useState<string>("");
const [loading, setLoading] = useState<boolean>(false);

// 履歴管理
const [navigationHistory, setNavigationHistory] = useState<SearchEntry[]>([]);
const [currentIndex, setCurrentIndex] = useState<number>(-1);

// UI状態
const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
```

## API仕様

### POST /api/dictionary
**リクエスト**:
```json
{ "word": "apple" }
```

**レスポンス**:
```json
{
  "definition": "**apple** /ˈæpəl/ (*noun*)\n\nAn apple is a round fruit...\n\n**Examples:**\n- I eat an apple every day.\n\n**Synonyms:** fruit\n**Similar words:** orange, pear"
}
```

## OpenAI設定
- **Model**: gpt-3.5-turbo
- **プロンプト**: 中学生向けの平易な英語で説明生成
- **出力形式**: Markdown（発音記号、例文、関連語を含む）

## 開発・デプロイ

**開発**: `npm run dev`  
**ビルド**: `npm run build`  
**デプロイ**: Vercel推奨（環境変数: `OPENAI_API_KEY`）

## 今後の拡張予定
- 音声読み上げ機能
- 検索履歴の永続化
- 学習進捗追跡
- クイズ機能