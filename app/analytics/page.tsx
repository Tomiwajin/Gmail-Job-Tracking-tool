"use client";

import { useApplicationStore } from "@/lib/useApplicationStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp, Users, MailX, Target } from "lucide-react";

export default function Analytics() {
  const applications = useApplicationStore((state) => state.applications);

  const statusCounts: Record<string, number> = {};
  const companyCounts: Record<string, number> = {};
  const monthlyCounts: Record<
    string,
    { applications: number; interviews: number; offers: number }
  > = {};

  for (const app of applications) {
    const status = app.status;
    const company = app.company || "Unknown";
    const month = new Date(app.date).toLocaleString("default", {
      month: "short",
    });

    statusCounts[status] = (statusCounts[status] || 0) + 1;
    companyCounts[company] = (companyCounts[company] || 0) + 1;

    if (!monthlyCounts[month]) {
      monthlyCounts[month] = { applications: 0, interviews: 0, offers: 0 };
    }

    monthlyCounts[month].applications++;
    if (status === "interview") monthlyCounts[month].interviews++;
    if (status === "offer") monthlyCounts[month].offers++;
  }

  const totalApplications = applications.length;
  const interviewRate = (
    ((statusCounts["interview"] || 0) / totalApplications) *
    100
  ).toFixed(1);
  const offerRate = (
    ((statusCounts["offer"] || 0) / totalApplications) *
    100
  ).toFixed(1);
  const rejectionRate = (
    ((statusCounts["rejected"] || 0) / totalApplications) *
    100
  ).toFixed(1);

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    color:
      {
        applied: "#3b82f6",
        interview: "#eab308",
        "next-phase": "#8b5cf6",
        offer: "#22c55e",
        rejected: "#ef4444",
        withdrawn: "#6b7280",
      }[name] || "#94a3b8",
  }));

  const companyData = Object.entries(companyCounts)
    .map(([company, applications]) => ({ company, applications }))
    .sort((a, b) => b.applications - a.applications)
    .slice(0, 8);

  const monthlyData = Object.entries(monthlyCounts)
    .map(([month, counts]) => ({ month, ...counts }))
    .sort(
      (a, b) =>
        new Date(`1 ${a.month} 2020`).getMonth() -
        new Date(`1 ${b.month} 2020`).getMonth()
    );

  const chartConfig = {
    applications: { label: "Applications", color: "#3b82f6" },
    interviews: { label: "Interviews", color: "#eab308" },
    offers: { label: "Offers", color: "#22c55e" },
  };

  if (applications.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="w-fit">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              No data available. Please visit the Dashboard to fetch analytics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <Link href="/">
          <Button variant="outline" size="sm" className="w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Insights into your job application journey
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {totalApplications}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Interview Rate
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {interviewRate}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offer Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{offerRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rejection Rate
            </CardTitle>
            <MailX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {rejectionRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Status Distribution
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              How applications are distributed by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-80">
              <ChartContainer
                config={Object.fromEntries(
                  statusData.map((s) => [s.name, { color: s.color }])
                )}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      nameKey="name"
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={(props) => <ChartTooltipContent {...props} />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Company Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Top Companies</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Companies with the most applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-80">
              <ChartContainer config={{}} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={companyData} margin={{ bottom: 20 }}>
                    <XAxis
                      dataKey="company"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                      interval={0}
                    />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Bar dataKey="applications" fill="#3b82f6" />
                    <ChartTooltip
                      content={(props) => <ChartTooltipContent {...props} />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Monthly Trends</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Applications, interviews, and offers over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-80">
            <ChartContainer config={chartConfig} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ bottom: 20 }}>
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke={chartConfig.applications.color}
                    name="Applications"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="interviews"
                    stroke={chartConfig.interviews.color}
                    name="Interviews"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="offers"
                    stroke={chartConfig.offers.color}
                    name="Offers"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <ChartTooltip
                    content={(props) => <ChartTooltipContent {...props} />}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
