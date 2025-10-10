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

interface ExtractionResult {
  company: string;
  role: string;
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

async function classifyEmailsBatch(
  emails: Array<{ text: string; id: string }>,
  progressCallback?: (current: number, total: number) => void
): Promise<Map<string, ClassificationResult>> {
  const results = new Map<string, ClassificationResult>();
  const maxBatchSize = 400;

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

      const result = await client.predict("/classify_batch", {
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
  } catch (error) {
    throw new Error(
      `Classification failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  return results;
}

async function extractJobInfoBatch(
  emails: Array<{ text: string; id: string }>,
  progressCallback?: (current: number, total: number) => void
): Promise<Map<string, ExtractionResult>> {
  const results = new Map<string, ExtractionResult>();
  const maxBatchSize = 400;

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

      const result = await client.predict("/extract_batch", {
        emails_json: emailTextsJson,
      });

      const batchDataString = result.data as string;
      const batchData = JSON.parse(batchDataString);

      if (batchData.results && Array.isArray(batchData.results)) {
        batch.forEach((email, index) => {
          const result = batchData.results[index];
          if (result && result.success) {
            results.set(email.id, {
              company: result.company || "Unknown",
              role: result.role || "Unknown",
              success: true,
            });
          } else {
            results.set(email.id, {
              company: "Unknown",
              role: "Unknown",
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
  } catch (error) {
    throw new Error(
      `Extraction failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  return results;
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
            "next-phase",
            "offer",
          ],
        } = await request.json();

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
        const batchSize = 100;

        for (let i = 0; i < allMessages.length; i += batchSize) {
          const batch = allMessages.slice(i, i + batchSize);

          try {
            const boundary = `batch_${Math.random()
              .toString(36)
              .substr(2, 16)}`;
            let batchBody = "";

            batch.forEach((message, index) => {
              batchBody += `--${boundary}\r\n`;
              batchBody += `Content-Type: application/http\r\n`;
              batchBody += `Content-ID: <item${index}>\r\n\r\n`;
              batchBody += `GET /gmail/v1/users/me/messages/${message.id}?format=full\r\n\r\n`;
            });

            batchBody += `--${boundary}--\r\n`;

            const batchResponse = await oauth2Client.request({
              url: "https://gmail.googleapis.com/batch/gmail/v1",
              method: "POST",
              headers: {
                "Content-Type": `multipart/mixed; boundary=${boundary}`,
              },
              data: batchBody,
              responseType: "text",
            });

            const responseText =
              typeof batchResponse.data === "string"
                ? batchResponse.data
                : JSON.stringify(batchResponse.data);
            const parts = responseText.split(
              new RegExp(`--batch_[a-zA-Z0-9]+[\\r\\n-]*`)
            );

            for (const part of parts) {
              if (!part.trim() || !part.includes("HTTP/")) continue;

              try {
                const jsonMatch = part.match(/\{[\s\S]*\}/);
                if (!jsonMatch) continue;

                const email = JSON.parse(jsonMatch[0]) as GmailMessage;
                const headers = email.payload.headers || [];

                const from =
                  headers.find((h) => h.name === "From")?.value || "";
                const subject =
                  headers.find((h) => h.name === "Subject")?.value || "";
                const date = new Date(Number.parseInt(email.internalDate));

                if (shouldExcludeEmail(from, excludedEmails)) {
                  excludedCount.excluded++;
                  continue;
                }

                const body = extractEmailBody(email.payload);
                const emailText = `Subject: ${subject}\n\n${body.substring(
                  0,
                  1000
                )}`;

                emailsForClassification.push({
                  text: emailText,
                  id: email.id,
                  metadata: {
                    from,
                    subject,
                    date,
                    body,
                    snippet: email.snippet || "",
                  },
                });

                processedCount++;
              } catch {
                continue;
              }
            }

            const progress = 20 + (processedCount / allMessages.length) * 20;
            sendProgress(
              encoder,
              controller,
              `Processing email content (${processedCount}/${allMessages.length})`,
              progress,
              100
            );
          } catch (batchError) {
            console.error("Batch processing error:", batchError);
            continue;
          }
        }

        sendProgress(encoder, controller, "Classifying emails", 40, 100);

        const classifications = await classifyEmailsBatch(
          emailsForClassification,
          (current, total) => {
            const progress = 40 + (current / total) * 20;
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
          "Filtering job-related emails",
          60,
          100
        );

        const jobRelatedEmails: Array<{
          text: string;
          id: string;
          metadata: EmailMetadata;
        }> = [];
        let classifiedAsJob = 0;
        let classificationErrors = 0;

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
            jobRelatedEmails.push(emailData);
          }
        }

        sendProgress(
          encoder,
          controller,
          `Extracting job info from ${classifiedAsJob} job-related emails`,
          70,
          100
        );

        const extractions = await extractJobInfoBatch(
          jobRelatedEmails,
          (current, total) => {
            const progress = 70 + (current / total) * 20;
            sendProgress(
              encoder,
              controller,
              `Extracting job info (${current}/${total})`,
              progress,
              100
            );
          }
        );

        sendProgress(encoder, controller, "Building results", 90, 100);

        const processedApplications = [];
        let extractionErrors = 0;

        for (const emailData of jobRelatedEmails) {
          const classification = classifications.get(emailData.id);
          const extraction = extractions.get(emailData.id);

          if (!extraction || !extraction.success) {
            extractionErrors++;
          }

          const { from, subject, date, body, snippet } = emailData.metadata;

          processedApplications.push({
            id: `gmail-${emailData.id}`,
            company: extraction?.company || "Unknown",
            role: extraction?.role || "Unknown",
            status: classification?.label.toLowerCase() || "other",
            email: from.match(/<(.+)>/)?.[1] || from,
            date: date.toISOString(),
            subject: subject,
            bodyPreview: body.substring(0, 200),
            classification: {
              label: classification?.label || "unknown",
              confidence: classification?.score || 0,
            },
          });
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
          extractionErrors: extractionErrors,
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
