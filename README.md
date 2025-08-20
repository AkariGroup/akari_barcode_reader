# akari_barcode_reader

AKARI のカメラを用いたバーコードリーダ

## 概要

- 13 桁のバーコード(JAN)コードを AKARI のカメラに写し，読み取らせる．
- 読み取った内容をデータベースに照会し，登録されたデータを画面上に表示する．

## セットアップ手順

このアプリケーションでは，バーコードを読み取る AKARI，読み取った商品情報を表示するコンピュータ，商品情報を格納するデータベース用のコンピュータを用意する．なお，1 台の AKARI,コンピュータが複数の機能を実行することも可能である．

1. 各役割のコンピュータにクローンする．

```bash
git clone https://github.com/AkariGroup/akari_barcord_reader.git
```

~~2. 直下のファイルをそれぞれの役割のコンピュータに移動させる．~~
クローンされるファイルは以下の３種である．

- /AKARI → バーコードを読み取る AKARI
- /resister → 読み取った情報を画面に表示するコンピュータ
- /db → 商品情報を保存するデータベース用のコンピュータ

2. 仮想環境の作成(/AKARI,/db を実行するコンピュータにて，初回のみ)

```bash
python3 -m venv venv
```

```bash
. venv/bin/activate
```

```bash
pip install -r requirements.txt
```

3. node.js のインストール

[node.js の公式サイト](https://nodejs.org/ja/)にアクセスし，手順に沿って node.js および npm のインストールを行う．
正常にインストールが完了したかを確認するため，任意のディレクトリ下で

```bash
npx create-next-app@latest my-next-app
cd my-next-app
npm install
npm run dev
```

を実行する．ブラウザで http://localhost:3000 にアクセスし，Next.js プロジェクトが正常に動作しているかを確認する．

3. node_module のインストール
   カレントディレクトリが/resister である状態で，以下のコマンドを実行する．

```bash
npm install
```

4. redis のインストール，実行(windows，Linux)

```bash
docker run --name my-redis -p 6379:6379 -d redis
```

5. redis のインストール，実行(Mac)

```bash
brew install redis
brew services start redis
```

6. データ送信先 url の書き換え
   /AKARI/main.py の 12 行目を resister を実行するコンピュータの IP アドレスをホスト部に持つ url に書き換えてください．
   また，/resister/.env.local の NEXT_PUBLIC_DB_WS_URL の値を，db を実行するコンピュータの IP アドレスをホスト部に持つ url に書き換えてください．

7. バーコードの登録
   /db/db.py を実行し，バーコード(13 桁)，商品名，商品の値段を登録してください．プログラムを終了する際は，"exit"と入力してください

## 起動方法

### /AKARI

1.仮想環境の有効化を行う．

```bash
.venv/bin/activate
```

2.開始する．

```bash
python3 main.py
```

3.終了する．
cont + c,cont + q を押して終了する．

## 使い方

1. 各プログラム(AKARI,db,resister)を起動後，登録したバーコードを AKARI のカメラに写す．
2. AKARI がバーコードの読み取りに成功した時，resister を実行しているコンピュータが表示している画面に，商品の名前，値段，個数が表示される．
3. それまでに読み取られた商品の値段，個数を元に合計金額が表示される．

## その他

このアプリケーションは愛知工業大学 情報科学部 知的制御研究室により作成されたものです。
