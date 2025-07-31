import ExcelJS from "exceljs";

export interface SpreadsheetData {
  company: string;
  role: string;
  status: string;
  email: string;
  date: string;
  subject: string;
  appliedDate?: string;
  lastUpdate?: string;
  notes?: string;
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
  notes?: string;
}

export class SpreadsheetExporter {
  static generateWorkbookData(applications: JobApplication[]): {
    headers: string[];
    data: string[][];
  } {
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

    const data = applications.map((app) => [
      app.company,
      app.role,
      app.status
        .split("-")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      app.email,
      new Date(app.date).toLocaleDateString(),
      app.subject,
      new Date(app.appliedDate || app.date).toLocaleDateString(),
      new Date(app.lastUpdate || Date.now()).toLocaleDateString(),
      app.notes || "",
    ]);

    return { headers, data: [headers, ...data] };
  }

  static generateAnalyticsWorkbook(applications: JobApplication[]) {
    const total = applications.length;
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summaryHeaders = ["Metric", "Count", "Percentage"];
    const summaryData = [
      summaryHeaders,
      ["Total Applications", total.toString(), "100%"],
      [
        "Applied",
        (statusCounts.applied || 0).toString(),
        `${(((statusCounts.applied || 0) / total) * 100).toFixed(1)}%`,
      ],
      [
        "Interview",
        (statusCounts.interview || 0).toString(),
        `${(((statusCounts.interview || 0) / total) * 100).toFixed(1)}%`,
      ],
      [
        "Next Phase",
        (statusCounts["next-phase"] || 0).toString(),
        `${(((statusCounts["next-phase"] || 0) / total) * 100).toFixed(1)}%`,
      ],
      [
        "Offers",
        (statusCounts.offer || 0).toString(),
        `${(((statusCounts.offer || 0) / total) * 100).toFixed(1)}%`,
      ],
      [
        "Rejected",
        (statusCounts.rejected || 0).toString(),
        `${(((statusCounts.rejected || 0) / total) * 100).toFixed(1)}%`,
      ],
    ];

    const applicationsData = this.generateWorkbookData(applications);

    return {
      summary: summaryData,
      applications: applicationsData.data,
    };
  }

  static async downloadTrueExcelFile(
    applications: JobApplication[],
    filename = "job-applications.xlsx"
  ): Promise<void> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Job Applications");
      const { data } = this.generateWorkbookData(applications);

      worksheet.addRows(data);

      // Apply bold style to header row
      worksheet.getRow(1).font = { bold: true };

      const blob = await this.workbookToBlob(workbook);
      this.triggerDownload(blob, filename);
    } catch (error) {
      console.error("Failed to create Excel file:", error);
    }
  }

  static async downloadAnalyticsSpreadsheet(
    applications: JobApplication[],
    filename = "job-analytics.xlsx"
  ): Promise<void> {
    try {
      const analyticsData = this.generateAnalyticsWorkbook(applications);
      const workbook = new ExcelJS.Workbook();

      const summarySheet = workbook.addWorksheet("Summary");
      summarySheet.addRows(analyticsData.summary);
      summarySheet.getRow(1).font = { bold: true };

      const appSheet = workbook.addWorksheet("Applications");
      appSheet.addRows(analyticsData.applications);
      appSheet.getRow(1).font = { bold: true };

      const blob = await this.workbookToBlob(workbook);
      this.triggerDownload(blob, filename);
    } catch (error) {
      console.error("Failed to create analytics Excel file:", error);
    }
  }

  private static async workbookToBlob(
    workbook: ExcelJS.Workbook
  ): Promise<Blob> {
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  private static triggerDownload(blob: Blob, filename: string) {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
