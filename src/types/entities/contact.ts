export type ContactQueryStatus = "PENDING" | "RESOLVED" | "ARCHIVED";

export interface ContactQuery {
  id: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  email: string;
  message: string;
  status: ContactQueryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactQueryInput {
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  email: string;
  message: string;
}

export interface AdminQueryInput {
  firstName: string;
  lastName?: string;
  countryCode?: string;
  phone: string;
  email: string;
  message: string;
  status?: ContactQueryStatus;
}

