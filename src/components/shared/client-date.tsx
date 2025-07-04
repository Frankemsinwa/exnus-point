"use client";

import { useState, useEffect } from 'react';

export function ClientDate() {
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    // Set the date only on the client side after mounting
    setDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  // Return null on server and initial client render to avoid hydration mismatch
  return <>{date}</>;
}
