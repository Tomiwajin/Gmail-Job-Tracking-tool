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
  const lines = emailContent.split("\n");
  const subject =
    lines
      .find((line) => line.startsWith("Subject:"))
      ?.replace("Subject:", "")
      .trim() || "";

  const rolePatterns = [
    /your job application for\s+([^.,!?\n\r]+)/i,
    /Job Title:\s*\*?\*?([^*\n\r]+?)(?:Location:|Business Unit:|\*?\*?\s*$)/i,
    /for the position of (?:the\s+)?(.+?)(?:\s+has)/i,
    /for the (?:the\s+)?(.+?)(?:\s+job|\s+position|\s+role|\s+was)/i,
    /invite you to the next phase of (?:the\s+)?\*(.+?)\*\s*role/i,
    /Your application was sent to [^\n]+\s*\n\s*\n([^\n]+)/i,
    /Indeed Application:\s+([^.,!?:;\n\r()]+)/i,
    /Subject:\s*([^-\n\r]+?)\s*-\s*[A-Za-z]/i,
    /Thank you for applying to [^']*'s\s+(.+?)\s+role/i,
    /Thank you very much for your recent application to the\s+(.+?)\s+position at/i,
    /apply for the\s+([^.]+?)\s+role here at/i,
    /your application for (?:the\s+)?(.+?)(?:\s+job|\s+position|\s+role|\s+was)/i,
    /application for (?:the\s+)?(.+?)(?:\s+job|\s+position|\s+role|\s+was|\s*,|\s*and|\s*$)/i,
    /Your Application to\s+([^.,!?:;\n\r\-()]+)\s+(?:at)/i,
    /Application Update:\s+([^.,!?:;\n\r\-()]+)\s+(?:at)/i,
    /position|role\s+(?:of|as)\s+([^.,!?:;\n\r\-()]+)/i,
    /application to (?:the\s+)?([^.,!?:;\n\r()]+?)(?:\s+position|\s+role|\s*$)/i,
    /thank you for applying to\s+(?:the\s+)?([^.,!?:;\n\r()]+?)(?:\s+position|\s+at|\s*$)/i,
    /apply for\s+([^.,!?:;\n\r\-()]+)/i,
    /applying for\s+([^.,!?:;\n\r\-()]+)/i,
    /Thank you for expressing interest in the (?:the\s+)?([^.,!?\n\r]+?)\s+(?:position|role|job)/i,
    /Thank you for your interest in (?:the\s+)?([^.,!?\n\r]+?)\s+(?:position|role|job)/i,
    /following position:\s*([^,\n\r]+)(?:,\s*R-\d+)?/i,
    /received your application for the role of\s+([^,\n\r]+)/i,
    /interest in the\s+([^(#]+?)(?:\s*\([^)]*\))?\s+opportunity/i,
    /interest you have expressed in the\s+([^.]+?)\s+position and in employment/i,
    /your application to\s+(.+?)\s+for\s+/i,
    /Thank you for your interest in our\s+([A-Za-z][^:.,!?\n\r]*)/i,
  ];

  let role = "Unknown";
  for (const pattern of rolePatterns) {
    const match = emailContent.match(pattern);
    if (match && match[1] && match[1].trim().length > 0) {
      const candidateRole = match[1]
        .replace(/\(.*?\)/g, "")
        .replace(
          /\b(?:the|a|an|position|role|our|job|openings|within|company|Hiring|this)\b/gi,
          ""
        )
        .trim();

      const genericPhrases =
        /^(openings?|jobs?|companies?|opportunities?|work|team)$/i;
      const tooShort = candidateRole.length <= 4;
      const isGeneric =
        candidateRole.match(/^(role|position|job)$/i) ||
        genericPhrases.test(candidateRole);

      const isFragment =
        /\b(we|you|think|cool|place|awesome|excited|super|can't|wait|be|part|of|team|member|join|joining|work|with)\b/i.test(
          candidateRole
        );

      if (!tooShort && !isGeneric && !isFragment) {
        role = candidateRole;
        break;
      }
    }
  }

  const companyPatterns = [
    //Bottom then top regex
    /Sincerely,\s*([A-Z][^,\n\r]*?)\s+Talent Acquisition/i,
    /message from\s+([A-Za-z][A-Za-z\s]+)/i,
    /^([^-]+?)\s*-\s*Thank You for Applying/i,
    /Thank you,\s*\n\s*([A-Z][^!.,\n\r]*)/i,
    /Thank you from\s*([A-Z][^!.,\n\r]*)/i,
    /Thank you for applying to a position at\s+([A-Za-z][A-Za-z\s&]+?)!/i,
    /Thank you for applying to ([^']+)'s/i,
    /Thank you for applying to work with\s+([A-Z][^.,!?\n\r]*?)(?:\s|$)/i,
    /Thanks for applying to\s+([A-Z][^.,!?\n\r]*?)(?:\s|$)/i,
    /Thanks for your interest in ([^.!?\n\r]+)/i,
    /Thank you for your interest in the following position at\s+([A-Za-z][^:.,!?\n\r]*?)\s*:/i,
    /Thank you for your interest in\s+([A-Z][^!.,\n\r]*?)(?:\!|\s*We|\s*$)/i,
    /applying to\s+([A-Z][^!.,\n\r]*?)(?:\!|\s*We|\s*$)/i,
    /application via\s+([A-Z][^!.,\n\r]*)/i,
    /position with\s+([A-Z][^.,!?\n\r]*?)(?:\.|!|\s|$)/i,
    /Thanks!\s*([A-z0-9]*)\s+talent|team/i,
    /Good luck!\s*([A-z0-9]*)\s+talent|team/i,
    /best Regards,\s*([A-z0-9]*)\s+team/i,
    /Regards,\s*\n\s*[^\n]*\n\s*([A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]{2,})*)\s*$/m,
    /Regards,\s*\n\s*([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*)\s*$/m,
    /career opportunities with\s+([A-Z][^.,()!?\n\r]*?)(?:\s*\([^)]+\))?\./i,
    /Kind Regards,\s*([A-Z][^,\n\r]*?)\s+Talent Acquisition|team/i,
    /\bat\b[\s:]*([A-Z0-9][^.,!,:?\n\r\-]*?)(?=\s*[!.,]|\s+(?:has|an|the|using)|\s*$)/i,
    /Thank you for applying to ([^.!?\n\r]+)/i,
    /joining[\s:]+([A-Z][^.,!,:?\n\r\-]*)/i,
    /Your application for\s+([A-Za-z][A-Za-z\s&]+)/i,
    /received your application to be part of (?:the\s+)?([A-Z][^.,!?\n\r]*?)\s+team/i,
    /applying to join us here at ([^,!]+)/i,
    /Thank you for completing your\s*([A-Z][^.,!?\n\r]*)/i,
    /with[\s:]+([A-Z][^.,!,:?\n\r\-]*)/i,
    /position|role|job|applying at[\s:]+([A-Z0-9][^.,!,:?\n\r\-]*)/i,
    /your interest in\s+([A-Z][^.,!?\n\r]*?)(?:\.|!|\s*,|\s+|\s*$)/i,
    /sent to\s+([A-Z][^.,!?:;\n\r]*?)(?:\.|$)/i,
    /The following items were sent to ([^.\n]+)/i,
  ];

  let company = "Unknown";

  for (const pattern of companyPatterns) {
    const match = subject.match(pattern);
    if (match && match[1] && match[1].trim().length > 0) {
      const candidateCompany = match[1]
        .replace(/\b(intern|Company|Team|our|Application|position)\b\.?/gi, "")
        .replace(/\b(?:the|a|an)\b/gi, "")
        .trim();

      if (candidateCompany.length > 0) {
        company = candidateCompany;
        break;
      }
    }
  }

  if (company === "Unknown") {
    for (const pattern of companyPatterns) {
      const match = emailContent.match(pattern);
      if (match && match[1] && match[1].trim().length > 0) {
        const candidateCompany = match[1]
          .replace(/\b(Corp|Company|Team|Hiring)\b\.?/gi, "")
          .replace(/\b(?:the|a|an)\b/gi, "")
          .trim();

        if (candidateCompany.length > 0) {
          company = candidateCompany;
          break;
        }
      }
    }
  }

  const appliedIndicators = [
    "thanks for applying to",
    "we received your application",
    "thank you for applying",
    "thank you for your interest",
    "application submitted",
    "you applied",
    "application received",
    "submitted",
    "your application has been received",
    "we've received your application",
    "delighted that you are interested",
    "we will review your application",
    "We have received your information regarding the following position",
    "application was sent to",
    "applied on",
    "successfully applied to",
    "application confirmation",
    "Thanks so much for applying to join us here at",
    "You have successfully registered",
    "has been received",
  ];

  // Strong rejection indicators -
  const strongRejectionKeywords = [
    "you will not advance to the next stage of review",
    "we've decided not to move forward",
    "decided not to move forward",
    "we regret to inform you",
    "unfortunately, you were not selected",
    "we will not be moving forward with your application",
    "decided to proceed with other applicants",
    "we will not be proceeding with your application",
    "your application was not successful",
    "we have chosen to move forward with other candidates",
    "you were not selected for this role",
    "pursue candidates whose backgrounds align more closely",
    "will not be moving forward",
    "not moving forward with your application",
    "our attention on other candidates",
    "we have decided to pursue other candidates",
    "unable to proceed with your candidacy at this time",
    "we will not move you forward",
    "your application was not selected at this time",
    "we won't be moving forward",
    "unable to pursue your application",
    "is no longer available",
    "it has not been selected for further consideration",
    "we decided to move forward with other candidates",
  ];

  const conditionalPhrases = [
    "if you are not selected",
    "if you are not chosen",
    "should you not be selected",
  ];

  const interviewIndicators = [
    "would like to schedule",
    "invite you for an interview",
    "next steps in the process",
    "discuss your application further",
    "would like to invite you",
    "schedule a call",
    "phone screen",
    "discuss your experience and objectives",
  ];

  const offerIndicators = [
    "pleased to offer",
    "excited to offer",
    "offer you the position",
    "we would like to extend an offer",
  ];

  const nextPhaseIndicators = [
    "invite you to the next phase",
    "next stage of the recruitment process",
  ];

  const lower = emailContent.toLowerCase();

  const isConfirmationEmail = appliedIndicators.some((phrase) =>
    lower.includes(phrase)
  );
  const hasConditionalLanguage = conditionalPhrases.some((phrase) =>
    lower.includes(phrase)
  );

  let status = "applied";

  if (offerIndicators.some((phrase) => lower.includes(phrase))) {
    status = "offer";
  } else if (interviewIndicators.some((phrase) => lower.includes(phrase))) {
    status = "interview";
  } else if (nextPhaseIndicators.some((phrase) => lower.includes(phrase))) {
    status = "next-phase";
  } else if (strongRejectionKeywords.some((phrase) => lower.includes(phrase))) {
    if (!isConfirmationEmail || !hasConditionalLanguage) {
      status = "rejected";
    } else {
      status = "applied";
    }
  } else if (isConfirmationEmail) {
    status = "applied";
  }

  const isJobRelated =
    appliedIndicators.some((phrase) => lower.includes(phrase)) ||
    strongRejectionKeywords.some((phrase) => lower.includes(phrase)) ||
    interviewIndicators.some((phrase) => lower.includes(phrase)) ||
    offerIndicators.some((phrase) => lower.includes(phrase)) ||
    nextPhaseIndicators.some((phrase) => lower.includes(phrase)) ||
    /\b(application|applied|interview|position of|thank you for applying|we received your application|We have received your information)\b/i.test(
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
      / is hiring now/gi,
      /Are you still interested in these jobs/gi,
      /1-Click Apply/gi,
      /jobs recommended/gi,
      /Your application was viewed/gi,
      /application for the position listed below is not quite finished/gi,
      /Your submission is saved as a draft/gi,
      /you haven't completed an application yet /gi,
      /May I send you more info on these roles/gi,
      /Make sure to use this link so I can track your application/gi,
      /job placement program/gi,
      /market you to.*clients/gi,
      /top picks for you/gi,
      /Jobs I think you might like/gi,
      /Incomplete Skills Test/gi,
      /Applications Open/gi,
      /Applications now open/gi,
      /progress is saved/gi,
      /Complete your application/gi,
      /Here's a copy of your application/gi,
      /Apply to jobs at/gi,
      /complete this survey/gi,
      /Advertisement/gi,
      /claim offer/gi,
      /Your recent reading history/gi,
      /recently posted/gi,
      /start application/gi,
      /Read more in your feed/gi,
      /land your dream job in tech/gi,
      /NEWSLETTER ON LINKEDIN/gi,
    ];

    const totalMatches = bulkPatterns.reduce((count, pattern) => {
      return count + (email.match(pattern)?.length || 0);
    }, 0);

    return totalMatches >= 1;
  };

  const isClosedJobPosting = (email: string): boolean => {
    const closedPatterns = [
      /job posting was closed/gi,
      /position has been closed/gi,
      /temporarily put.*on hold/gi,
      /no longer accepting applications/gi,
      /position is no longer available/gi,
      /job has been filled/gi,
      /posting has been removed/gi,
      /opportunity is no longer available/gi,
      /role has been filled/gi,
      /position has been filled/gi,
      /closed or temporarily put.*on hold/gi,
    ];

    const totalMatches = closedPatterns.reduce((count, pattern) => {
      return count + (email.match(pattern)?.length || 0);
    }, 0);

    return totalMatches >= 1;
  };

  if (
    !isJobRelated ||
    isBulkJobAd(emailContent) ||
    isClosedJobPosting(emailContent)
  ) {
    return { isJobRelated: false };
  }

  return {
    isJobRelated: true,
    role: role,
    company: company,
    status,
  };
}

// Enhanced email body extraction function
function extractEmailBody(payload: gmail_v1.Schema$MessagePart): string {
  let body = "";

  // Recursive function to extract text from nested parts
  const extractFromPart = (part: gmail_v1.Schema$MessagePart): string => {
    let text = "";

    // Check if this part has body data
    if (part.body?.data) {
      try {
        const decoded = Buffer.from(part.body.data, "base64").toString("utf-8");

        // If it's HTML, try to extract text content (simple approach)
        if (part.mimeType?.includes("text/html")) {
          // Remove HTML tags and decode entities (ES2017 compatible)
          const htmlStripped = decoded
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, " ")
            .trim();
          text += htmlStripped + "\n";
        } else if (part.mimeType?.includes("text/plain")) {
          text += decoded + "\n";
        }
      } catch (error) {
        console.error("Error decoding part:", error);
      }
    }

    // Recursively process nested parts
    if (part.parts && Array.isArray(part.parts)) {
      for (const subPart of part.parts) {
        text += extractFromPart(subPart);
      }
    }

    return text;
  };

  // Start with the main payload
  body = extractFromPart(payload);

  // If we still don't have content, try the snippet as a fallback
  if (!body.trim() && (payload as any).snippet) {
    body = (payload as any).snippet;
  }

  return body.trim();
}

// Helper function to check if email should be excluded
function shouldExcludeEmail(
  emailAddress: string,
  excludedEmails: string[]
): boolean {
  if (!excludedEmails || excludedEmails.length === 0) {
    return false;
  }

  const normalizedEmail = emailAddress.toLowerCase().trim();

  // Extract email from format "Name <email@domain.com>"
  const extractedEmail =
    normalizedEmail.match(/<(.+)>/)?.[1] || normalizedEmail;

  return excludedEmails.some((excludedEmail) => {
    const normalizedExcluded = excludedEmail.toLowerCase().trim();

    // Exact match
    if (extractedEmail === normalizedExcluded) {
      return true;
    }

    // Domain match (e.g., exclude all emails from @noreply.company.com)
    if (
      normalizedExcluded.startsWith("@") &&
      extractedEmail.endsWith(normalizedExcluded)
    ) {
      return true;
    }

    // Partial domain match (e.g., "noreply" matches any email containing "noreply")
    if (extractedEmail.includes(normalizedExcluded)) {
      return true;
    }

    return false;
  });
}

// Updated POST function with excluded emails support
export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate, excludedEmails = [] } = await request.json();
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
      "Thanks for applying to",
      "we will not be moving forward",
      "we received your application",
      "received your information regarding",
      "next phase",
      "next stage",
      "not move forward",
      "pursue other candidates",
      "you were not selected for this opportunity",
      "interview",
      "talent acquisition",
      "application confirmation",
      "position:",
      "Update on your application",
      "we've decided not to move forward ",
      "your application was sent to",
      "Thanks so much for applying",
      "Thank you for interest",
      "After careful consideration of your background and experience",
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
    let excludedCount = 0;

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

        // Check if this email should be excluded
        if (shouldExcludeEmail(from, excludedEmails)) {
          excludedCount++;
          console.log(`Excluding email from: ${from}`);
          continue;
        }

        // Use the improved body extraction
        const body = extractEmailBody(email.payload);

        // Enhanced email content with more context
        const emailContent = `From: ${from}\nSubject: ${subject}\nSnippet: ${
          email.snippet || ""
        }\nBody: ${body}`;

        const jobData = extractJobData(emailContent);

        // Debugging Tool
        // if (
        //   emailContent.includes("Indeed Application: Jr./Mid level Java/Python")
        // ) {
        //   console.log("=== RAW EMAIL DEBUG ===");
        //   console.log("Full Email Content:", emailContent);
        //   console.log("=== END DEBUG ===");
        // }

        if (jobData.isJobRelated) {
          processedApplications.push({
            id: `gmail-${email.id}`,
            company: jobData.company || "Unknown",
            role: jobData.role || "Unknown",
            status: jobData.status || "applied",
            email: from.match(/<(.+)>/)?.[1] || from,
            date: date.toISOString(),
            subject: subject,
            bodyPreview: body.substring(0, 200),
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
      excludedCount: excludedCount,
      excludedEmails: excludedEmails,
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
