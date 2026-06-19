import type { ApiErrorDetail } from "@/types/api/common";

export interface MockApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export type MockApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: MockApiError };

export class MockApiRequestError extends Error {
  readonly code: string;
  readonly details?: ApiErrorDetail[];

  constructor(error: MockApiError) {
    super(error.message);
    this.name = "MockApiRequestError";
    this.code = error.code;
    this.details = error.details;
  }
}

export function unwrapMockResponse<T>(response: MockApiResponse<T>): T {
  if (response.success) return response.data;
  throw new MockApiRequestError(response.error);
}
