import sqlite3

DB_NAME = "merchandises.db"
TABLE_NAME = "products"

def initialize_db():
    conn = sqlite3.connect(DB_NAME)
    conn.execute(f"""
        CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price INTEGER NOT NULL
        );
    """)
    conn.commit()
    conn.close()

def insert_product(product_id, name, price):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    try:
        cursor.execute(f"INSERT INTO {TABLE_NAME} (id, name, price) VALUES (?, ?, ?);", (product_id, name, price))
        conn.commit()
        print("商品を追加しました")
    except sqlite3.IntegrityError:
        print("このIDは既に登録されています")
    finally:
        conn.close()

if __name__ == "__main__":
    initialize_db()
    while True:
        line = input("id,name,price を入力してください（終了は 'exit'）：\n")
        if line.strip().lower() == "exit":
            print("終了")
            break

        try:
            product_id, name, price_str = map(str.strip, line.split(","))
        except ValueError:
            print("形式が正しくありません。id,name,price をカンマ区切りで入力してください")
            continue

        if len(product_id) != 13:
            print("バーコードは13桁である必要があります")
            continue

        if not (product_id.isdecimal() and product_id.isascii()):
            print("IDは半角数字で入力してください")
            continue

        if not price_str.isdigit():
            print("価格は整数で入力してください")
            continue

        price = int(price_str)
        insert_product(product_id, name, price)
