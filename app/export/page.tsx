"use client";

import React, { useState } from "react";
import { useApplicationStore } from "@/lib/useApplicationStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, FileText, Table, Code } from "lucide-react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";

type ExportFormat = "csv" | "json" | "pdf";
type DateRange = "all" | "last30" | "last90" | "thisYear" | "lastYear";

export default function ExportPage() {
  const applications = useApplicationStore((state) => state.applications);
  const [fileName, setFileName] = useState("job-applications");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [selectedFields, setSelectedFields] = useState({
    company: true,
    position: true,
    status: true,
    date: true,
    location: false,
    salary: false,
    notes: false,
  });
  const [isExporting, setIsExporting] = useState(false);

  const getFilteredApplications = () => {
    const now = new Date();
    let filtered = applications;

    switch (dateRange) {
      case "last30":
        const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = applications.filter((app) => new Date(app.date) >= last30);
        break;
      case "last90":
        const last90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        filtered = applications.filter((app) => new Date(app.date) >= last90);
        break;
      case "thisYear":
        const thisYear = now.getFullYear();
        filtered = applications.filter(
          (app) => new Date(app.date).getFullYear() === thisYear
        );
        break;
      case "lastYear":
        const lastYear = now.getFullYear() - 1;
        filtered = applications.filter(
          (app) => new Date(app.date).getFullYear() === lastYear
        );
        break;
      default:
        filtered = applications;
    }

    return filtered;
  };

  const exportToCSV = (data: any[]) => {
    const headers = Object.keys(selectedFields)
      .filter((field) => selectedFields[field as keyof typeof selectedFields])
      .map((field) => field.charAt(0).toUpperCase() + field.slice(1));

    const csvContent = [
      headers.join(","),
      ...data.map((app) =>
        headers
          .map((header) => {
            const field = header.toLowerCase();
            let value = app[field] || "";
            // Escape quotes and wrap in quotes if contains comma
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: any[]) => {
    const filteredData = data.map((app) => {
      const filtered: any = {};
      Object.keys(selectedFields).forEach((field) => {
        if (selectedFields[field as keyof typeof selectedFields]) {
          filtered[field] = app[field];
        }
      });
      return filtered;
    });

    const jsonContent = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async (data: any[]) => {
    // Simple text-based PDF export (in a real app, you'd use a PDF library like jsPDF)
    const content = [
      `Job Applications Export - ${new Date().toLocaleDateString()}`,
      `Total Records: ${data.length}`,
      "",
      ...data.map((app, index) =>
        [
          `Application ${index + 1}:`,
          ...Object.keys(selectedFields)
            .filter(
              (field) => selectedFields[field as keyof typeof selectedFields]
            )
            .map(
              (field) =>
                `  ${field.charAt(0).toUpperCase() + field.slice(1)}: ${
                  app[field] || "N/A"
                }`
            ),
          "",
        ].join("\n")
      ),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const filteredData = getFilteredApplications();

    try {
      switch (exportFormat) {
        case "csv":
          exportToCSV(filteredData);
          break;
        case "json":
          exportToJSON(filteredData);
          break;
        case "pdf":
          await exportToPDF(filteredData);
          break;
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFieldChange = (field: keyof typeof selectedFields) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const filteredCount = getFilteredApplications().length;

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b w-full">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Export Data</h1>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Export Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                  File Settings
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Configure your export file preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter file name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select
                    value={exportFormat}
                    onValueChange={(value: ExportFormat) =>
                      setExportFormat(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">
                        <div className="flex items-center space-x-2">
                          <Table className="w-4 h-4" />
                          <span>CSV (Excel compatible)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="json">
                        <div className="flex items-center space-x-2">
                          <Code className="w-4 h-4" />
                          <span>JSON (Developer friendly)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pdf">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>Text File (Readable format)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select
                    value={dateRange}
                    onValueChange={(value: DateRange) => setDateRange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="last30">Last 30 Days</SelectItem>
                      <SelectItem value="last90">Last 90 Days</SelectItem>
                      <SelectItem value="thisYear">This Year</SelectItem>
                      <SelectItem value="lastYear">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Field Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                  Select Fields
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Choose which data fields to include in your export
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(selectedFields).map(([field, checked]) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={checked}
                        onCheckedChange={() =>
                          handleFieldChange(
                            field as keyof typeof selectedFields
                          )
                        }
                      />
                      <Label
                        htmlFor={field}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Export Preview
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Summary of your export settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Records:</span>
                  <span className="font-medium">{applications.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Filtered Records:
                  </span>
                  <span className="font-medium">{filteredCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Selected Fields:
                  </span>
                  <span className="font-medium">
                    {Object.values(selectedFields).filter(Boolean).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium uppercase">{exportFormat}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleExport}
                  disabled={isExporting || filteredCount === 0}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting
                    ? "Exporting..."
                    : `Export ${filteredCount} Records`}
                </Button>
              </div>

              {filteredCount === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  No records match the selected date range.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Export Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Export Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">CSV Format</h4>
                <p className="text-muted-foreground">
                  Best for spreadsheet applications like Excel, Google Sheets,
                  or data analysis tools.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">JSON Format</h4>
                <p className="text-muted-foreground">
                  Ideal for developers, data migration, or integration with
                  other applications.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Text Format</h4>
                <p className="text-muted-foreground">
                  Human-readable format that can be opened in any text editor or
                  printed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
