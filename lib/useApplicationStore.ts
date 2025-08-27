import { create } from "zustand";
import { persist } from "zustand/middleware";

export type JobStatus =
  | "applied"
  | "rejected"
  | "interview"
  | "next-phase"
  | "offer"
  | "withdrawn";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  email: string;
  date: Date;
  subject: string;
}

interface ApplicationStore {
  applications: JobApplication[];
  startDate: Date | undefined;
  endDate: Date | undefined;
  excludedEmails: string[];
  setApplications: (apps: JobApplication[]) => void;
  addApplications: (apps: JobApplication[]) => void;
  removeApplications: (ids: string[]) => void;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  setDateRange: (
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => void;
  addExcludedEmail: (email: string) => void;
  removeExcludedEmail: (email: string) => void;
  setExcludedEmails: (emails: string[]) => void;
  clearExcludedEmails: () => void;
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
  const extractedEmail =
    normalizedEmail.match(/<(.+)>/)?.[1] || normalizedEmail;

  return excludedEmails.some((excludedEmail) => {
    const normalizedExcluded = excludedEmail.toLowerCase().trim();

    // Exact match
    if (extractedEmail === normalizedExcluded) {
      return true;
    }

    // Domain match (starts with @)
    if (
      normalizedExcluded.startsWith("@") &&
      extractedEmail.endsWith(normalizedExcluded)
    ) {
      return true;
    }

    // Wildcard domain (*@domain.com)
    if (normalizedExcluded.startsWith("*@")) {
      const domain = normalizedExcluded.substring(2);
      return extractedEmail.endsWith(`@${domain}`);
    }

    // Contains match (for partial matching)
    if (extractedEmail.includes(normalizedExcluded)) {
      return true;
    }

    return false;
  });
}

export const useApplicationStore = create<ApplicationStore>()(
  persist(
    (set) => ({
      applications: [],
      startDate: undefined,
      endDate: undefined,
      excludedEmails: [],

      setApplications: (apps) => set({ applications: apps }),

      addApplications: (newApps) =>
        set((state) => {
          const existingIds = new Set(state.applications.map((a) => a.id));
          // Filter out duplicates and excluded emails
          const deduped = newApps
            .filter((a) => !existingIds.has(a.id))
            .filter((a) => !shouldExcludeEmail(a.email, state.excludedEmails));

          return { applications: [...state.applications, ...deduped] };
        }),

      removeApplications: (ids) =>
        set((state) => ({
          applications: state.applications.filter(
            (app) => !ids.includes(app.id)
          ),
        })),

      setStartDate: (date) => set({ startDate: date }),
      setEndDate: (date) => set({ endDate: date }),
      setDateRange: (startDate, endDate) => set({ startDate, endDate }),

      addExcludedEmail: (email) =>
        set((state) => {
          const trimmedEmail = email.trim().toLowerCase();
          if (state.excludedEmails.includes(trimmedEmail)) {
            return state; // No change if already exists
          }

          const newExcludedEmails = [...state.excludedEmails, trimmedEmail];

          // Remove applications that match the new exclusion
          const filteredApplications = state.applications.filter(
            (app) => !shouldExcludeEmail(app.email, [trimmedEmail])
          );

          return {
            excludedEmails: newExcludedEmails,
            applications: filteredApplications,
          };
        }),

      removeExcludedEmail: (email) =>
        set((state) => ({
          excludedEmails: state.excludedEmails.filter((e) => e !== email),
        })),

      setExcludedEmails: (emails) =>
        set((state) => {
          const newExcludedEmails = [
            ...new Set(emails.map((e) => e.trim().toLowerCase())),
          ];

          // Filter existing applications based on all exclusions
          const filteredApplications = state.applications.filter(
            (app) => !shouldExcludeEmail(app.email, newExcludedEmails)
          );

          return {
            excludedEmails: newExcludedEmails,
            applications: filteredApplications,
          };
        }),

      clearExcludedEmails: () => set({ excludedEmails: [] }),
    }),
    {
      name: "job-application-storage",
      // Only persist certain fields to avoid issues with Date objects
      partialize: (state) => ({
        excludedEmails: state.excludedEmails,
        // Don't persist applications as they contain Date objects
        // and should be refreshed from API calls
      }),
    }
  )
);

// Helper hook for getting unique emails from applications
export const useUniqueEmails = () => {
  const applications = useApplicationStore((state) => state.applications);
  const excludedEmails = useApplicationStore((state) => state.excludedEmails);

  return applications
    .map((app) => {
      // Extract email from "Name <email@domain.com>" format if needed
      const emailMatch = app.email.match(/<(.+)>/);
      return emailMatch ? emailMatch[1].toLowerCase() : app.email.toLowerCase();
    })
    .filter((email, index, arr) => arr.indexOf(email) === index) // Remove duplicates
    .filter((email) => !excludedEmails.includes(email)); // Filter out excluded
};
