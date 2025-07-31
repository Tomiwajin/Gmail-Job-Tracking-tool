"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Users, Calendar, Target } from "lucide-react";
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
import { fetchAnalytics } from "@/lib/fetchAnalytics";

export default function Analytics() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const past = new Date();
        past.setMonth(today.getMonth() - 6);
        const data = await fetchAnalytics(
          past.toISOString(),
          today.toISOString()
        );
        setApplications(data.applications);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading)
    return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Insights into your job application journey
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>
              How applications are distributed by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={Object.fromEntries(
                statusData.map((s) => [s.name, { color: s.color }])
              )}
            >
              <PieChart>
                <Pie
                  dataKey="value"
                  nameKey="name"
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={(props) => <ChartTooltipContent {...props} />}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Company Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Companies</CardTitle>
            <CardDescription>
              Companies with the most applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <BarChart data={companyData}>
                <XAxis dataKey="company" />
                <YAxis allowDecimals={false} />
                <Bar dataKey="applications" fill="#3b82f6" />
                <ChartTooltip
                  content={(props) => <ChartTooltipContent {...props} />}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>
            Applications, interviews, and offers over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Line
                type="monotone"
                dataKey="applications"
                stroke={chartConfig.applications.color}
                name="Applications"
              />
              <Line
                type="monotone"
                dataKey="interviews"
                stroke={chartConfig.interviews.color}
                name="Interviews"
              />
              <Line
                type="monotone"
                dataKey="offers"
                stroke={chartConfig.offers.color}
                name="Offers"
              />
              <ChartTooltip
                content={(props) => <ChartTooltipContent {...props} />}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
