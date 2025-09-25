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
  BookOpen,
  UserCircleIcon,
  LogOut,
} from "lucide-react";
import { SiGmail } from "react-icons/si";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const mainMenuItems = [
  {
    title: "Job Updates",
    url: "/",
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
    url: "/tutorial",
    icon: BookOpen,
  },
];

const Appsidebar = () => {
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Check Gmail authentication status
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

    // Poll for auth status changes (check every 30 seconds)
    const interval = setInterval(checkGmailAuth, 30000);
    return () => clearInterval(interval);
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsGmailConnected(false);
      setUserEmail("");
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsGmailConnected(false);
      setUserEmail("");
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  // Bottom menu items based on connection status
  const bottomMenuItems = isGmailConnected
    ? [
        {
          title: "Disconnect Gmail",
          action: handleDisconnect,
          icon: SiGmail,
        },
        {
          title: "My Account",
          url: "/account",
          icon: UserCircleIcon,
        },
        {
          title: "Log out",
          action: handleLogout,
          icon: LogOut,
        },
      ]
    : [
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
        {/* Main Menu */}
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

        {/* Connection Status Indicator (when connected) */}
        {isGmailConnected && userEmail && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="mx-3 px-3 py-2 text-xs text-green-600 bg-green-50 rounded-md border border-green-200 group-data-[collapsible=icon]:mx-2 group-data-[collapsible=icon]:px-2">
                <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span
                    className="group-data-[collapsible=icon]:hidden truncate"
                    title={`Connected: ${userEmail}`}
                  >
                    Connected: {userEmail}
                  </span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Bottom Menu */}
        <SidebarGroup
          className={!isGmailConnected || !userEmail ? "mt-auto" : ""}
        >
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {bottomMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild={!!item.url}>
                    {item.url ? (
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    ) : (
                      <div
                        onClick={item.action}
                        className="w-full flex items-center"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </div>
                    )}
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
