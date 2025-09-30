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

    // Domain match
    if (
      normalizedExcluded.startsWith("@") &&
      extractedEmail.endsWith(normalizedExcluded)
    ) {
      return true;
    }

    if (normalizedExcluded.startsWith("*@")) {
      const domain = normalizedExcluded.substring(2);
      return extractedEmail.endsWith(`@${domain}`);
    }

    // Contains match
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
            return state;
          }

          const newExcludedEmails = [...state.excludedEmails, trimmedEmail];

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
      partialize: (state) => ({
        excludedEmails: state.excludedEmails,
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
      const emailMatch = app.email.match(/<(.+)>/);
      return emailMatch ? emailMatch[1].toLowerCase() : app.email.toLowerCase();
    })
    .filter((email, index, arr) => arr.indexOf(email) === index)
    .filter((email) => !excludedEmails.includes(email));
};
