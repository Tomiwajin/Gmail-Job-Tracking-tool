"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Privacy() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit hover:bg-muted/50 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">
            How we handle your data and protect your privacy
          </p>
        </div>
      </div>

      <div className="prose prose-gray max-w-none">
        <div className="bg-muted/30 p-4 rounded-lg mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>

        <h2>Introduction</h2>
        <p>
          This Privacy Policy describes how Job Application Tracker collects,
          uses, and protects your information when you use our web application.
        </p>

        <h2>Information We Collect</h2>
        <h3>Google Account Information</h3>
        <p>When you connect your Gmail account, we collect:</p>
        <ul>
          <li>Your email address</li>
          <li>Basic profile information (name)</li>
          <li>Gmail messages that match job application criteria</li>
        </ul>

        <h3>Application Data</h3>
        <p>We process and store:</p>
        <ul>
          <li>Job application information extracted from your emails</li>
          <li>Company names and job titles</li>
          <li>Application dates and statuses</li>
          <li>Email subjects related to job applications</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use your information solely to:</p>
        <ul>
          <li>Parse your Gmail messages for job application-related content</li>
          <li>Track and organize your job applications</li>
          <li>Provide analytics about your job search progress</li>
          <li>Display your application data in our dashboard</li>
        </ul>

        <h2>Data Storage and Security</h2>
        <h3>Local Storage</h3>
        <ul>
          <li>
            All processed application data is stored locally in your browser
          </li>
          <li>We do not store your personal data on external servers</li>
          <li>
            Your Gmail access tokens are stored securely using HTTP-only cookies
          </li>
        </ul>

        <h3>Gmail Access</h3>
        <ul>
          <li>We only access emails that match job application keywords</li>
          <li>We do not store the full content of your emails</li>
          <li>Gmail access is read-only - we cannot send or modify emails</li>
        </ul>

        <h2>Third-Party Services</h2>
        <h3>Google Services</h3>
        <p>We use Google&apos;s Gmail API and OAuth services:</p>
        <ul>
          <li>Subject to Google&apos;s Privacy Policy</li>
          <li>Gmail access is granted through secure OAuth 2.0</li>
          <li>
            You can revoke access at any time through your Google Account
            settings
          </li>
        </ul>

        <h2>Your Rights and Choices</h2>
        <p>You can:</p>
        <ul>
          <li>
            Revoke Gmail access at any time through Google Account settings
          </li>
          <li>Clear all locally stored data by clearing browser storage</li>
          <li>Export your application data using our export feature</li>
          <li>Request deletion of any data we may have stored</li>
        </ul>

        <h2>Data Retention</h2>
        <ul>
          <li>Gmail access tokens expire automatically</li>
          <li>Local application data persists until you clear it</li>
          <li>We do not retain data after you revoke access</li>
        </ul>

        <h2>Children&apos;s Privacy</h2>
        <p>
          Our service is not intended for children under 13. We do not knowingly
          collect personal information from children under 13.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on this page and
          updating the &quot;Last Updated&quot; date.
        </p>

        <h2>Contact Information</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at:
        </p>
        <ul>
          <li>Email: jobstatustracker@gmail.com</li>
          <li>GitHub: https://github.com/Tomiwajin </li>
        </ul>

        <h2>Compliance</h2>
        <p>This privacy policy is designed to comply with:</p>
        <ul>
          <li>Google API Services User Data Policy</li>
          <li>General Data Protection Regulation (GDPR)</li>
          <li>California Consumer Privacy Act (CCPA)</li>
          <li>Other applicable privacy laws</li>
        </ul>
      </div>
    </div>
  );
}
