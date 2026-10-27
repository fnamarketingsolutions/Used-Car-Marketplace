import { apiFetch } from "./client";

export type ReportCategory = "spam" | "fraud" | "inappropriate" | "other";

export type ReportStatus =
  | "pending"
  | "reviewed"
  | "actioned"
  | "dismissed";

export type MyReport = {
  _id: string;
  targetType?: "listing" | "user";
  category?: ReportCategory | string;
  reason?: string;
  details?: string;
  status?: ReportStatus | string;
  adminNote?: string | null;
  listing?: {
    _id?: string;
    make?: string;
    model?: string;
    variant?: string;
    manufacturingYear?: number;
    slug?: string;
    status?: string;
  } | null;
  reportedUser?: {
    _id?: string;
    fullName?: string;
    email?: string;
    accountStatus?: string;
  } | null;
  reviewedBy?: { fullName?: string; email?: string } | null;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string | null;
};

export type CreateReportPayload = {
  targetType: "listing" | "user";
  listingId?: string;
  userId?: string;
  category: ReportCategory;
  reason: string;
  details?: string;
};

export function createReport(payload: CreateReportPayload) {
  return apiFetch<{ message: string; report: MyReport }>("/api/reports", {
    method: "POST",
    json: payload,
  });
}

export function listMyReports() {
  return apiFetch<{ reports: MyReport[] }>("/api/reports/mine", {
    method: "GET",
  });
}
