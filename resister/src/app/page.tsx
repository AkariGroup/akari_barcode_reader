"use client";
import { useEffect, useRef, useState } from "react";
import Merchandise, { merchandise } from "../../component/Merchandise";
import { openDBws } from "../../utils/dbws";
import ReconnectingWebSocket from "reconnecting-websocket";

export default function Home() {
  const dbws = useRef<ReconnectingWebSocket | null>(null); //商品db通信用webSocket
  const [merchandises, setMerchandises] = useState<merchandise[]>([]); //dbから取得した商品情報
  const [cashiers, setCashiers] = useState<number>(0); //レジ情報

  //初回実行
  useEffect(() => {
    dbws.current = openDBws(setMerchandises);
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const barcode = data.barcode;
      // WebSocketが接続中ならバーコード情報を送信
      if (dbws.current && dbws.current.readyState === WebSocket.OPEN) {
        dbws.current.send(JSON.stringify({ type: "scan", id: barcode }));
      }
    };
    eventSource.onerror = (err) => console.error("EventSource failed:", err);
    return () => eventSource.close();
  }, []);

  useEffect(() => {
    let tmpCashiers = 0;
    merchandises.forEach((merchandise) => {
      tmpCashiers += merchandise.price * (merchandise.quantity || 0);
    });
    setCashiers(tmpCashiers);
  }, [merchandises]);

  return (
    <div>
      <h1>AKARI Barcord Reader</h1>
      <div className="flex justify-between items-center border-b py-2 px-4 text-sm">
        <span className="flex-1">商品名</span>
        <span className="w-20 text-right">価格</span>
        <span className="w-20 text-right">個数</span>
      </div>
      <div>
        {merchandises.map(
          (merchandise) =>
            merchandise.quantity && (
              <div key={merchandise.id}>
                <Merchandise
                  id={merchandise.id}
                  name={merchandise.name}
                  price={merchandise.price}
                  quantity={merchandise.quantity}
                />
              </div>
            )
        )}
      </div>
      <h2>合計金額: {cashiers}円</h2>
    </div>
  );
}
