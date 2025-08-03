# 認証機能セットアップガイド

このドキュメントでは、Junior English DictionaryのGoogle OAuth認証機能の設定方法を説明します。

## 概要

本アプリケーションは**NextAuth.js v5**を使用してGoogleアカウントによるログイン機能を提供します。ユーザーごとの学習履歴はブラウザのlocalStorageに保存されます。

## 前提条件

- Node.js 18以上
- Googleアカウント
- Google Cloud Platform アカウント

## セットアップ手順

### 1. Google Cloud Console での設定

#### 1.1 プロジェクトの作成・選択

1. [Google Cloud Console](https://console.developers.google.com/) にアクセス
2. 画面上部のプロジェクト選択ドロップダウンをクリック
3. 「新しいプロジェクト」を選択
4. プロジェクト情報を入力:
   - **プロジェクト名**: `Junior English Dictionary`
   - **組織**: (任意)
5. 「作成」をクリック

#### 1.2 OAuth同意画面の設定

1. 左サイドメニューから「OAuth同意画面」を選択
2. ユーザータイプで **「外部」** を選択
3. 「作成」をクリック
4. OAuth同意画面の設定:

```
アプリ名: Junior English Dictionary
ユーザーサポートメール: [あなたのメールアドレス]
アプリのロゴ: (任意)
アプリのホームページ: http://localhost:3000 (開発時)
アプリのプライバシーポリシー: (任意)
利用規約: (任意)
承認済みドメイン: localhost (開発時)
デベロッパーの連絡先情報: [あなたのメールアドレス]
```

5. 「保存して次へ」をクリック
6. スコープの設定は**スキップ**
7. テストユーザーの設定は**スキップ** (本番公開時は要設定)

#### 1.3 OAuth認証情報の作成

1. 左サイドメニューから「認証情報」を選択
2. 「+ 認証情報を作成」→「OAuth 2.0 クライアントID」を選択
3. アプリケーションの種類: **「ウェブアプリケーション」**
4. 名前: `Junior Dictionary Web Client`
5. **承認済みのリダイレクトURI**に以下を追加:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   ※本番環境では `https://yourdomain.com/api/auth/callback/google`
6. 「作成」をクリック

#### 1.4 認証情報の取得

作成完了後、以下の情報が表示されます:
- **クライアントID**: `123456789012-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
- **クライアントシークレット**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`

> 💡 これらの値は後で環境変数として使用します

### 2. 環境変数の設定

#### 2.1 NextAuthシークレットの生成

以下のコマンドでランダムなシークレットキーを生成:

```bash
# macOS/Linux
openssl rand -base64 32

# Windows (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 2.2 .env.localファイルの更新

プロジェクトルートの `.env.local` ファイルを以下のように更新:

```bash
# OpenAI API Key (既存)
OPENAI_API_KEY=your-openai-api-key

# NextAuth.js Configuration
NEXTAUTH_SECRET=生成したランダムな32文字以上の文字列
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=Google Consoleで取得したクライアントID
GOOGLE_CLIENT_SECRET=Google Consoleで取得したクライアントシークレット
```

#### 2.3 設定例

```bash
# OpenAI API Key
OPENAI_API_KEY=sk-proj-abc123def456...

# NextAuth.js Configuration
NEXTAUTH_SECRET=Yp8K9L2mN3oP4qR5sT6uV7wX8yZ9aB1cD2eF3gH4iJ5kL6
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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3456
```

### 3. 動作確認

#### 3.1 開発サーバーの起動

```bash
npm run dev
```

#### 3.2 認証機能のテスト

1. ブラウザで `http://localhost:3000` を開く
2. 画面右上の「Googleでログイン」ボタンをクリック
3. Googleの認証画面が表示されることを確認
4. 認証完了後、ユーザー名が表示されることを確認
5. 単語を検索して履歴が保存されることを確認
6. ログアウト後、再ログインで履歴が復元されることを確認

## 本番環境での設定

### 1. Google Cloud Console の更新

本番デプロイ時は以下を更新:

1. OAuth同意画面:
   ```
   アプリのホームページ: https://yourdomain.com
   承認済みドメイン: yourdomain.com
   ```

2. OAuth認証情報:
   ```
   承認済みのリダイレクトURI: https://yourdomain.com/api/auth/callback/google
   ```

### 2. 環境変数の更新

```bash
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=本番用クライアントID
GOOGLE_CLIENT_SECRET=本番用クライアントシークレット
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. "redirect_uri_mismatch" エラー
```
原因: リダイレクトURIが設定と一致しない
解決: Google Cloud ConsoleのOAuth設定でリダイレクトURIを確認
```

#### 2. "invalid_client" エラー
```
原因: クライアントIDまたはシークレットが間違っている
解決: .env.localの値を再確認
```

#### 3. 認証画面が表示されない
```
原因: NextAuth設定またはAPI routeの問題
解決: 
- サーバーを再起動
- ブラウザのキャッシュをクリア
- /api/auth/providers にアクセスして設定確認
```

#### 4. ユーザーデータが保存されない
```
原因: ユーザーIDの取得またはlocalStorage関連の問題
解決: 
- ブラウザの開発者ツールでlocalStorageを確認
- コンソールエラーを確認
```

### ログの確認方法

開発環境でのデバッグ:

```bash
# NextAuth.jsのデバッグログを有効化
DEBUG=next-auth* npm run dev
```

## セキュリティ考慮事項

1. **環境変数の管理**:
   - `.env.local` をGitにコミットしない
   - 本番環境では環境変数を安全に管理

2. **OAuth設定**:
   - 承認済みドメインを適切に設定
   - 不要なスコープは要求しない

3. **データ保存**:
   - 機密情報はlocalStorageに保存しない
   - 必要に応じてデータベース移行を検討

## 参考リンク

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.developers.google.com/)

---

このドキュメントに関する質問や問題がある場合は、プロジェクトのIssueとして報告してください。