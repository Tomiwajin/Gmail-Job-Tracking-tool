"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Terms() {
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
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">
            Terms and conditions for using Job Application Tracker
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

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Job Application Tracker (&quot;the
          Service&quot;), you accept and agree to be bound by the terms and
          provision of this agreement.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Job Application Tracker is a web application that helps users organize
          and track their job applications by parsing Gmail messages for
          job-related content and providing analytics and insights.
        </p>

        <h2>3. User Accounts and Gmail Integration</h2>
        <h3>3.1 Gmail Access</h3>
        <ul>
          <li>You must grant permission to access your Gmail account</li>
          <li>We only read emails that match job application criteria</li>
          <li>
            You can revoke access at any time through your Google Account
            settings
          </li>
          <li>We do not send, delete, or modify your emails</li>
        </ul>

        <h3>3.2 Account Responsibility</h3>
        <ul>
          <li>
            You are responsible for maintaining the security of your Google
            account
          </li>
          <li>
            You agree to use the Service in compliance with Google&apos;s Terms
            of Service
          </li>
        </ul>

        <h2>4. Acceptable Use</h2>
        <p>
          You agree to use the Service only for lawful purposes and in
          accordance with these Terms. You agree NOT to:
        </p>
        <ul>
          <li>Violate any applicable laws or regulations</li>
          <li>
            Attempt to gain unauthorized access to the Service or other
            users&apos; accounts
          </li>
          <li>Interfere with or disrupt the Service or servers</li>
          <li>
            Use the Service for any commercial purpose without authorization
          </li>
          <li>Reverse engineer or attempt to extract source code</li>
        </ul>

        <h2>5. Data and Privacy</h2>
        <ul>
          <li>Your data is processed according to our Privacy Policy</li>
          <li>Application data is stored locally in your browser</li>
          <li>
            We do not sell or share your personal information with third parties
          </li>
          <li>You retain ownership of your data</li>
        </ul>

        <h2>6. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are
          and will remain the exclusive property of Job Application Tracker and
          its licensors. The Service is protected by copyright, trademark, and
          other laws.
        </p>

        <h2>7. Disclaimer of Warranties</h2>
        <p>
          The Service is provided on an &quot;AS IS&quot; and &quot;AS
          AVAILABLE&quot; basis. We make no representations or warranties of any
          kind, express or implied, including but not limited to:
        </p>
        <ul>
          <li>
            The accuracy or completeness of job application data extraction
          </li>
          <li>Uninterrupted or error-free operation</li>
          <li>Security of data transmission</li>
          <li>Compatibility with all email formats or providers</li>
        </ul>

        <h2>8. Limitation of Liability</h2>
        <p>
          In no event shall Job Application Tracker be liable for any indirect,
          incidental, special, consequential, or punitive damages, including
          without limitation, loss of profits, data, use, goodwill, or other
          intangible losses.
        </p>

        <h2>9. Third-Party Services</h2>
        <p>The Service integrates with Google Gmail API and is subject to:</p>
        <ul>
          <li>Google&apos;s Terms of Service</li>
          <li>Google API Services User Data Policy</li>
          <li>
            Changes in Google&apos;s API or policies may affect Service
            functionality
          </li>
        </ul>

        <h2>10. Service Availability</h2>
        <ul>
          <li>We do not guarantee uninterrupted availability of the Service</li>
          <li>We may suspend or terminate the Service at any time</li>
          <li>
            We may perform maintenance that temporarily affects Service
            availability
          </li>
        </ul>

        <h2>11. User-Generated Content</h2>
        <p>
          While the Service extracts data from your emails, you retain all
          rights to your data. By using the Service, you grant us a limited
          license to process your email data solely for the purpose of providing
          the Service.
        </p>

        <h2>12. Termination</h2>
        <p>You may terminate your use of the Service at any time by:</p>
        <ul>
          <li>Revoking Gmail access through your Google Account</li>
          <li>Clearing your browser data</li>
          <li>Ceasing to use the Service</li>
        </ul>

        <p>
          We may terminate or suspend your access to the Service immediately,
          without prior notice, if you breach these Terms.
        </p>

        <h2>13. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify
          users of any changes by posting the new Terms on this page and
          updating the &quot;Last Updated&quot; date.
        </p>

        <h2>14. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of [Your State/Country], without regard to its conflict of law
          provisions.
        </p>

        <h2>15. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact
          us at:
        </p>
        <ul>
          <li>Email: your-email@example.com</li>
          <li>GitHub: your-github-profile (if open source)</li>
        </ul>

        <h2>16. Severability</h2>
        <p>
          If any provision of these Terms is held to be unenforceable or
          invalid, such provision will be changed and interpreted to accomplish
          the objectives of such provision to the greatest extent possible under
          applicable law, and the remaining provisions will continue in full
          force and effect.
        </p>

        <div className="bg-muted/20 p-4 rounded-lg mt-8">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This is a free, open-source tool designed to
            help job seekers organize their applications. We are committed to
            protecting your privacy and providing a useful service.
          </p>
        </div>
      </div>
    </div>
  );
}
