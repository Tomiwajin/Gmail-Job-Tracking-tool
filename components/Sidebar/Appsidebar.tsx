"use client";

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
  UserCircleIcon,
  RefreshCw,
  CircleQuestionMark,
  Moon,
  Sun,
} from "lucide-react";
import { SiGmail } from "react-icons/si";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const mainMenuItems = [
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
    title: "FAQ",
    url: "/faq",
    icon: CircleQuestionMark,
  },
];

const Appsidebar = () => {
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const checkGmailAuth = async () => {
      try {
        const response = await fetch("/api/auth/status");
        const { isAuthenticated, email } = await response.json();
        setIsGmailConnected(isAuthenticated);
        setUserEmail(email || "");
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setIsGmailConnected(false);
      }
    };

    checkGmailAuth();

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle(
        "light",
        savedTheme === "light"
      );
    }
  }, []);

  const handleGmailConnect = async () => {
    try {
      const response = await fetch("/api/auth/gmail");
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to initiate Gmail login:", error);
    }
  };

  const handleSwitchAccount = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (response.ok) {
        const authResponse = await fetch("/api/auth/gmail");
        const { authUrl } = await authResponse.json();
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error("Failed to switch account:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsGmailConnected(false);
      setUserEmail("");
      window.location.reload();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  const bottomMenuItems = isGmailConnected
    ? [
        {
          title: theme === "dark" ? "Light Mode" : "Dark Mode",
          action: toggleTheme,
          icon: theme === "dark" ? Sun : Moon,
        },
        {
          title: "Switch Account",
          action: handleSwitchAccount,
          icon: RefreshCw,
        },
        {
          title: "My Account",
          url: "/account",
          icon: UserCircleIcon,
        },
        {
          title: "Disconnect",
          action: handleDisconnect,
          icon: SiGmail,
        },
      ]
    : [
        {
          title: theme === "dark" ? "Light Mode" : "Dark Mode",
          action: toggleTheme,
          icon: theme === "dark" ? Sun : Moon,
        },
        {
          title: "Connect Gmail",
          action: handleGmailConnect,
          icon: SiGmail,
        },
      ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:gap-0">
          <div className="flex items-center justify-center">
            <Image
              src="/favicon.ico"
              alt="App favicon"
              className="h-6 w-6 rounded-sm"
              width={24}
              height={24}
            />
          </div>
          <span className="text-xl font-extrabold group-data-[collapsible=icon]:hidden">
            CareerSync
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="mt-6">
          <SidebarGroupContent>
            <SidebarMenu className="gap-6">
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isGmailConnected && userEmail && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="mx-3 px-3 py-2 text-xs text-black bg-white rounded-md border border-green-200 group-data-[collapsible=icon]:mx-2 group-data-[collapsible=icon]:px-2">
                <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span
                    className="group-data-[collapsible=icon]:hidden"
                    title={`Connected: ${userEmail}`}
                  >
                    Connected: {userEmail}
                  </span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup
          className={
            !isGmailConnected || !userEmail ? "mt-auto mb-10" : "mb-10"
          }
        >
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {bottomMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.url ? (
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton onClick={item.action}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
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
