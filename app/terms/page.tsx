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
  FileText,
  Shield,
  Users,
  AlertTriangle,
  Scale,
  Settings,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function Terms() {
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
              <div className="bg-purple-100 p-3 rounded-full">
                <Scale className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Terms of Service
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Please read these terms carefully before using Job Application
              Tracker
            </p>
          </div>
        </div>

        {/* Quick Info Card */}
        <Card className="mb-8 border-purple-200 bg-purple-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-purple-900">
                Agreement Information
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-purple-900">Effective Date:</strong>
                <br />
                <span className="text-purple-700">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div>
                <strong className="text-purple-900">Last Updated:</strong>
                <br />
                <span className="text-purple-700">
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
                  { id: "acceptance", title: "Acceptance", icon: CheckCircle },
                  {
                    id: "service",
                    title: "Service Description",
                    icon: Settings,
                  },
                  { id: "accounts", title: "User Accounts", icon: Users },
                  {
                    id: "acceptable-use",
                    title: "Acceptable Use",
                    icon: Shield,
                  },
                  {
                    id: "data-privacy",
                    title: "Data & Privacy",
                    icon: FileText,
                  },
                  {
                    id: "disclaimers",
                    title: "Disclaimers",
                    icon: AlertTriangle,
                  },
                  { id: "termination", title: "Termination", icon: XCircle },
                  { id: "contact", title: "Contact", icon: Mail },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-purple-600 hover:bg-purple-50 p-2 rounded-md transition-colors"
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
            {/* Acceptance */}
            <section id="acceptance">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <CardTitle>1. Acceptance of Terms</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-slate-700 leading-relaxed">
                      By accessing and using Job Application Tracker (&quot;the
                      Service&quot;), you accept and agree to be bound by the
                      terms and provisions of this agreement. If you do not
                      agree to these terms, please do not use the Service.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Service Description */}
            <section id="service">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600" />
                    <CardTitle>2. Description of Service</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-slate-700 leading-relaxed mb-4">
                      Job Application Tracker is a web application designed to
                      help job seekers:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "Parse Gmail messages for job applications",
                        "Organize and track application status",
                        "Provide analytics and insights",
                        "Export application data",
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-slate-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* User Accounts */}
            <section id="accounts">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-600" />
                    <CardTitle>
                      3. User Accounts and Gmail Integration
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">
                        Gmail Access Requirements
                      </h4>
                      <div className="space-y-2 text-sm text-orange-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Grant permission to access Gmail</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Read-only access to job emails</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Revoke access anytime</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Account Responsibility
                      </h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span>Maintain Google account security</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span>Comply with Google Terms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Acceptable Use */}
            <section id="acceptable-use">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-slate-600" />
                    <CardTitle>4. Acceptable Use</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      You may use the Service for:
                    </h4>
                    <ul className="text-sm text-green-800 space-y-1 ml-6">
                      <li>• Tracking your personal job applications</li>
                      <li>• Organizing career search activities</li>
                      <li>• Analyzing your job search progress</li>
                      <li>• Exporting your own data</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      You must NOT:
                    </h4>
                    <ul className="text-sm text-red-800 space-y-1 ml-6">
                      <li>• Violate applicable laws or regulations</li>
                      <li>• Attempt unauthorized access to the Service</li>
                      <li>• Interfere with or disrupt the Service</li>
                      <li>
                        • Use for commercial purposes without authorization
                      </li>
                      <li>• Reverse engineer the application</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Data & Privacy */}
            <section id="data-privacy">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-600" />
                    <CardTitle>5. Data and Privacy</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">
                        Data Principles
                      </h4>
                      <div className="space-y-2 text-sm text-purple-800">
                        <p>• Processed per Privacy Policy</p>
                        <p>• Stored locally in your browser</p>
                        <p>• You retain full ownership</p>
                        <p>• No third-party sharing</p>
                      </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 mb-2">
                        Your Control
                      </h4>
                      <div className="space-y-2 text-sm text-indigo-800">
                        <p>• Export data anytime</p>
                        <p>• Delete local storage</p>
                        <p>• Revoke Gmail access</p>
                        <p>• Request data deletion</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Disclaimers */}
            <section id="disclaimers">
              <Card className="border-orange-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <CardTitle className="text-orange-900">
                      6. Important Disclaimers
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">
                      Service Provided &quot;AS IS&quot;
                    </h4>
                    <p className="text-sm text-orange-800 mb-3">
                      We make no warranties regarding:
                    </p>
                    <ul className="text-sm text-orange-800 space-y-1 ml-4">
                      <li>• Accuracy of extracted job application data</li>
                      <li>• Uninterrupted or error-free operation</li>
                      <li>• Security of data transmission</li>
                      <li>• Compatibility with all email formats</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">
                      Limitation of Liability
                    </h4>
                    <p className="text-sm text-yellow-800">
                      Job Application Tracker shall not be liable for any
                      indirect, incidental, special, consequential, or punitive
                      damages, including loss of profits, data, or other
                      intangible losses.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Third-Party Services */}
            <section id="third-party">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-600" />
                    <CardTitle>7. Third-Party Services</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Google Integration
                    </h4>
                    <p className="text-sm text-blue-800 mb-3">
                      The Service integrates with Google Gmail API and is
                      subject to:
                    </p>
                    <div className="space-y-2">
                      {[
                        "Google's Terms of Service",
                        "Google API Services User Data Policy",
                        "Changes in Google's API may affect functionality",
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 text-xs"
                          >
                            {index + 1}
                          </Badge>
                          <span className="text-sm text-blue-800">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Service Availability */}
            <section id="availability">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-600" />
                    <CardTitle>8. Service Availability</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                      <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                      <h5 className="font-medium text-slate-900 text-sm">
                        No Guarantee
                      </h5>
                      <p className="text-xs text-slate-600 mt-1">
                        Uninterrupted availability not guaranteed
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                      <Settings className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <h5 className="font-medium text-slate-900 text-sm">
                        Maintenance
                      </h5>
                      <p className="text-xs text-slate-600 mt-1">
                        Temporary service interruptions possible
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                      <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                      <h5 className="font-medium text-slate-900 text-sm">
                        Termination
                      </h5>
                      <p className="text-xs text-slate-600 mt-1">
                        Service may be suspended anytime
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Termination */}
            <section id="termination">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <CardTitle>9. Termination</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        You Can Terminate By:
                      </h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Revoking Gmail access via Google</li>
                        <li>• Clearing your browser data</li>
                        <li>• Simply ceasing to use the Service</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        We May Terminate If:
                      </h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        <li>• Terms of Service are breached</li>
                        <li>• Illegal or harmful activity detected</li>
                        <li>• Technical or business reasons</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Legal */}
            <section id="legal">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-slate-600" />
                    <CardTitle>10. Legal Provisions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Changes to Terms
                      </h4>
                      <p className="text-sm text-gray-700">
                        We may modify these Terms at any time. Changes will be
                        posted on this page with updated dates.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Severability
                      </h4>
                      <p className="text-sm text-gray-700">
                        If any provision is unenforceable, remaining provisions
                        continue in full force and effect.
                      </p>
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
                      Contact Information
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-3">
                    <p className="text-green-800">
                      Questions about these Terms of Service? We&apos;re here to
                      help.
                    </p>
                    <div className="space-y-2 text-sm text-green-700">
                      <p className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        jobstatustracker@gmail.com
                      </p>
                      <p className="flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" />
                        GitHub: https://github.com/Tomiwajin
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Important Notice */}
            <Card className="bg-blue-900 text-white border-blue-800">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold">Free & Open Source</h3>
                  <p className="text-blue-100 text-sm max-w-2xl mx-auto">
                    This is a free, open-source tool designed to help job
                    seekers organize their applications. We are committed to
                    protecting your privacy and providing a useful service
                    without any hidden costs or data monetization.
                  </p>
                  <div className="flex justify-center gap-4 pt-2">
                    <Link href="/">
                      <Button
                        variant="ghost"
                        className="text-blue-100 hover:text-white hover:bg-blue-800"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/privacy">
                      <Button
                        variant="ghost"
                        className="text-blue-100 hover:text-white hover:bg-blue-800"
                      >
                        Privacy Policy
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
