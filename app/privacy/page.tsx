"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Shield,
  Eye,
  Database,
  Key,
  Users,
  FileText,
  Mail,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-white/80 shadow-sm border border-slate-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Privacy Policy
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We&apos;re committed to protecting your privacy and being
              transparent about how we handle your data
            </p>
          </div>
        </div>

        {/* Quick Info Card */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-blue-900">Key Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-blue-900">Effective Date:</strong>
                <br />
                <span className="text-blue-700">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div>
                <strong className="text-blue-900">Last Updated:</strong>
                <br />
                <span className="text-blue-700">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Desktop Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Contents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { id: "introduction", title: "Introduction", icon: FileText },
                  {
                    id: "data-collection",
                    title: "Data Collection",
                    icon: Database,
                  },
                  { id: "data-usage", title: "How We Use Data", icon: Eye },
                  { id: "security", title: "Security", icon: Key },
                  { id: "third-party", title: "Third Parties", icon: Users },
                  { id: "your-rights", title: "Your Rights", icon: Shield },
                  { id: "contact", title: "Contact", icon: Mail },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {item.title}
                    </a>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Introduction */}
            <section id="introduction">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-600" />
                    <CardTitle>Introduction</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed">
                    This Privacy Policy describes how Job Application Tracker
                    collects, uses, and protects your information when you use
                    our web application. We are committed to maintaining the
                    highest standards of data protection and transparency.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Data Collection */}
            <section id="data-collection">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-slate-600" />
                    <CardTitle>Information We Access and Store</CardTitle>
                  </div>
                  <CardDescription>
                    We access certain information to provide the service and
                    store minimal data for authentication and settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Accessed (Not Stored)
                      </h4>
                      <Badge
                        variant="secondary"
                        className="mb-3 bg-blue-100 text-blue-800"
                      >
                        Temporary Access Only
                      </Badge>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Gmail messages matching job criteria</li>
                        <li>• Email content for parsing</li>
                        <li>• Basic Google profile info</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Stored on Our Server
                      </h4>
                      <Badge
                        variant="secondary"
                        className="mb-3 bg-purple-100 text-purple-800"
                      >
                        Supabase Database
                      </Badge>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• Your email address</li>
                        <li>• Encrypted Gmail refresh token</li>
                        <li>• Your email exclusion settings</li>
                        <li>• Account creation/update dates</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Stored Locally
                      </h4>
                      <Badge
                        variant="secondary"
                        className="mb-3 bg-green-100 text-green-800"
                      >
                        In Your Browser Only
                      </Badge>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Extracted job application data</li>
                        <li>• Company names and job titles</li>
                        <li>• Application dates and statuses</li>
                        <li>• Brief email subjects</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-900 mb-1">
                          What We Don&apos;t Store
                        </h4>
                        <p className="text-sm text-amber-800">
                          We <strong>never store</strong> your email content,
                          full messages, or job application details on our
                          servers. Only minimal authentication and preference
                          data is stored in our secure database.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Data Usage */}
            <section id="data-usage">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-slate-600" />
                    <CardTitle>How We Process Your Information</CardTitle>
                  </div>
                  <CardDescription>
                    We only process your data to extract job application
                    insights - nothing is stored on our servers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3">
                      We process your Gmail data solely to:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Parse Gmail messages for job application keywords",
                        "Extract company names and job titles",
                        "Identify application statuses and dates",
                        "Create summaries stored locally in your browser",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-green-800">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">
                          Privacy by Design
                        </h4>
                        <p className="text-sm text-blue-800">
                          All processing happens in real-time. We don&apos;t
                          store your email content, and all extracted job data
                          is saved locally in your browser, not on our servers.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Security */}
            <section id="security">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-slate-600" />
                    <CardTitle>Data Storage and Security</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-purple-200 bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">
                        Server Storage
                      </h4>
                      <Badge variant="secondary" className="mb-2">
                        Supabase (Secure)
                      </Badge>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• Email address for account identification</li>
                        <li>• Encrypted Gmail refresh tokens</li>
                        <li>• User preference settings</li>
                        <li>• Hosted on secure cloud infrastructure</li>
                      </ul>
                    </div>

                    <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Local Storage
                      </h4>
                      <Badge variant="secondary" className="mb-2">
                        Browser Only
                      </Badge>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Job application data</li>
                        <li>• Analytics and insights</li>
                        <li>• Temporary access tokens</li>
                        <li>• You control this data completely</li>
                      </ul>
                    </div>

                    <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">
                        Gmail Access
                      </h4>
                      <Badge variant="secondary" className="mb-2">
                        Read Only
                      </Badge>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Only job-related emails accessed</li>
                        <li>• No email content stored</li>
                        <li>• Cannot send or modify emails</li>
                        <li>• Access revocable anytime</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Security Measures
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                      <div>
                        <strong>Encryption:</strong>
                        <ul className="mt-1 space-y-1">
                          <li>• Gmail refresh tokens encrypted at rest</li>
                          <li>• HTTPS for all data transmission</li>
                          <li>• Secure OAuth 2.0 authentication</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Data Protection:</strong>
                        <ul className="mt-1 space-y-1">
                          <li>• Minimal data collection principle</li>
                          <li>• No email content retention</li>
                          <li>• User-controlled local storage</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Third Party Services */}
            <section id="third-party">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-600" />
                    <CardTitle>Third-Party Services</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">
                      Google Services Integration
                    </h4>
                    <div className="space-y-2 text-sm text-orange-800">
                      <p>• Subject to Google&apos;s Privacy Policy</p>
                      <p>• Secure OAuth 2.0 authentication</p>
                      <p>• Revoke access anytime through Google settings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Your Rights */}
            <section id="your-rights">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-slate-600" />
                    <CardTitle>Your Rights and Choices</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-3">
                      You have full control over your data:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          title: "Revoke Gmail Access",
                          desc: "Disconnect through Google Account settings - stops all data processing",
                        },
                        {
                          title: "Clear Local Data",
                          desc: "Remove all job application data stored in your browser",
                        },
                        {
                          title: "Export Your Data",
                          desc: "Download your job application data anytime",
                        },
                        {
                          title: "Delete Account Data",
                          desc: "Request deletion of your email and settings from our database",
                        },
                        {
                          title: "Update Email Exclusions",
                          desc: "Modify which emails are filtered out during processing",
                        },
                        {
                          title: "Account Information",
                          desc: "View and update your stored account information",
                        },
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-900">
                              {item.title}
                            </h5>
                            <p className="text-sm text-slate-600">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-900 mb-1">
                          Data Deletion
                        </h4>
                        <p className="text-sm text-red-800">
                          When you disconnect your account, we can delete your
                          email address and settings from our database. Local
                          browser data can be cleared by you at any time. Email
                          us to request complete account deletion.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Contact */}
            <section id="contact">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-green-900">
                      Contact & Compliance
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">
                      Get in Touch
                    </h4>
                    <div className="space-y-1 text-sm text-green-800">
                      <p>📧 Email: jobstatustracker@gmail.com</p>
                      <p>🔗 GitHub: https://github.com/Tomiwajin</p>
                    </div>
                  </div>

                  <div className="border-t border-green-200 my-4"></div>

                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">
                      Compliance Standards
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["GDPR", "CCPA", "Google API Policy"].map((standard) => (
                        <Badge
                          key={standard}
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          {standard}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Footer */}
            <Card className="bg-slate-900 text-white border-slate-800">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-slate-300">
                    Questions about this policy? We&apos;re here to help.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link href="/">
                      <Button
                        variant="ghost"
                        className="text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/terms">
                      <Button
                        variant="ghost"
                        className="text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        Terms of Service
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
