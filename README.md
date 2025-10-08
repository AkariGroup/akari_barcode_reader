# akari_barcode_reader

AKARI のカメラを用いたバーコードリーダ

## 概要

- 13 桁のバーコード(JAN)コードを AKARI のカメラに写し，読み取らせる．
- 読み取った内容をデータベースに照会し，登録されたデータを画面上に表示する．

## セットアップ手順

このアプリケーションでは，バーコードを読み取る AKARI，読み取った商品情報を表示するコンピュータ，商品情報を格納するデータベース用のコンピュータを用意する．なお，1 台の AKARI,コンピュータが複数の機能を担当することも可能である．

1. 各役割のコンピュータにクローンする．

```bash

git clone https://github.com/AkariGroup/akari_barcode_reader.git

```

クローンしたリポジトリには、以下の 3 つのディレクトリが含まれる．各ディレクトリを対応するコンピュータまたは AKARI の作業したい場所へ配置する．

/AKARI → バーコードを読み取る AKARI
/register → 読み取った情報を画面に表示するコンピュータ
/db → 商品情報を保存するデータベース用のコンピュータ

2. 仮想環境の作成(/AKARI,/db を実行するコンピュータにて，初回のみ)

```bash

python3 -m venv venv

.venv/bin/activate

pip install -r requirements.txt

```

/AKARI のみ以下のコマンドを実行する．

```
sudo apt-get install libzbar0
```

3. docker のインストール

### windows の場合

docker for windows をインストールする．PowerShell を管理者として開き，以下のコマンドを実行する．

```
wsl --install
```

その後，[docker の公式サイト](https://www.docker.com/)からインストーラをインストールし，インストーラの指示に沿って docker for desktop をインストールする．

### mac の場合

[docker の公式サイト](https://www.docker.com/)からインストーラをインストールし，開く．
その後，docker for desktop を Application フォルダに移動する．

### Ubuntu,Demian の場合

以下のコマンドを実行する．

```
sudo apt update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

4. node.js のインストール
   [node.js の公式サイト](https://nodejs.org/ja/)にアクセスし，手順に沿って node.js および npm のインストールを行う．
   正常にインストールが完了したかを確認するため，任意のディレクトリ下で以下のコマンドを実行する．

```bash
npx create-next-app@latest my-next-app
cd my-next-app
npm install
npm run dev
```

ブラウザで http://localhost:3000 にアクセスし，Next.js プロジェクトが正常に動作しているかを確認する．

5. node_modules のインストール

カレントディレクトリが/register である状態で，以下のコマンドを実行する．

```bash
npm install
```

6. redis のインストール，実行

- windows，Linux の場合

```bash
sudo docker run --name my-redis -p 6379:6379 -d redis
```

- Mac の場合

```bash
brew install redis
brew services start redis
```

7. データ送信先 url の書き換え

/AKARI/main.py の 12 行目を register を実行するコンピュータの IP アドレスをホスト部に持つ url に書き換える．

8. バーコードの登録

データベースを担当するコンピュータの/db にて，db.py を実行する．

```
python db.py
```

標準出力の指示に従い，バーコード(13 桁)，商品名，商品の値段を登録する．プログラムを終了する際は，"exit"と入力する．

## 起動方法

### /AKARI

1. 仮想環境の有効化を行う．

```bash
.venv/bin/activate
```

2. 開始する．

```bash
python3 main.py
```

3. 終了する．
   ctrl + c,ctrl + q を押して終了する．

## 使い方

1. 各プログラム(AKARI,db,register)を起動後，登録したバーコードを AKARI のカメラに写す．
2. AKARI がバーコードの読み取りに成功した時，register を実行しているコンピュータが表示している画面に，商品の名前，値段，個数が表示される．
3. それまでに読み取られた商品の値段，個数を元に合計金額が表示される．

## その他

このアプリケーションは愛知工業大学 情報科学部 知的制御研究室により作成されたものです。
