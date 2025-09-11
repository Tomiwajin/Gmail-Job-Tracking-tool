import { type NextRequest, NextResponse } from "next/server";
import { google, gmail_v1 } from "googleapis";
import { cookies } from "next/headers";
import { Client } from "@gradio/client";

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

interface ClassificationResult {
  label: string;
  score: number;
  success?: boolean;
}

// Function to classify email using your deployed HuggingFace Space with Gradio Client
async function classifyEmail(emailText: string): Promise<ClassificationResult> {
  try {
    const spaceUrl =
      process.env.HUGGINGFACE_SPACE_URL || "Tomiwajin/Email-Classifier";

    const client = await Client.connect(spaceUrl);
    const result = await client.predict("/api_classify", {
      email_text: emailText,
    });

    const classificationData = result.data;

    // Parse the JSON response if it's a string
    const parsedResult =
      typeof classificationData === "string"
        ? JSON.parse(classificationData)
        : classificationData;

    if (parsedResult.success === false) {
      throw new Error(parsedResult.error || "Classification failed");
    }

    return {
      label: parsedResult.label,
      score: parsedResult.score,
      success: true,
    };
  } catch (error) {
    console.error("Classification error:", error);
    return {
      label: "other",
      score: 0,
      success: false,
    };
  }
}

// Batch classification function with proper batch size handling
async function classifyEmailsBatch(
  emails: Array<{ text: string; id: string }>
): Promise<Map<string, ClassificationResult>> {
  const results = new Map<string, ClassificationResult>();
  const maxBatchSize = 100;
  try {
    const spaceUrl =
      process.env.HUGGINGFACE_SPACE_URL || "Tomiwajin/Email-Classifier";

    const client = await Client.connect(spaceUrl);

    // Process emails in chunks of maxBatchSize
    for (let i = 0; i < emails.length; i += maxBatchSize) {
      const batch = emails.slice(i, i + maxBatchSize);

      console.log(
        `Processing batch ${Math.floor(i / maxBatchSize) + 1}/${Math.ceil(
          emails.length / maxBatchSize
        )} (${batch.length} emails)`
      );

      // Extract just the email texts for batch processing
      const emailTexts = batch.map((email) => email.text);
      const emailTextsJson = JSON.stringify(emailTexts);

      // Use the /api_classify_batch endpoint
      const result = await client.predict("/api_classify_batch", {
        emails_json: emailTextsJson,
      });

      const batchDataString = result.data as string;

      // Parse the JSON string returned by your batch function
      const batchData = JSON.parse(batchDataString);

      // Handle the response structure from your Space
      if (batchData.results && Array.isArray(batchData.results)) {
        // Map results back to email IDs
        batch.forEach((email, index) => {
          const result = batchData.results[index];
          if (result && result.success && result.label) {
            results.set(email.id, {
              label: result.label,
              score: result.score || 0,
              success: true,
            });
          } else {
            results.set(email.id, {
              label: "other",
              score: 0,
              success: false,
            });
          }
        });
      } else {
        throw new Error(batchData.error || "Invalid batch response format");
      }

      // Add a small delay between batches to avoid overwhelming the service
      if (i + maxBatchSize < emails.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error("Batch classification error:", error);

    // Fallback to individual classifications if batch fails
    console.log("Falling back to individual classifications...");

    const batchSize = 5;
    const delay = 1000;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      const batchPromises = batch.map(async (email) => {
        const classification = await classifyEmail(email.text);
        return { id: email.id, classification };
      });

      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach(({ id, classification }) => {
        results.set(id, classification);
      });

      if (i + batchSize < emails.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return results;
}

//extract role and company data using regex
function extractJobData(emailContent: string) {
  const lines = emailContent.split("\n");
  const subject =
    lines
      .find((line) => line.startsWith("Subject:"))
      ?.replace("Subject:", "")
      .trim() || "";

  // Role extraction patterns
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
    /Thank you for submitting your application to be a\s+([A-Za-z][^:.,!?\n\r,]*)\s+at/i,
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

  // Company extraction patterns
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
    /best Regards,\s*([A-z0-9]*)\s+talent|team/i,
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

  return {
    role: role,
    company: company,
  };
}

//Email body extraction function
function extractEmailBody(payload: gmail_v1.Schema$MessagePart): string {
  let body = "";

  // Recursive function to extract text from nested parts
  const extractFromPart = (part: gmail_v1.Schema$MessagePart): string => {
    let text = "";

    // Check if this part has body data
    if (part.body?.data) {
      try {
        const decoded = Buffer.from(part.body.data, "base64").toString("utf-8");

        // If it's HTML, try to extract text content
        if (part.mimeType?.includes("text/html")) {
          // Remove HTML tags and decode entities
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

// POST function with model-based status classification
export async function POST(request: NextRequest) {
  try {
    const {
      startDate,
      endDate,
      excludedEmails = [],
      classificationThreshold = 0.5,
      jobLabels = ["applied", "rejected", "interview", "next-step", "offer"],
    } = await request.json();

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

    // Fetch all emails in the date range
    const query = `category:primary after:${Math.floor(
      new Date(startDate).getTime() / 1000
    )} before:${Math.floor(new Date(endDate).getTime() / 1000)}`;

    const allMessages: gmail_v1.Schema$Message[] = [];
    let pageToken: string | undefined = undefined;

    console.log("Fetching emails from Gmail...");

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

    console.log(
      `Found ${allMessages.length} emails. Processing for classification...`
    );

    const emailsForClassification: Array<{
      text: string;
      id: string;
      metadata: any;
    }> = [];
    const excludedCount = { excluded: 0 };

    // Process emails and prepare for classification
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
          excludedCount.excluded++;
          continue;
        }

        const body = extractEmailBody(email.payload);

        // Prepare email text for classification (subject + body snippet)
        const emailText = `${subject} ${body.substring(0, 1000)}`;

        emailsForClassification.push({
          text: emailText,
          id: message.id!,
          metadata: {
            from,
            subject,
            date,
            body,
            snippet: email.snippet || "",
          },
        });
      } catch (emailError) {
        console.error("Error processing email for classification:", emailError);
        continue;
      }
    }

    console.log(
      `Classifying ${emailsForClassification.length} emails using your HuggingFace Space...`
    );

    // Classify all emails using your deployed HuggingFace Space
    const classifications = await classifyEmailsBatch(emailsForClassification);

    console.log("Classification completed. Processing job-related emails...");

    const processedApplications = [];
    let classifiedAsJob = 0;
    let classificationErrors = 0;

    // Process only emails classified as job-related
    for (const emailData of emailsForClassification) {
      const classification = classifications.get(emailData.id);

      if (!classification || !classification.success) {
        classificationErrors++;
        continue;
      }

      // Check if classification.label exists and is valid
      if (!classification.label || typeof classification.label !== "string") {
        console.warn(
          `Invalid or missing label for email ${emailData.id}:`,
          classification
        );
        classificationErrors++;
        continue;
      }

      // Check if email is classified as job-related based on your model's labels
      const isJobRelated =
        jobLabels.includes(classification.label.toLowerCase()) &&
        classification.score >= classificationThreshold;

      if (isJobRelated) {
        classifiedAsJob++;

        // Debug logging for specific emails
        // if (
        //   emailData.metadata.body.includes("email text") ||
        //   emailData.metadata.body.includes("email text")
        // ) {
        //   console.log("=== CLASSIFICATION RESULT DEBUG ===");
        //   console.log("Email classified as:", classification.label);
        //   console.log("Confidence score:", classification.score);
        //   console.log("Subject:", emailData.metadata.subject);
        //   console.log("===================================");
        // }

        // Extract job details using regex
        const { from, subject, date, body, snippet } = emailData.metadata;

        // Enhanced email content with more context
        const emailContent = `From: ${from}\nSubject: ${subject}\nSnippet: ${snippet}\nBody: ${body}`;

        const jobData = extractJobData(emailContent);

        processedApplications.push({
          id: `gmail-${emailData.id}`,
          company: jobData.company || "Unknown",
          role: jobData.role || "Unknown",
          status: classification.label.toLowerCase(),
          email: from.match(/<(.+)>/)?.[1] || from,
          date: date.toISOString(),
          subject: subject,
          bodyPreview: body.substring(0, 200),
          classification: {
            label: classification.label,
            confidence: classification.score,
          },
        });
      }
    }

    console.log(
      `Processing completed. Found ${processedApplications.length} job applications.`
    );

    return NextResponse.json({
      success: true,
      processed: processedApplications.length,
      applications: processedApplications,
      totalEmails: allMessages.length,
      emailsProcessedForClassification: emailsForClassification.length,
      classifiedAsJobRelated: classifiedAsJob,
      classificationErrors: classificationErrors,
      excludedCount: excludedCount.excluded,
      excludedEmails: excludedEmails,
      classificationStats: {
        threshold: classificationThreshold,
        jobLabels: jobLabels,
        spaceUrl:
          process.env.HUGGINGFACE_SPACE_URL || "Tomiwajin/Email-Classifier",
      },
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
