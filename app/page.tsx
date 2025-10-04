"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Brain, ChartLine, FolderUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white w-screen">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold gradient-text">CareerSync</h1>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="#features"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-400 hover:text-white transition-colors"
              >
                How It Works
              </a>
              <Link
                href="https://github.com/Tomiwajin/Gmail-Job-Tracking-tool.git"
                className="text-gray-400 hover:text-white transition-colors"
                target="_blank"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="heroGrid relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="animateFloat mb-8">
              <div className="w-24 h-24 mx-auto bg-white/10 rounded-2xl flex items-center justify-center glowEffect">
                <Image
                  src="/favicon-32x32.png"
                  alt="Logo"
                  width={32}
                  height={32}
                />
              </div>
            </div>

            <p className="text-xl text-gray-400 mb-4">
              Tired of manually tracking job updates?
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="gradientText">Let AI Handle</span>
              <br />
              <span className="text-white">Your Job Search</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Automatically track and organize your job applications using
              AI-powered email analysis. Connect your Gmail and let CareerSync
              do the heavy lifting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
              <Button className="px-8 py-3 bg-gray-200 text-black font-semibold rounded-lg hover:bg-gray-300 hover:-translate-y-0.5 transition-all duration-300 glowEffect">
                See Demo
              </Button>
              <Button
                asChild
                className="px-8 py-3 bg-transparent text-white border border-gray-600 font-semibold rounded-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-300"
              >
                <Link href="/updates">Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </div>
        <ShootingStars />
        <StarsBackground />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold gradientText mb-4">
              Smart Job Application Tracking
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              AI-powered email classification automatically organizes your job
              search communications into actionable insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="featureCard p-6 rounded-xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 bg-blue-400 rounded" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                AI Email Classification
              </h3>
              <p className="text-gray-400">
                Automatically identifies and categorizes job-related emails:
                applications, rejections, interviews, offers
              </p>
            </div>

            <div className="featureCard p-6 rounded-xl">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <ChartLine className="w-6 h-6 bg-green-400 rounded" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visual Analytics</h3>
              <p className="text-gray-400">
                Track your job search progress with detailed charts showing
                application rates, interview conversion, and success metrics
              </p>
            </div>

            <div className="featureCard p-6 rounded-xl">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <FolderUp className="w-6 h-6 bg-purple-400 rounded" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Export & Organize</h3>
              <p className="text-gray-400">
                Export your application data to CSV, Excel, or PDF. Filter by
                company, status, or date range for better organization
              </p>
            </div>

            <div className="featureCard p-6 rounded-xl">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-orange-400 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-gray-400">
                Completely stateless - no data stored on our servers. Open
                source and transparent. Your privacy is guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold gradientText mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Gmail</h3>
              <p className="text-gray-400">
                Securely connect your Gmail account to access your job-related
                emails
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
              <p className="text-gray-400">
                Our AI scans and classifies your emails, extracting company
                names, roles, and application status
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track & Analyze</h3>
              <p className="text-gray-400">
                View your organized job applications, track progress, and export
                data for further analysis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-auto bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2025 CareerSync. All rights reserved.
            </div>
            <div className="text-sm text-muted-foreground">
              🚀 Built by Tomiwa Jinadu | Made to elevate your experience
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <a
                href="https://github.com/Tomiwajin/job-app-tracker-gmail"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
