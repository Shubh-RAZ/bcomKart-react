import React from "react";
export function DeliveryForm({ form, onChange, errors = {} }) {
  const fields = [
    ["fullName", "Full Name", "John Doe"],
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
          <div key={key} style={{ position: "relative" }}>
            <label className={key === "address" ? "field-wide" : ""}>
              <span>{label} {key !== "landmark" && <span style={{ color: "#d9534f" }}>*</span>}</span>
              <input 
                name={key} 
                value={form[key]} 
                onChange={onChange} 
                placeholder={placeholder} 
                required={key !== "landmark"} 
                style={{ borderColor: errors[key] ? "#d9534f" : undefined }}
              />
            </label>
            {errors[key] && (
              <div style={{ color: "#d9534f", fontSize: "12px", marginTop: "4px" }}>
                {errors[key]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

