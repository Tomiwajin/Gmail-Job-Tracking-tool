import { useState, useEffect } from "react";

export function useExcludedEmails() {
  const [excludedEmails, setExcludedEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load excluded emails from database
  const loadExcludedEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/settings");

      if (response.ok) {
        const data = await response.json();
        setExcludedEmails(data.excluded_emails || []);
      } else if (response.status === 401) {
        // Not authenticated, use empty array
        setExcludedEmails([]);
      } else {
        console.error("Failed to load excluded emails:", response.statusText);
        setError("Failed to load settings");
      }
    } catch (err) {
      console.error("Error loading excluded emails:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // Save excluded emails to database
  const saveExcludedEmails = async (emails: string[]) => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ excluded_emails: emails }),
      });

      if (response.ok) {
        setExcludedEmails(emails);
        setError(null);
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save settings");
        return false;
      }
    } catch (err) {
      console.error("Error saving excluded emails:", err);
      setError("Failed to save settings");
      return false;
    }
  };

  // Add an email to the exclusion list
  const addExcludedEmail = async (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || excludedEmails.includes(trimmedEmail)) {
      return false;
    }

    const newList = [...excludedEmails, trimmedEmail];
    return await saveExcludedEmails(newList);
  };

  // Remove an email from the exclusion list
  const removeExcludedEmail = async (email: string) => {
    const newList = excludedEmails.filter((e) => e !== email);
    return await saveExcludedEmails(newList);
  };

  // Load on mount
  useEffect(() => {
    loadExcludedEmails();
  }, []);

  return {
    excludedEmails,
    loading,
    error,
    addExcludedEmail,
    removeExcludedEmail,
    saveExcludedEmails,
    reload: loadExcludedEmails,
  };
}
