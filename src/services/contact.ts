import { apiClient, unwrapApiResponse } from "@/api/client";
import { mockApi } from "@/api/mockApi";
import type { ContactQuery, CreateContactQueryInput } from "@/types/entities";

export const contactService = {
  submitQuery: async (input: CreateContactQueryInput): Promise<ContactQuery> => {
    try {
      return await unwrapApiResponse<ContactQuery>(apiClient.post("/contact", input));
    } catch (err) {
      // Graceful fallback to mock API if server/network is offline
      console.warn("Real contact endpoint unreachable, using mock fallback:", err);
      const res = await mockApi.contact.submit(input);
      if (res.success) {
        return res.data;
      }
      throw new Error(res.error.message || "Failed to submit query");
    }
  },
};
