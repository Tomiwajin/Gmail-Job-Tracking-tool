export async function fetchAnalytics(startDate: string, endDate: string) {
  const response = await fetch("/api/process-emails", {
    method: "POST",
    body: JSON.stringify({ startDate, endDate }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch analytics data");
  }

  return await response.json();
}
