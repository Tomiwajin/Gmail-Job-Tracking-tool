"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, BarChart3, FileText } from "lucide-react";
import { SpreadsheetExporter } from "@/lib/spreadsheet-export";
import { DataExporter, type ExportData } from "@/lib/export-utils";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: string;
  email: string;
  date: Date | string;
  subject: string;
}

interface ExportButtonProps {
  applications: JobApplication[];
  filteredApplications?: JobApplication[];
  className?: string;
}

export function ExportButton({
  applications,
  filteredApplications,
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const exportData = filteredApplications || applications;

  const handleDownloadSpreadsheet = async () => {
    setIsExporting(true);
    try {
      const filename = `job-applications-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.xlsx`;
      await SpreadsheetExporter.downloadTrueExcelFile(exportData, filename);
      toast({
        title: "Spreadsheet Downloaded!",
        description: `Downloaded ${exportData.length} applications as Excel file`,
      });
    } catch (error) {
      console.error("Spreadsheet export failed:", error);
      toast({
        title: "Export Failed",
        description: "Failed to download spreadsheet file",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadAnalytics = async () => {
    setIsExporting(true);
    try {
      const filename = `job-analytics-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      SpreadsheetExporter.downloadAnalyticsSpreadsheet(exportData, filename);
      toast({
        title: "Analytics Spreadsheet Downloaded!",
        description: `Downloaded comprehensive analytics with ${exportData.length} applications`,
      });
    } catch (error) {
      console.error("Analytics export failed:", error);
      toast({
        title: "Export Failed",
        description: "Failed to download analytics spreadsheet",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const exportData: ExportData[] = (
        filteredApplications || applications
      ).map((app: JobApplication) => ({
        company: app.company,
        role: app.role,
        status: app.status,
        email: app.email,
        date: format(new Date(app.date), "yyyy-MM-dd"),
        subject: app.subject,
        appliedDate: format(new Date(app.date), "yyyy-MM-dd"),
        lastUpdate: format(new Date(), "yyyy-MM-dd"),
      }));

      const csvContent = DataExporter.convertToCSV(exportData);
      const filename = `job-applications-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.csv`;
      DataExporter.downloadCSV(csvContent, filename);
      toast({
        title: "CSV Downloaded!",
        description: `Downloaded ${exportData.length} applications as CSV file`,
      });
    } catch (error) {
      console.error("CSV export failed:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data as CSV",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (exportData.length === 0) {
    return (
      <Button variant="outline" disabled className={className}>
        <Download className="w-4 h-4 mr-2" />
        No Data to Export
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting} className={className}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : `Export (${exportData.length})`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={handleDownloadSpreadsheet}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          <div className="flex flex-col">
            <span>Download Spreadsheet</span>
            <span className="text-xs text-muted-foreground">
              Excel-compatible .xlsx file
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadAnalytics}>
          <BarChart3 className="w-4 h-4 mr-2" />
          <div className="flex flex-col">
            <span>Analytics Spreadsheet</span>
            <span className="text-xs text-muted-foreground">
              Summary + detailed data
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileText className="w-4 h-4 mr-2" />
          <div className="flex flex-col">
            <span>Download CSV</span>
            <span className="text-xs text-muted-foreground">
              Simple comma-separated file
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
