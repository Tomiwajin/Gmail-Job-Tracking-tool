export interface ExportData {
  company: string;
  role: string;
  status: string;
  email: string;
  date: string;
  subject: string;
  appliedDate?: string;
  lastUpdate?: string;
}

interface JobApplication {
  company: string;
  role: string;
  status: string;
  email: string;
  date: Date | string;
  subject: string;
  appliedDate?: Date | string;
  lastUpdate?: Date | string;
}

export class DataExporter {
  static convertToCSV(data: ExportData[]): string {
    if (data.length === 0) return "";

    // Define headers
    const headers = [
      "Company",
      "Job Role",
      "Status",
      "Email",
      "Date",
      "Subject",
      "Applied Date",
      "Last Update",
    ];

    // Convert data to CSV format
    const csvRows = [
      headers.join(","), // Header row
      ...data.map((row) =>
        [
          `"${row.company}"`,
          `"${row.role}"`,
          `"${row.status}"`,
          `"${row.email}"`,
          `"${row.date}"`,
          `"${row.subject}"`,
          `"${row.appliedDate || ""}"`,
          `"${row.lastUpdate || ""}"`,
        ].join(",")
      ),
    ];

    return csvRows.join("\n");
  }

  static downloadCSV(csvContent: string, filename = "job-applications.csv") {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  static convertToGoogleSheetsFormat(data: ExportData[]): string {
    // Add additional formatting for better Google Sheets compatibility
    const headers = [
      "Company",
      "Job Role",
      "Application Status",
      "Contact Email",
      "Email Date",
      "Email Subject",
      "Applied Date",
      "Last Updated",
      "Notes",
    ];

    const csvRows = [
      headers.join(","),
      ...data.map((row) => {
        // Format status for better readability
        const formattedStatus = row.status
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return [
          `"${row.company}"`,
          `"${row.role}"`,
          `"${formattedStatus}"`,
          `"${row.email}"`,
          `"${row.date}"`,
          `"${row.subject.replace(/"/g, '""')}"`, // Escape quotes in subject
          `"${row.appliedDate || ""}"`,
          `"${row.lastUpdate || new Date().toLocaleDateString()}"`,
          `""`, // Empty notes column for user to fill
        ].join(",");
      }),
    ];

    return csvRows.join("\n");
  }

  static generateAnalyticsCSV(applications: JobApplication[]): string {
    const headers = ["Metric", "Value", "Percentage"];
    const total = applications.length;

    const analyticsData = [
      ["Total Applications", total.toString(), "100%"],
      [
        "Applied Status",
        applications
          .filter((app) => app.status === "applied")
          .length.toString(),
        `${(
          (applications.filter((app) => app.status === "applied").length /
            total) *
          100
        ).toFixed(1)}%`,
      ],
      [
        "Interview Status",
        applications
          .filter((app) => app.status === "interview")
          .length.toString(),
        `${(
          (applications.filter((app) => app.status === "interview").length /
            total) *
          100
        ).toFixed(1)}%`,
      ],
      [
        "Next Phase",
        applications
          .filter((app) => app.status === "next-phase")
          .length.toString(),
        `${(
          (applications.filter((app) => app.status === "next-phase").length /
            total) *
          100
        ).toFixed(1)}%`,
      ],
      [
        "Offers",
        applications.filter((app) => app.status === "offer").length.toString(),
        `${(
          (applications.filter((app) => app.status === "offer").length /
            total) *
          100
        ).toFixed(1)}%`,
      ],
      [
        "Rejected",
        applications
          .filter((app) => app.status === "rejected")
          .length.toString(),
        `${(
          (applications.filter((app) => app.status === "rejected").length /
            total) *
          100
        ).toFixed(1)}%`,
      ],
    ];

    const csvRows = [
      headers.join(","),
      ...analyticsData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ];

    return csvRows.join("\n");
  }
}
