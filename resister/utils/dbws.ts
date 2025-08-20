import ReconnectingWebSocket from "reconnecting-websocket";
import { merchandise } from "../component/Merchandise";

export const openDBws = (setMerchandises:React.Dispatch<React.SetStateAction<merchandise[]>>)=>{
    //dbIWebSocketの初期化とイベントハンドラの設定
    const dbws = new ReconnectingWebSocket(process.env.NEXT_PUBLIC_DB_WS_URL!);

    dbws.addEventListener("open",() => console.log("Merchandise WebSocket connection opened"));
    dbws.addEventListener("error",(error)=>console.error("Merchandise WebSocket error:", error));
    dbws.addEventListener("close",()=>console.log("Merchandise WebSocket connection closed"));

    dbws.addEventListener("message",(event) =>{
      const data= JSON.parse(event.data);
      if (data.status === "error") {
        console.error(data.message);
        return;
      } else if (data.status === "ok") {

        const product = data.product as merchandise;
        setMerchandises((prevMerchandises:merchandise[]) => {
          // 既存の商品のインデックスを探す
          const existingIndex = prevMerchandises.findIndex(
            (item) => item.id === product.id
          );

          // 商品が既にリストに存在する場合
          if (existingIndex !== -1) {
          // mapを使って新しい配列を作成し、該当商品の数量だけを更新する
          return prevMerchandises.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: (item.quantity || 0) + 1 }
              : item
            );
          } else {
            // 新しい商品としてリストの末尾に追加する
            return [...prevMerchandises, { ...product, quantity: 1 }];
          }
        })
      }
    });
    return dbws;
}