import { type NextRequest, NextResponse } from "next/server";
import { google, gmail_v1 } from "googleapis";
import { cookies } from "next/headers";

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{ body?: { data?: string }; mimeType?: string }>;
  };
  internalDate: string;
}

function extractJobData(emailContent: string) {
  const rolePatterns = [
    /Your Application to\s+([^.,!?:;\n\r\-()]+)\s+(?:at)/,
    /Application Update:\s+([^.,!?:;\n\r\-()]+)\s+(?:at)/,
    /position\s+(?:of|as)\s+([^.,!?:;\n\r\-()]+)/,
    /role\s+(?:of|as)\s+([^.,!?:;\n\r\-()]+)/,
    /thank you for applying to\s+([^.,!?:;\n\r\-()]+)/,
    /apply for\s+([^.,!?:;\n\r\-()]+)/,
    /applying for\s+([^.,!?:;\n\r\-()]+)/,
    /Thank you for your interest in the\s+([^.,!?:;\n\r\-()]+)\s+(?:position|role)/,
    /(?:for|as)\s+the?\s+([^.,!?:;\n\r\-()]+)/,
  ];

  let role = "Unknown";
  for (const pattern of rolePatterns) {
    const match = emailContent.match(pattern);
    if (match) {
      role = match[1]
        .replace(/\(.*?\)/g, "")
        .replace(/\b(?:the|a|an)\b/gi, "")
        .trim();
      break;
    }
  }

  const companyPatterns = [
    /joining[\s:]+([A-Z][^.,!,:?\n\r\-]*)/,
    /at[\s:]+([A-Z][^.,!,:?\n\r\-]*)/,
    /with[\s:]+([A-Z][^.,!,:?\n\r\-]*)/,
    /to[\s:]+([A-Z][^.,!,:?\n\r\-]*)/,
    /the[\s:]+([A-Z][^.,!,:?\n\r\-]*)/,
    /for[\s:]+([A-Z][^.,!,:?\n\r\-]*)/,
  ];

  let company: string | undefined;
  for (const pattern of companyPatterns) {
    const match = emailContent.match(pattern);
    if (match) {
      company = match[1]
        .replace(/\b(LLC|Inc|Ltd|Corp|Company)\b\.?/gi, "")
        .trim();
      break;
    }
  }

  const rejectionKeywords = [
    "not selected",
    "closed",
    "not move forward",
    "pursue other candidates",
    "were not selected",
    "will not be moving forward",
    "regret to inform",
    "unfortunately",
    "other candidates whose qualifications",
    "decided to proceed with other applicants",
  ];

  const appliedIndicators = [
    "we received your application",
    "thank you for applying",
    "you applied",
    "application received",
    "submitted",
    "your application has been received",
    "we've received your application",
  ];

  const interviewIndicators = [
    "next steps",
    "next phase",
    "discuss your application",
    "would like to invite you",
  ];

  const offerIndicators = [
    "offer",
    "congratulations",
    "pleased to offer",
    "excited to offer",
  ];

  const lower = emailContent.toLowerCase();
  const isJobRelated =
    appliedIndicators.some((phrase) => lower.includes(phrase)) ||
    rejectionKeywords.some((phrase) => lower.includes(phrase)) ||
    interviewIndicators.some((phrase) => lower.includes(phrase)) ||
    offerIndicators.some((phrase) => lower.includes(phrase)) ||
    /\b(application|applied|interview|position of|thank you for applying|we received your application)\b/i.test(
      emailContent
    );

  const isBulkJobAd = (email: string): boolean => {
    const bulkPatterns = [
      /apply now/gi,
      /start applying/gi,
      /new jobs/gi,
      /job matches/gi,
      /jobs added/gi,
      /10,000\+ jobs/gi,
      /apply within \d+ hours/gi,
      /let's land your next role/gi,
      /job alert/gi,
      /job board/gi,
      /Glassdoor Community/gi,
      /you're signed up to/gi,
      /Getting Application Ready/gi,
    ];

    const totalMatches = bulkPatterns.reduce((count, pattern) => {
      return count + (email.match(pattern)?.length || 0);
    }, 0);

    return totalMatches >= 1;
  };

  if (!isJobRelated || isBulkJobAd(emailContent)) {
    return { isJobRelated: false };
  }

  let status = "applied";

  if (rejectionKeywords.some((phrase) => lower.includes(phrase))) {
    status = "rejected";
  } else if (interviewIndicators.some((phrase) => lower.includes(phrase))) {
    status = "interview";
  } else if (offerIndicators.some((phrase) => lower.includes(phrase))) {
    status = "offer";
  } else if (appliedIndicators.some((phrase) => lower.includes(phrase))) {
    status = "applied";
  }

  return {
    isJobRelated: true,
    role: role || "Unknown",
    company: company || "Unknown",
    status,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("gmail_access_token")?.value;
    const refreshToken = cookieStore.get("gmail_refresh_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const jobKeywords = [
      "thank you for applying",
      "we will not be moving forward",
      "we received your application",
      "next phase",
      "not move forward",
      "pursue other candidates",
      "you were not selected for this opportunity",
      "interview",
      "position closed",
    ];

    const query = `(${jobKeywords
      .map((keyword) => `"${keyword}"`)
      .join(" OR ")}) category:primary after:${Math.floor(
      new Date(startDate).getTime() / 1000
    )} before:${Math.floor(new Date(endDate).getTime() / 1000)}`;

    const allMessages: gmail_v1.Schema$Message[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const response: { data: gmail_v1.Schema$ListMessagesResponse } =
        await gmail.users.messages.list({
          userId: "me",
          q: query,
          maxResults: 100,
          pageToken,
        });

      const fetchedMessages = response.data.messages || [];
      allMessages.push(...fetchedMessages);
      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    const processedApplications = [];

    for (const message of allMessages) {
      try {
        const emailResponse = await gmail.users.messages.get({
          userId: "me",
          id: message.id!,
          format: "full",
        });

        const email = emailResponse.data as GmailMessage;
        const headers = email.payload.headers || [];

        const from = headers.find((h) => h.name === "From")?.value || "";
        const subject = headers.find((h) => h.name === "Subject")?.value || "";
        const date = new Date(Number.parseInt(email.internalDate));

        let body = "";
        if (email.payload.body?.data) {
          body = Buffer.from(email.payload.body.data, "base64").toString();
        } else if (email.payload.parts) {
          for (const part of email.payload.parts) {
            if (part.mimeType?.includes("text/plain") && part.body?.data) {
              body += Buffer.from(part.body.data, "base64").toString();
            }
          }
        }

        const emailContent = `From: ${from}\nSubject: ${subject}\nBody: ${body}`;
        const jobData = extractJobData(emailContent);

        if (jobData.isJobRelated) {
          processedApplications.push({
            id: `gmail-${email.id}`,
            company: jobData.company || "Unknown",
            role: jobData.role || "Unknown",
            status: jobData.status || "applied",
            email: from.match(/<(.+)>/)?.[1] || from,
            date: date.toISOString(),
            subject: subject,
          });
        }
      } catch (emailError) {
        console.error("Error processing email:", emailError);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedApplications.length,
      applications: processedApplications,
      totalFound: allMessages.length,
    });
  } catch (error) {
    console.error("Gmail processing error:", error);
    return NextResponse.json(
      {
        error: "Failed to process emails",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
