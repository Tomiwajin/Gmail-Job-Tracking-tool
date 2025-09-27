"use client";

import { useState, useEffect } from "react";
import { useExcludedEmails } from "@/hooks/useExcludedEmails";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User, Mail, Trash2, Plus, Shield } from "lucide-react";

export default function AccountPage() {
  const {
    excludedEmails,
    loading,
    error,
    addExcludedEmail,
    removeExcludedEmail,
  } = useExcludedEmails();

  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [newExcludedEmail, setNewExcludedEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

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
    } else {
      setEmailError("Failed to save email exclusion");
    }
  };

  // Remove excluded email
  const handleRemoveExcludedEmail = async (emailToRemove: string) => {
    await removeExcludedEmail(emailToRemove);
  };

  const handleGmailDisconnect = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        setIsGmailConnected(false);
        setUserEmail("");
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to disconnect Gmail:", error);
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

  // Check Gmail authentication status
  useEffect(() => {
    const checkGmailAuth = async () => {
      try {
        setLoadingAuth(true);
        const response = await fetch("/api/auth/status");
        const { isAuthenticated, email } = await response.json();
        setIsGmailConnected(isAuthenticated);
        setUserEmail(email || "");
      } catch (error) {
        console.error("Failed to check auth status:", error);
      } finally {
        setLoadingAuth(false);
      }
    };
    checkGmailAuth();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b w-screen md:w-full">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">My Account</h1>
        </div>
      </div>

      <div className="flex-1 p-4 mx-auto w-full">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="gmail" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Gmail</span>
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Advance Filtering</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Manage your account profile and personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userEmail}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      This is your Gmail account email address.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gmail" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  Gmail Integration
                </CardTitle>
                <CardDescription className="text-sm">
                  Connect your Gmail account to track job application updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {loadingAuth ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-pulse text-sm">
                      Loading Gmail status...
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-3 sm:p-4">
                      <div className="space-y-3 sm:space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span className="font-medium text-sm sm:text-base">
                                Gmail Account
                              </span>
                              {isGmailConnected ? (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-800 text-xs"
                                >
                                  Connected
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-red-100 text-red-800 text-xs"
                                >
                                  Not Connected
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {isGmailConnected
                                ? `Connected as ${userEmail}`
                                : "Connect your Gmail account to get started"}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {isGmailConnected ? (
                              <Button
                                variant="outline"
                                onClick={handleGmailDisconnect}
                                className="text-red-600 border-red-200 hover:bg-red-50 text-sm w-full sm:w-auto"
                              >
                                Disconnect
                              </Button>
                            ) : (
                              <Button
                                onClick={handleGmailLogin}
                                className="text-sm w-full sm:w-auto"
                              >
                                Connect Gmail
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isGmailConnected && (
                      <div className="border rounded-lg p-3 sm:p-4 bg-muted/50">
                        <div className="flex items-start gap-2">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-medium text-sm sm:text-base">
                              Privacy & Security
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              We only read email metadata and subject lines to
                              identify job application updates. Your email
                              content is never stored or shared.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Email Filters
                </CardTitle>
                <CardDescription>
                  Exclude specific emails or domains from being processed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter email address or @domain.com"
                        value={newExcludedEmail}
                        onChange={(e) => setNewExcludedEmail(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddExcludedEmail();
                          }
                        }}
                      />
                      {emailError && (
                        <p className="text-sm text-red-600 mt-1">
                          {emailError}
                        </p>
                      )}
                    </div>
                    <Button onClick={handleAddExcludedEmail} disabled={loading}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>Examples:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>
                        <code>noreply@company.com</code> - Exclude specific
                        email
                      </li>
                      <li>
                        <code>@linkedin.com</code> - Exclude entire domain
                      </li>
                      <li>
                        <code>newsletter</code> - Exclude emails containing this
                        term
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        Excluded Emails ({excludedEmails.length})
                      </h4>
                    </div>

                    {loading ? (
                      <div className="text-center py-4">
                        <div className="animate-pulse">
                          Loading excluded emails...
                        </div>
                      </div>
                    ) : excludedEmails.length > 0 ? (
                      <div className="grid gap-2">
                        {excludedEmails.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-mono">{email}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveExcludedEmail(email)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No excluded emails yet</p>
                        <p className="text-sm">
                          Add email patterns above to filter them out
                        </p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
