import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut, Mail, RefreshCw, User, AlertTriangle } from "lucide-react";

interface AccountSettingsProps {
  userEmail: string;
  isGmailConnected: boolean;
  onDisconnect: () => void;
  onConnect: () => void;
}

export function AccountSettings({
  userEmail,
  isGmailConnected,
  onDisconnect,
  onConnect,
}: AccountSettingsProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        onDisconnect();
        // Optionally clear local storage or redirect
        window.location.reload();
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSwitchAccount = async () => {
    setIsLoggingOut(true);
    try {
      // First logout current user
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Then initiate new Gmail auth
        onConnect();
      }
    } catch (error) {
      console.error("Account switch error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Account Settings
        </CardTitle>
        <CardDescription>
          Manage your Gmail connection and account preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Account Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {isGmailConnected ? userEmail : "No account connected"}
              </p>
              <p className="text-sm text-muted-foreground">
                Gmail integration status
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          {isGmailConnected ? (
            <>
              {/* Switch Account Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Switch Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Switch Gmail Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will disconnect your current Gmail account (
                      {userEmail}) and redirect you to connect a different
                      account. Your current data will be preserved.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSwitchAccount}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Switching...
                        </>
                      ) : (
                        "Switch Account"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Disconnect Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect Gmail
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Disconnect Gmail Account
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will disconnect your Gmail account ({userEmail}) and
                      clear all authentication tokens. You&apos;ll need to
                      reconnect to process emails again.
                      <br />
                      <br />
                      <strong>Note:</strong> Your existing application data will
                      be preserved.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isLoggingOut ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        "Disconnect"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <Button onClick={onConnect} className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Connect Gmail Account
            </Button>
          )}
        </div>

        {/* Additional Info */}
        {isGmailConnected && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Privacy:</strong> We only access your Gmail data to
              process job-related emails. Your tokens are stored securely and
              can be revoked at any time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
