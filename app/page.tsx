"use client";
import { ExportButton } from "@/components/export-button";
import { useApplicationStore } from "@/lib/useApplicationStore";
import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarIcon,
  Search,
  RefreshCw,
  BarChart3,
  Mail,
  ChevronDown,
  ArrowUp,
} from "lucide-react";
import { format, subDays, subMonths } from "date-fns";
import Link from "next/link";

interface JobApplication {
  id: string;
  company: string;
  role: string;
  status:
    | "applied"
    | "rejected"
    | "interview"
    | "next-phase"
    | "offer"
    | "withdrawn";
  email: string;
  date: Date;
  subject: string;
}

interface ProcessedApplication {
  id: string;
  company: string;
  role: string;
  status: string;
  email: string;
  date: string;
  subject: string;
}

interface DatePreset {
  label: string;
  getValue: () => {
    start: Date;
    end: Date;
  };
}

const statusColors = {
  applied: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  interview: "bg-yellow-100 text-yellow-800",
  "next-phase": "bg-purple-100 text-purple-800",
  offer: "bg-green-100 text-green-800",
  withdrawn: "bg-gray-100 text-gray-800",
};

export default function Dashboard() {
  const applications = useApplicationStore((state) => state.applications);
  const addApplications = useApplicationStore((state) => state.addApplications);
  const startDate = useApplicationStore((state) => state.startDate);
  const endDate = useApplicationStore((state) => state.endDate);
  const setStartDate = useApplicationStore((state) => state.setStartDate);
  const setEndDate = useApplicationStore((state) => state.setEndDate);

  const [filteredApplications, setFilteredApplications] = useState<
    JobApplication[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [gmailAuthUrl, setGmailAuthUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Date range presets
  const datePresets: DatePreset[] = [
    {
      label: "Last 7 days",
      getValue: () => ({
        start: subDays(new Date(), 6),
        end: new Date(),
      }),
    },
    {
      label: "Last 30 days",
      getValue: () => ({
        start: subDays(new Date(), 29),
        end: new Date(),
      }),
    },
    {
      label: "Last 3 months",
      getValue: () => ({
        start: subMonths(new Date(), 3),
        end: new Date(),
      }),
    },
    {
      label: "Last 6 months",
      getValue: () => ({
        start: subMonths(new Date(), 6),
        end: new Date(),
      }),
    },
  ];

  const handlePresetClick = (preset: DatePreset) => {
    const { start, end } = preset.getValue();
    setStartDate(start);
    setEndDate(end);
    setFormError(null);
    setSelectedPreset(preset.label);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let filtered = applications;
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }
    if (startDate) {
      filtered = filtered.filter((app) => app.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((app) => app.date <= endDate);
    }
    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, startDate, endDate]);

  // Clear selected preset when dates are manually changed
  useEffect(() => {
    // Check if current dates match any preset
    const matchingPreset = datePresets.find((preset) => {
      const { start, end } = preset.getValue();
      return (
        startDate &&
        endDate &&
        startDate.toDateString() === start.toDateString() &&
        endDate.toDateString() === end.toDateString()
      );
    });

    if (!matchingPreset) {
      setSelectedPreset(null);
    }
  }, [startDate, endDate]);

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProcessEmails = async () => {
    if (!startDate || !endDate) {
      setFormError("Please select a valid start and end date.");
      return;
    }
    setFormError(null);
    if (!isGmailConnected) {
      window.location.href = gmailAuthUrl;
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch("/api/process-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });
      const result = await response.json();
      if (result.success && Array.isArray(result.applications)) {
        const newAppsWithDateObjects = result.applications.map(
          (app: ProcessedApplication) => ({
            ...app,
            date: new Date(app.date),
          })
        );
        addApplications(newAppsWithDateObjects);
      }
    } catch (error) {
      console.error("Failed to process emails:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGmailLogin = async () => {
    try {
      const response = await fetch("/api/auth/gmail");
      const { authUrl } = await response.json();
      setGmailAuthUrl(authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to initiate Gmail login:", error);
    }
  };

  useEffect(() => {
    const checkGmailAuth = async () => {
      try {
        const response = await fetch("/api/auth/status");
        const { isAuthenticated, email } = await response.json();
        setIsGmailConnected(isAuthenticated);
        setUserEmail(email || "");
      } catch (error) {
        console.error("Failed to check auth status:", error);
      }
    };
    checkGmailAuth();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Page header and Gmail actions */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Job Application Tracker
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Track and analyze your job applications from emails
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 md:gap-2">
          <ExportButton
            applications={applications}
            filteredApplications={filteredApplications}
          />
          <Link href="/analytics">
            <Button variant="outline" className="w-full sm:w-auto">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          {!isGmailConnected ? (
            <Button onClick={handleGmailLogin} className="w-full sm:w-auto">
              <Mail className="w-4 h-4 mr-2" />
              Connect Gmail
            </Button>
          ) : (
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
              <span className="text-xs sm:text-sm text-green-600 text-center sm:text-left">
                ✓ Connected: {userEmail}
              </span>
              <Button
                onClick={handleProcessEmails}
                disabled={isProcessing}
                className="w-full sm:w-auto"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isProcessing ? "animate-spin" : ""
                  }`}
                />
                {isProcessing ? "Processing..." : "Process Emails"}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Email Processing Settings
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Configure date range for email parsing
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Date Range Presets */}
          <div className="space-y-3">
            <Label>Select Date Range</Label>
            <div className="flex flex-wrap gap-2">
              {datePresets.map((preset, index) => (
                <Button
                  key={index}
                  variant={
                    selectedPreset === preset.label ? "secondary" : "outline"
                  }
                  size="sm"
                  className="h-9 px-4"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Settings - Collapsible */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 font-normal justify-start"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <ChevronDown
                className={`mr-2 h-4 w-4 transition-transform ${
                  showAdvanced ? "rotate-180" : ""
                }`}
              />
              Advanced settings
            </Button>

            {showAdvanced && (
              <div className="space-y-4 pl-6 border-l-2 border-border">
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 md:gap-4 md:items-end">
                  <div className="space-y-2 flex-1">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full sm:w-[220px] justify-start text-left font-normal bg-transparent"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate
                            ? format(startDate, "PPP")
                            : "Pick start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full sm:w-[220px] justify-start text-left font-normal bg-transparent"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {/* Future filtering settings will be added here */}
                <div className="text-sm text-muted-foreground">
                  Additional filtering options will be available here in the
                  future.
                </div>
              </div>
            )}
          </div>

          {formError && (
            <p className="text-sm text-red-600 mt-1">{formError}</p>
          )}
        </CardContent>
      </Card>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by company, role, or email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="next-phase">Next Phase</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Job Applications ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile card view for small screens */}
          <div className="block md:hidden space-y-4">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-base">{app.company}</h3>
                      <p className="text-sm text-muted-foreground">
                        {app.role}
                      </p>
                    </div>
                    <Badge className={statusColors[app.status]}>
                      {app.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{app.email}</p>
                    <p className="text-sm font-medium">
                      {format(app.date, "MMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {app.subject}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            {filteredApplications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No applications found matching your filters.
              </div>
            )}
          </div>

          {/* Desktop table view for md and above */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.company}</TableCell>
                    <TableCell>{app.role}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[app.status]}>
                        {app.status.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {app.email}
                    </TableCell>
                    <TableCell>{format(app.date, "MMM dd, yyyy")}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {app.subject}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-shadow duration-300"
          size="icon"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
