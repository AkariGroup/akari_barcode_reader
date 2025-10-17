import React from "react";
import Merchandise, { merchandise } from "./Merchandise";

const MerchandisesList = (merchandises: merchandise[]) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">商品リスト</h3>
      {merchandises.length === 0 ? (
        <p className="text-gray-500 text-center">商品を読み取ってください</p>
      ) : (
        <div className="space-y-2">
          {merchandises.map((item, index) => (
            <Merchandise
              key={index}
              name={item.name}
              price={item.price}
              quantity={item.quantity}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MerchandisesList;
