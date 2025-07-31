const emailContent = `
Thank you for your recent application for the position of Developer ( 100 Store Support Center - Remote ) at Floor & Decor.
`;

const jobRegex =
  /(?:application for|applying for|position of|position as|role of|job title is|job as)\s+(?:the\s+)?(.+?)(?=\s+(?:role|at|with|from|to|in|for)\b|[\.\!])/;

const roleMatch = emailContent.match(jobRegex);

const extractedRole =
  roleMatch?.[1]?.replace(/\(.*?\)/g, "").trim() ?? "Unknown";

console.log("Extracted Role:", extractedRole);
