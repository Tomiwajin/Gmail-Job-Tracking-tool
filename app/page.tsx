"use client";

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
import { CalendarIcon, Search, RefreshCw, BarChart3, Mail } from "lucide-react";
import { format } from "date-fns";
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

// Mock data - in real app this would come from email parsing
const mockApplications: JobApplication[] = [
  {
    id: "1",
    company: "Google",
    role: "Senior Software Engineer",
    status: "interview",
    email: "noreply@google.com",
    date: new Date("2024-01-15"),
    subject: "Thank you for your application - Next steps",
  },
  {
    id: "2",
    company: "Microsoft",
    role: "Frontend Developer",
    status: "applied",
    email: "careers@microsoft.com",
    date: new Date("2024-01-10"),
    subject: "Application received - Frontend Developer",
  },
  {
    id: "3",
    company: "Meta",
    role: "Full Stack Engineer",
    status: "rejected",
    email: "recruiting@meta.com",
    date: new Date("2024-01-08"),
    subject: "Update on your application",
  },
  {
    id: "4",
    company: "Apple",
    role: "iOS Developer",
    status: "next-phase",
    email: "talent@apple.com",
    date: new Date("2024-01-20"),
    subject: "Moving forward with your application",
  },
  {
    id: "5",
    company: "Netflix",
    role: "Backend Engineer",
    status: "offer",
    email: "jobs@netflix.com",
    date: new Date("2024-01-25"),
    subject: "Job offer - Backend Engineer position",
  },
];

const statusColors = {
  applied: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  interview: "bg-yellow-100 text-yellow-800",
  "next-phase": "bg-purple-100 text-purple-800",
  offer: "bg-green-100 text-green-800",
  withdrawn: "bg-gray-100 text-gray-800",
};

export default function Dashboard() {
  const [applications, setApplications] =
    useState<JobApplication[]>(mockApplications);
  const [filteredApplications, setFilteredApplications] =
    useState<JobApplication[]>(mockApplications);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [gmailAuthUrl, setGmailAuthUrl] = useState("");

  useEffect(() => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Date filter
    if (startDate) {
      filtered = filtered.filter((app) => app.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((app) => app.date <= endDate);
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, startDate, endDate]);

  const handleProcessEmails = async () => {
    if (!isGmailConnected) {
      // Redirect to Gmail OAuth
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
      if (result.success) {
        // Add new applications to the list
        setApplications((prev) => [...prev, ...result.applications]);
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
    // Check if user is already authenticated
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Application Tracker</h1>
          <p className="text-muted-foreground">
            Track and analyze your job applications from emails
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/analytics">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          {!isGmailConnected ? (
            <Button onClick={handleGmailLogin}>
              <Mail className="w-4 h-4 mr-2" />
              Connect Gmail
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600">
                ✓ Connected: {userEmail}
              </span>
              <Button onClick={handleProcessEmails} disabled={isProcessing}>
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

      {/* Email Processing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Email Processing Settings</CardTitle>
          <CardDescription>
            Configure date range for email parsing
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick start date"}
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
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal bg-transparent"
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
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
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
          <div className="w-48">
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
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Job Applications ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
    </div>
  );
}
