import { apiClient, unwrapApiResponse } from "@/api/client";
import { mockApi } from "@/api/mockApi";
import type { ContactQuery, CreateContactQueryInput } from "@/types/entities";

const isMockEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === "true" && process.env.NODE_ENV !== "production";
};

export const contactService = {
  submitQuery: async (input: CreateContactQueryInput): Promise<ContactQuery> => {
    try {
      return await unwrapApiResponse<ContactQuery>(apiClient.post("/contact", input));
    } catch (err: unknown) {
      if (isMockEnabled()) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn("Real contact endpoint unreachable; using dev mock fallback:", errorMsg);
        const res = await mockApi.contact.submit(input);
        if (res.success) {
          return res.data;
        }
      }
      throw err instanceof Error ? err : new Error("Failed to submit inquiry. Please try again later.");
    }
  },
};
