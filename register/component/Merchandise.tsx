import React from "react";

export type merchandise = {
  id?: number; //商品ID
  name: string; //商品名
  price: number; //価格
  quantity?: number; //買数
};

const Merchandise = ({ name, price, quantity }: merchandise) => {
  return (
    <div className="flex justify-between items-center border-b py-2 px-4 text-sm">
      <span className="flex-1">{name}</span>
      <span className="w-20 text-right">{price}円</span>
      <span className="w-20 text-right">{quantity}個</span>
    </div>
  );
};

export default Merchandise;
