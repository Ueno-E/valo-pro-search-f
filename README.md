# ばろぷろさーち (VALO PRO SEARCH)

🕹️ **VALORANT プロシーンの情報検索サイト**  
リーグチームと所属プレイヤーの情報、使用デバイスや設定をまとめたデータベースアプリです。

🔗 URL: https://valo-pro-search.onrender.com/

---

## 🌟 概要

**ばろぷろさーち**は、ゲーム *VALORANT* のプロ選手に関する情報を簡単に検索できる Web アプリケーションです。  
各チームに所属するプレイヤーの **デバイス構成** や **ゲーム設定** を確認できます。

---

## 🛠️ 使用技術

| カテゴリ | 技術 |
|--------|------|
| 言語 | Python |
| Webフレームワーク | Flask |
| デプロイ | Render.com |
| データ形式 | JSON（予定・変更可） |

---

## 🚀 デプロイについて

本アプリは **Render (無料プラン)** 上で動作しています。  
そのため、以下の点にご注意ください。

- 一定時間アクセスがない場合 **スリープ状態** になります
- 初回アクセス時に **起動まで数十秒程度**かかる場合があります

---

## 📌 主な機能

- チーム一覧表示
- 所属選手情報の閲覧
- プレイヤーの使用デバイス情報表示
- マウス感度やクロスヘアなど設定の確認
- （対応している場合）レスポンシブ対応

---

## 💻 ローカルでの動作方法

```bash
# リポジトリのクローン
git clone https://github.com/yourname/valo-pro-search.git
cd valo-pro-search

# 仮想環境作成 (任意)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# パッケージインストール
pip install -r requirements.txt

# 実行
python app.py
