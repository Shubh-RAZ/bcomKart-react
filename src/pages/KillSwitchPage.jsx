import React, { useEffect, useState } from "react";
import { apiRequest } from "../context/AuthContext";
import { LoadingScreen } from "../components/common/LoadingScreen";
import { ShieldCheck, Power } from "lucide-react";

export function KillSwitchPage() {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/maintenance")
      .then(({ active: currentState }) => setActive(currentState))
      .catch((requestError) => setError(requestError.message || "Unable to load site lock status."))
      .finally(() => setLoading(false));
    return undefined;
  }, []);

  const toggleKillSwitch = async () => {
    setUpdating(true);
    setError("");
    try {
      const result = await apiRequest("/maintenance", {
        method: "PATCH",
        body: JSON.stringify({ active: !active })
      });
      setActive(result.active);
    } catch (requestError) {
      setError(requestError.message || "Unable to update site lock.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingScreen label="Loading site lock status" />;
  return (
    <div className="kill-switch-page">
      <div className="kill-switch-card">
        <span className="kill-switch-icon"><ShieldCheck size={28} /></span>
        <p className="eyebrow">Emergency controls</p>
        <h1>Global site lock</h1>
        <p className="kill-switch-copy">Control whether visitors can access Bcomkart. The under-construction page is shown to everyone while the lock is active.</p>
        <div className={`kill-switch-status ${active ? "active" : "inactive"}`}><i /> Site is {active ? "locked" : "live"}</div>
        <button className={`kill-switch-toggle ${active ? "active" : ""}`} onClick={toggleKillSwitch} disabled={updating}>
          <Power size={17} /> {updating ? "Updating..." : active ? "Disable global lock" : "Enable global lock"}
        </button>
        {error && <p className="login-message" role="alert">{error}</p>}
      </div>
    </div>
  );
}
