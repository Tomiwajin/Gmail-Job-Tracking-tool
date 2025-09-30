"use client";

import { useApplicationStore } from "@/lib/useApplicationStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  TrendingUp,
  Users,
  MailX,
  Target,
  Calendar,
  Activity,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useMemo, useEffect, useState } from "react";

interface StatusCount {
  [key: string]: number;
}

const STATUS_COLORS = {
  applied: "#3b82f6",
  interview: "#eab308",
  "next-phase": "#8b5cf6",
  offer: "#22c55e",
  rejected: "#ef4444",
  withdrawn: "#6b7280",
} as const;

const CHART_CONFIG = {
  applications: { label: "Applications", color: "#3b82f6" },
  interviews: { label: "Interviews", color: "#eab308" },
  offers: { label: "Offers", color: "#22c55e" },
  rejections: { label: "Rejections", color: "#ef4444" },
};

export default function Analytics() {
  const applications = useApplicationStore((state) => state.applications);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const analytics = useMemo(() => {
    if (applications.length === 0) return null;

    const statusCounts: StatusCount = {};
    applications.forEach((app) => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace("-", " "),
      value,
      color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || "#94a3b8",
    }));

    const dates = applications.map((app) => new Date(app.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const daysDiff = Math.max(
      1,
      Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))
    );

    const totalApplications = applications.length;
    const appliedCount = statusCounts.applied || 0;
    const interviewCount = statusCounts.interview || 0;
    const offerCount = statusCounts.offer || 0;
    const rejectedCount = statusCounts.rejected || 0;

    const interviewRate =
      appliedCount > 0
        ? ((interviewCount / appliedCount) * 100).toFixed(1)
        : "0.0";
    const offerRate =
      appliedCount > 0 ? ((offerCount / appliedCount) * 100).toFixed(1) : "0.0";
    const rejectionRate =
      appliedCount > 0
        ? ((rejectedCount / appliedCount) * 100).toFixed(1)
        : "0.0";

    const avgPerDay = (totalApplications / daysDiff).toFixed(1);
    const avgPerWeek = (
      totalApplications / Math.max(1, Math.ceil(daysDiff / 7))
    ).toFixed(1);

    const activeApplications = applications.filter(
      (app) => !["rejected", "withdrawn", "offer"].includes(app.status)
    ).length;

    return {
      statusData,
      metrics: {
        totalApplications,
        interviewRate,
        offerRate,
        rejectionRate,
        avgPerDay,
        avgPerWeek,
        activeApplications,
      },
    };
  }, [applications]);

  if (applications.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between p-4 border-b w-full">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Analytics</h1>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center space-y-4">
          <Target className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-sm md:text-base">
            No data available. Start tracking your job applications to see
            analytics.
          </p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { statusData, metrics } = analytics;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between p-4 border-b w-full sticky top-0 bg-background z-10">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Analytics</h1>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-6 space-y-6 pb-8 max-w-full overflow-x-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalApplications}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.activeApplications} active
              </p>
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
              <div className="text-2xl font-bold">{metrics.interviewRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                From applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offer Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.offerRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                From applications
              </p>
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
              <div className="text-2xl font-bold">{metrics.rejectionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                From applications
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Per Day
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgPerDay}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Applications per day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Per Week
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgPerWeek}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Applications per week
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>
              Current status of all applications
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="h-[300px] sm:h-[350px] min-w-[280px]">
              <ChartContainer
                config={Object.fromEntries(
                  statusData.map((s) => [s.name, { color: s.color }])
                )}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      nameKey="name"
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? "50%" : "60%"}
                      label={
                        isMobile
                          ? false
                          : ({ name, value, percent }) =>
                              `${name}: ${value} (${(
                                (percent || 0) * 100
                              ).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || !payload.length) return null;
                        const data = payload[0];
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="font-semibold">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.value} applications
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: isMobile ? "12px" : "14px" }}
                      iconSize={isMobile ? 8 : 10}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
