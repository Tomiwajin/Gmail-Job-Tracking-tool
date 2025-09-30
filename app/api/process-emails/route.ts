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

interface EmailMetadata {
  from: string;
  subject: string;
  date: Date;
  body: string;
  snippet: string;
}

function sendProgress(
  encoder: TextEncoder,
  controller: ReadableStreamDefaultController,
  stage: string,
  current: number,
  total: number
) {
  const progress = {
    type: "progress",
    stage,
    current,
    total,
    percentage: Math.round((current / total) * 100),
  };

  const data = `data: ${JSON.stringify(progress)}\n\n`;
  controller.enqueue(encoder.encode(data));
}

async function classifyEmail(emailText: string): Promise<ClassificationResult> {
  try {
    const spaceUrl = process.env.HUGGINGFACE_SPACE_URL;
    if (!spaceUrl) {
      throw new Error("HuggingFace Space URL not configured");
    }

    const client = await Client.connect(spaceUrl);
    const result = await client.predict("/api_classify", {
      email_text: emailText,
    });

    const classificationData = result.data;
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
  } catch {
    return {
      label: "other",
      score: 0,
      success: false,
    };
  }
}

async function classifyEmailsBatch(
  emails: Array<{ text: string; id: string }>,
  progressCallback?: (current: number, total: number) => void
): Promise<Map<string, ClassificationResult>> {
  const results = new Map<string, ClassificationResult>();
  const maxBatchSize = 100;

  try {
    const spaceUrl = process.env.HUGGINGFACE_SPACE_URL;
    if (!spaceUrl) {
      throw new Error("HuggingFace Space URL not configured");
    }

    const client = await Client.connect(spaceUrl);

    for (let i = 0; i < emails.length; i += maxBatchSize) {
      const batch = emails.slice(i, i + maxBatchSize);

      if (progressCallback) {
        progressCallback(i, emails.length);
      }

      const emailTexts = batch.map((email) => email.text);
      const emailTextsJson = JSON.stringify(emailTexts);

      const result = await client.predict("/api_classify_batch", {
        emails_json: emailTextsJson,
      });

      const batchDataString = result.data as string;
      const batchData = JSON.parse(batchDataString);

      if (batchData.results && Array.isArray(batchData.results)) {
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

      if (i + maxBatchSize < emails.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (progressCallback) {
      progressCallback(emails.length, emails.length);
    }
  } catch {
    // Fallback to individual classifications
    const batchSize = 5;
    const delay = 1000;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      if (progressCallback) {
        progressCallback(i, emails.length);
      }

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

    if (progressCallback) {
      progressCallback(emails.length, emails.length);
    }
  }

  return results;
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

  const companyPatterns = [
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

  // Extract company from subject line first
  for (const pattern of companyPatterns) {
    const match = subject.match(pattern);
    if (match && match[1] && match[1].trim().length > 0) {
      const candidateCompany = match[1]
        .replace(/\b(intern|Company|Team|our|Application|position)\b\.?/gi, "")
        .replace(/\b(?:the|a|an)\b/gi, "")
        .trim();

      if (candidateCompany.length > 0 && candidateCompany.length <= 22) {
        company = candidateCompany;
        break;
      }
    }
  }

  // Fallback to full email content
  if (company === "Unknown") {
    for (const pattern of companyPatterns) {
      const match = emailContent.match(pattern);
      if (match && match[1] && match[1].trim().length > 0) {
        const candidateCompany = match[1]
          .replace(/\b(Corp|Company|Team|Hiring)\b\.?/gi, "")
          .replace(/\b(?:the|a|an)\b/gi, "")
          .trim();

        if (candidateCompany.length > 0 && candidateCompany.length <= 22) {
          company = candidateCompany;
          break;
        }
      }
    }
  }

  return { role, company };
}

function extractEmailBody(payload: gmail_v1.Schema$MessagePart): string {
  let body = "";

  const extractFromPart = (part: gmail_v1.Schema$MessagePart): string => {
    let text = "";

    if (part.body?.data) {
      try {
        const decoded = Buffer.from(part.body.data, "base64").toString("utf-8");

        if (part.mimeType?.includes("text/html")) {
          let htmlContent = decoded
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

          htmlContent = htmlContent
            .replace(
              /<[^>]*style[^>]*display\s*:\s*none[^>]*>[\s\S]*?<\/[^>]+>/gi,
              ""
            )
            .replace(
              /<[^>]*style[^>]*visibility\s*:\s*hidden[^>]*>[\s\S]*?<\/[^>]+>/gi,
              ""
            )
            .replace(
              /<[^>]*style[^>]*opacity\s*:\s*0[^>]*>[\s\S]*?<\/[^>]+>/gi,
              ""
            )
            .replace(
              /<[^>]*style[^>]*max-height\s*:\s*0[^>]*>[\s\S]*?<\/[^>]+>/gi,
              ""
            )
            .replace(
              /<[^>]*style[^>]*font-size\s*:\s*[01]px[^>]*>[\s\S]*?<\/[^>]+>/gi,
              ""
            )
            .replace(
              /<div[^>]*style[^>]*(?=.*overflow\s*:\s*hidden)(?=.*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0|max-height\s*:\s*0|font-size\s*:\s*[01]px))[^>]*>[\s\S]*?<\/div>/gi,
              ""
            );

          const htmlStripped = htmlContent
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, "/")
            .replace(/&#x3D;/g, "=")
            .replace(/\s+/g, " ")
            .trim();

          text += htmlStripped + "\n";
        }
      } catch {}
    }

    if (part.parts && Array.isArray(part.parts)) {
      for (const subPart of part.parts) {
        text += extractFromPart(subPart);
      }
    }

    return text;
  };

  body = extractFromPart(payload);
  return body.trim();
}

function shouldExcludeEmail(
  emailAddress: string,
  excludedEmails: string[]
): boolean {
  if (!excludedEmails || excludedEmails.length === 0) {
    return false;
  }

  const normalizedEmail = emailAddress.toLowerCase().trim();
  const extractedEmail =
    normalizedEmail.match(/<(.+)>/)?.[1] || normalizedEmail;

  return excludedEmails.some((excludedEmail) => {
    const normalizedExcluded = excludedEmail.toLowerCase().trim();

    if (extractedEmail === normalizedExcluded) {
      return true;
    }

    if (
      normalizedExcluded.startsWith("@") &&
      extractedEmail.endsWith(normalizedExcluded)
    ) {
      return true;
    }

    if (extractedEmail.includes(normalizedExcluded)) {
      return true;
    }

    return false;
  });
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const {
          startDate,
          endDate,
          excludedEmails = [],
          classificationThreshold = 0.5,
          jobLabels = [
            "applied",
            "rejected",
            "interview",
            "next-step",
            "offer",
          ],
        } = await request.json();

        // Validate required environment variables
        const requiredEnvVars = [
          "GOOGLE_CLIENT_ID",
          "GOOGLE_CLIENT_SECRET",
          "GOOGLE_REDIRECT_URI",
          "HUGGINGFACE_SPACE_URL",
        ];

        for (const envVar of requiredEnvVars) {
          if (!process.env[envVar]) {
            const error = {
              type: "error",
              message: `Server configuration error: ${envVar} not configured`,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(error)}\n\n`)
            );
            controller.close();
            return;
          }
        }

        // Validate input parameters
        if (!startDate || !endDate) {
          const error = {
            type: "error",
            message: "Start date and end date are required",
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(error)}\n\n`)
          );
          controller.close();
          return;
        }

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
          const error = { type: "error", message: "Invalid date format" };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(error)}\n\n`)
          );
          controller.close();
          return;
        }

        if (startDateObj >= endDateObj) {
          const error = {
            type: "error",
            message: "Start date must be before end date",
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(error)}\n\n`)
          );
          controller.close();
          return;
        }

        // Validate authentication
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("gmail_access_token")?.value;
        const refreshToken = cookieStore.get("gmail_refresh_token")?.value;

        if (!accessToken) {
          const error = { type: "error", message: "Authentication required" };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(error)}\n\n`)
          );
          controller.close();
          return;
        }

        sendProgress(encoder, controller, "Connecting to Gmail", 0, 100);

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

        sendProgress(encoder, controller, "Fetching emails", 5, 100);

        const query = `category:primary after:${Math.floor(
          startDateObj.getTime() / 1000
        )} before:${Math.floor(endDateObj.getTime() / 1000)}`;

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

          const fetchProgress = Math.min(
            15,
            5 + (allMessages.length / 100) * 10
          );
          sendProgress(
            encoder,
            controller,
            `Fetching emails (${allMessages.length} found)`,
            fetchProgress,
            100
          );
        } while (pageToken);

        sendProgress(
          encoder,
          controller,
          `Found ${allMessages.length} emails, processing...`,
          20,
          100
        );

        const emailsForClassification: Array<{
          text: string;
          id: string;
          metadata: EmailMetadata;
        }> = [];
        const excludedCount = { excluded: 0 };

        let processedCount = 0;
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
            const subject =
              headers.find((h) => h.name === "Subject")?.value || "";
            const date = new Date(Number.parseInt(email.internalDate));

            if (shouldExcludeEmail(from, excludedEmails)) {
              excludedCount.excluded++;
              continue;
            }

            const body = extractEmailBody(email.payload);
            const emailText = `${subject} ${body.substring(0, 5000)}`;

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

            processedCount++;

            if (
              processedCount % 10 === 0 ||
              processedCount === allMessages.length
            ) {
              const progress = 20 + (processedCount / allMessages.length) * 30;
              sendProgress(
                encoder,
                controller,
                `Processing email content (${processedCount}/${allMessages.length})`,
                progress,
                100
              );
            }
          } catch {
            continue;
          }
        }

        sendProgress(
          encoder,
          controller,
          "Starting email classification",
          50,
          100
        );

        const classifications = await classifyEmailsBatch(
          emailsForClassification,
          (current, total) => {
            const progress = 50 + (current / total) * 30;
            sendProgress(
              encoder,
              controller,
              `Classifying emails (${current}/${total})`,
              progress,
              100
            );
          }
        );

        sendProgress(
          encoder,
          controller,
          "Processing job applications",
          80,
          100
        );

        const processedApplications = [];
        let classifiedAsJob = 0;
        let classificationErrors = 0;

        let jobProcessedCount = 0;
        for (const emailData of emailsForClassification) {
          const classification = classifications.get(emailData.id);

          if (!classification || !classification.success) {
            classificationErrors++;
            continue;
          }

          if (
            !classification.label ||
            typeof classification.label !== "string"
          ) {
            classificationErrors++;
            continue;
          }

          const isJobRelated =
            jobLabels.includes(classification.label.toLowerCase()) &&
            classification.score >= classificationThreshold;

          if (isJobRelated) {
            classifiedAsJob++;

            const { from, subject, date, body, snippet } = emailData.metadata;
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

            jobProcessedCount++;

            if (
              jobProcessedCount % 5 === 0 ||
              jobProcessedCount === classifiedAsJob
            ) {
              const progress =
                80 + (jobProcessedCount / Math.max(classifiedAsJob, 1)) * 15;
              sendProgress(
                encoder,
                controller,
                `Processing job data (${jobProcessedCount}/${classifiedAsJob})`,
                progress,
                100
              );
            }
          }
        }

        sendProgress(encoder, controller, "Complete!", 100, 100);

        const result = {
          type: "complete",
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
            spaceUrl: process.env.HUGGINGFACE_SPACE_URL,
          },
        };

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(result)}\n\n`)
        );
        controller.close();
      } catch (error) {
        const errorResult = {
          type: "error",
          message: "Failed to process emails",
          details: error instanceof Error ? error.message : "Unknown error",
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(errorResult)}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
