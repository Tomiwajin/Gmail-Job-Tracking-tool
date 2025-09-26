"use client";

import { useApplicationStore } from "@/lib/useApplicationStore";
import { useExcludedEmails } from "@/hooks/useExcludedEmails";
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
  Mail,
  ChevronDown,
  ArrowUp,
  X,
  Calendar1,
} from "lucide-react";
import { format, subDays, subMonths } from "date-fns";
import { SidebarTrigger } from "@/components/ui/sidebar";

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

// Helper function to check if email should be excluded
function shouldExcludeEmail(
  emailAddress: string,
  excludedEmails: string[]
): boolean {
  if (!excludedEmails || excludedEmails.length === 0) {
    return false;
  }

  const normalizedEmail = emailAddress.toLowerCase().trim();
  const extractedEmail =
    normalizedEmail.match(/<(.+)>/)?.[1] || normalizedEmail;

  return excludedEmails.some((excludedEmail) => {
    const normalizedExcluded = excludedEmail.toLowerCase().trim();

    if (extractedEmail === normalizedExcluded) {
      return true;
    }

    if (
      normalizedExcluded.startsWith("@") &&
      extractedEmail.endsWith(normalizedExcluded)
    ) {
      return true;
    }

    if (extractedEmail.includes(normalizedExcluded)) {
      return true;
    }

    return false;
  });
}

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

export default function HomePage() {
  const updates = useApplicationStore((state) => state.applications);
  const addApplications = useApplicationStore((state) => state.addApplications);
  const removeApplications = useApplicationStore(
    (state) => state.removeApplications
  );
  const startDate = useApplicationStore((state) => state.startDate);
  const endDate = useApplicationStore((state) => state.endDate);
  const setStartDate = useApplicationStore((state) => state.setStartDate);
  const setEndDate = useApplicationStore((state) => state.setEndDate);

  const {
    excludedEmails,
    loading: excludedEmailsLoading,
    error: excludedEmailsError,
    addExcludedEmail,
    removeExcludedEmail,
  } = useExcludedEmails();

  const [filteredApplications, setFilteredApplications] = useState<
    JobApplication[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [newExcludedEmail, setNewExcludedEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Add excluded email
  const handleAddExcludedEmail = async () => {
    const trimmedEmail = newExcludedEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError("Please enter an email address");
      return;
    }

    if (
      !validateEmail(trimmedEmail) &&
      !trimmedEmail.startsWith("@") &&
      trimmedEmail.length < 3
    ) {
      setEmailError("Please enter a valid email address or pattern");
      return;
    }

    if (excludedEmails.includes(trimmedEmail)) {
      setEmailError("This email is already in the exclusion list");
      return;
    }

    const success = await addExcludedEmail(trimmedEmail);
    if (success) {
      setNewExcludedEmail("");
      setEmailError(null);
      // Filter out existing updates that match the exclusion
      filterExistingApplications([...excludedEmails, trimmedEmail]);
    } else {
      setEmailError("Failed to save email exclusion");
    }
  };

  // Remove excluded email
  const handleRemoveExcludedEmail = async (emailToRemove: string) => {
    await removeExcludedEmail(emailToRemove);
  };

  // Filter existing updates based on excluded emails
  const filterExistingApplications = (excludedList: string[]) => {
    const updatesToRemove = updates.filter((app) =>
      shouldExcludeEmail(app.email, excludedList)
    );

    if (updatesToRemove.length > 0) {
      const idsToRemove = updatesToRemove.map((app) => app.id);
      removeApplications(idsToRemove);
      console.log(
        `Removed ${updatesToRemove.length} existing updates based on exclusion rules`
      );
    }
  };

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
    let filtered = updates;
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
  }, [updates, searchTerm, statusFilter, startDate, endDate]);

  // Clear selected preset when dates are manually changed
  useEffect(() => {
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
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch("/api/process-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          excludedEmails,
        }),
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

        if (result.excludedCount > 0) {
          console.log(
            `Processed ${result.processed} applications, excluded ${result.excludedCount} emails`
          );
        }
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
    <div className="flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b w-full">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Process Emails Button */}
          {isGmailConnected && (
            <Button
              onClick={handleProcessEmails}
              disabled={isProcessing}
              size="sm"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isProcessing ? "animate-spin" : ""}`}
              />
              {isProcessing ? "Processing..." : "Process Emails"}
            </Button>
          )}
          {/* Gmail Connection Button (fallback) */}
          {!isGmailConnected && (
            <Button onClick={handleGmailLogin} size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Connect Gmail
            </Button>
          )}
        </div>
      </div>

      {/* Date Presets and Range Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-b">
        {/* Date Presets Section */}
        <div className="flex flex-wrap gap-2">
          {datePresets.map((preset, index) => (
            <Button
              key={index}
              variant={
                selectedPreset === preset.label ? "secondary" : "outline"
              }
              size="sm"
              className="h-9 px-2 sm:px-4 text-xs sm:text-sm"
              onClick={() => handlePresetClick(preset)}
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-border"></div>
        <div className="sm:hidden w-full h-px bg-border"></div>

        {/* Date Range Section */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-1">
          <div className="flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {startDate ? format(startDate, "PPP") : "Pick start date"}
                  </span>
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

          <div className="flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {endDate ? format(endDate, "PPP") : "Pick end date"}
                  </span>
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

        {/* Form Error */}
        {formError && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
            {formError}
          </div>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 border-b">
        {/* Search Input */}
        <div className="flex-1">
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

        {/* Status Filter */}
        <div className="w-full sm:w-48">
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
      </div>

      {/* Applications Table Section */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Job updates ({filteredApplications.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            Track and manage your job application updates
          </p>
        </div>

        {/* Mobile card view for small screens */}
        <div className="block md:hidden space-y-3">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="p-3 shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base truncate">
                      {app.company}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {app.role}
                    </p>
                  </div>
                  <Badge
                    className={`${
                      statusColors[app.status]
                    } flex-shrink-0 text-xs`}
                  >
                    {app.status.replace("-", " ")}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <p
                    className="text-muted-foreground truncate"
                    title={app.email}
                  >
                    {app.email}
                  </p>
                  <p className="font-medium">
                    {format(app.date, "MMM dd, yyyy")}
                  </p>
                  <p
                    className="text-muted-foreground line-clamp-2 leading-relaxed text-xs"
                    title={app.subject}
                  >
                    {app.subject}
                  </p>
                </div>
              </div>
            </Card>
          ))}
          {filteredApplications.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="space-y-3">
                <p className="text-lg">No job updates found</p>
                <p className="text-sm">
                  {!isGmailConnected
                    ? "Connect Gmail to get started!"
                    : "Try adjusting your filters or processing more emails."}
                </p>
                {!isGmailConnected && (
                  <Button onClick={handleGmailLogin}>
                    <Mail className="w-4 h-4 mr-2" />
                    Connect Gmail
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop table view for md and above */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Company</TableHead>
                <TableHead className="w-[250px]">Role</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[200px]">Email</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Subject</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    <div className="truncate" title={app.company}>
                      {app.company}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="truncate" title={app.role}>
                      {app.role}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[app.status]}>
                      {app.status.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="truncate" title={app.email}>
                      {app.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(app.date, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={app.subject}>
                      {app.subject}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredApplications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="space-y-3 text-muted-foreground">
                      <p className="text-lg">No job updates found</p>
                      <p className="text-sm">
                        {!isGmailConnected
                          ? "Connect Gmail to get started!"
                          : "Try adjusting your filters or processing more emails."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

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
