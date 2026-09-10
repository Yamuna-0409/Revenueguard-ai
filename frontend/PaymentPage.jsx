import React, { useState } from "react";

function PaymentPage() {
  const [amount, setAmount] = useState("7500");
  const [status, setStatus] = useState("");

  const handlePayment = () => {
    setStatus("Opening payment checkout...");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>RevenueGuard Payment</h1>

      <div
        style={{
          maxWidth: "400px",
          padding: "25px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          marginTop: "25px",
        }}
      >
        <h2>Make Payment</h2>

        <label>Customer ID</label>

        <input
          type="text"
          value="CUS003"
          readOnly
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "8px",
            marginBottom: "20px",
          }}
        />

        <label>Amount</label>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "8px",
            marginBottom: "20px",
          }}
        />

        <button
          onClick={handlePayment}
          style={{
            width: "100%",
            padding: "12px",
            cursor: "pointer",
          }}
        >
          Pay ₹{amount}
        </button>

        {status && (
          <p style={{ marginTop: "20px" }}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

export default PaymentPage;