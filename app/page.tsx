"use client";

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState({ err: false, errMsg: "" });

  const handleApprove = (data, actions) => {
    // Capture the orderID when the payment is approved
    console.log(data, "data");
    setOrderId(data.orderID);
    console.log(actions, "actions");
    return actions.order.capture().then(function (details) {
      // Access additional details about the payment
      console.log(details, "details");
      setPaymentId(details.id);
      setPaymentStatus(details.status);
      // You can send these details to your server for further processing
    });
  };

  const handlePrice = (e: any) => {
    setAmount(e.target.value);
  };

  const checkPrice = () => {
    if (amount === "") {
      setError({ err: true, errMsg: "Please enter a valid amount" });
    }
    setError({ err: false, errMsg: "" });
  };

  const PayBtn = () => {
    const [{ isPending }] = usePayPalScriptReducer();
    return (
      <>
        {isPending ? (
          <p>Loading........</p>
        ) : (
          <PayPalButtons
            style={{ layout: "horizontal" }}
            // onClick={checkPrice}
            createOrder={(data, actions) => {
              console.log(data, "orderData");
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: amount,
                      currency_code: "USD",
                    },
                  },
                ],
              });
            }}
            onApprove={handleApprove}
          />
        )}
      </>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1 className="text-6xl text-yellow-100">Payment Gateway - Paypal</h1>

        <input
          type="text"
          value={amount}
          onChange={handlePrice}
          style={{
            background: "transparent",
            height: "50px",
            margin: "20px 0",
            border: "1px solid rgb(254 249 195)",
            padding: "1rem",
            width: "100%",
          }}
        />
        <PayPalScriptProvider
          options={
            {
              "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
              components: "buttons",
              currency: "USD",
              intent: "capture",
            } as any
          }
        >
          <PayBtn />
        </PayPalScriptProvider>
      </div>
    </main>
  );
}
