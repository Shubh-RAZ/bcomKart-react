import React from "react";
export function DeliveryForm({ form, onChange }) {
  const fields = [
    ["fullName", "Full Name", "Shubham Raj"],
    ["phone", "Phone Number", "9876543210"],
    ["address", "Address", "123, Main Road"],
    ["landmark", "Landmark (Optional)", "Near Forum Mall"],
    ["city", "City", "Bangalore"],
    ["state", "State", "Karnataka"],
    ["pincode", "Pincode", "560034"]
  ];

  return (
    <div className="delivery-form">
      <h3>Delivery Details</h3>
      <div className="form-grid">
        {fields.map(([key, label, placeholder]) => (
          <label key={key} className={key === "address" ? "field-wide" : ""}>
            <span>{label}</span>
            <input name={key} value={form[key]} onChange={onChange} placeholder={placeholder} required={key !== "landmark"} />
          </label>
        ))}
      </div>
    </div>
  );
}
