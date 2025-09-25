import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Briefcase,
  ChartLine,
  FolderUp,
  BookOpen,
  UserCircleIcon,
  LogOut,
} from "lucide-react";
import React from "react";
import Link from "next/link";

const items1 = [
  {
    title: "Job Updates",
    url: "/updates",
    icon: Briefcase,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: ChartLine,
  },
  {
    title: "Export",
    url: "/export",
    icon: FolderUp,
  },
  {
    title: "Tutorial",
    url: "tutorial",
    icon: BookOpen,
  },
];

const accountItems = [
  {
    title: "Connect Gmail",
    url: "/updates",
    icon: Briefcase,
  },
  {
    title: "My Account",
    url: "/analytics",
    icon: UserCircleIcon,
  },
  {
    title: "Sign in/Sign up",
    url: "/export",
    icon: UserCircleIcon,
  },
  {
    title: "Log out",
    url: "tutorial",
    icon: LogOut,
  },
];

const Appsidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="text-2xl font-extrabold">
        CareerSync
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="mt-6">
          <SidebarGroupContent>
            <SidebarMenu className="gap-6">
              {items1.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      {" "}
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-90">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      {" "}
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default Appsidebar;
