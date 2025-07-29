// app/beta/page.jsx
"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function BetaInvitePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("Checking invite...");

  useEffect(() => {
    if (!token) {
      setStatus("No token provided.");
      return;
    }

    // Replace with actual Supabase check later
    setTimeout(() => {
      setStatus(`Welcome! Your invite token is valid: ${token}`);
    }, 1000);
  }, [token]);

  return (
    <div className="main-content">
      <h1>Beta Invite</h1>
      <p>{status}</p>
    </div>
  );
}
