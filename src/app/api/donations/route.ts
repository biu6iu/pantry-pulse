import { NextRequest } from "next/server";
import { donationService } from "@/lib/container";
import { serverError, badRequest } from "@/lib/api/responses";
import { DonationFilters } from "@/lib/repositories/donation.repository.interface";

const VALID_STATUSES = ["OPEN", "COMPLETED"];

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const filters: DonationFilters = {};

    const status = params.get("status");
    if (status !== null) {
      const normalised = status.toUpperCase();
      
      if (!VALID_STATUSES.includes(normalised)) {
        return badRequest(`Invalid status: ${status}`);
      }
      filters.status = normalised as "OPEN" | "COMPLETED";
    }

    const recipientId = params.get("recipientId");
    if (recipientId !== null) {
      if (recipientId.trim() === "") {
        return badRequest("recipientId must not be empty");
      }
      filters.recipientId = recipientId;
    }

    const from = params.get("from");
    if (from !== null) {
      const date = new Date(from);
      if (Number.isNaN(date.getTime())) {
        return badRequest(`Invalid from date: ${from}`);
      }
      filters.from = date;
    }

    const to = params.get("to");
    if (to !== null) {
      const date = new Date(to);
      if (Number.isNaN(date.getTime())) {
        return badRequest(`Invalid to date: ${to}`);
      }
      filters.to = date;
    }

    const limit = params.get("limit");
    if (limit !== null) {
      const parsed = Number(limit);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return badRequest(`Invalid limit: ${limit}`);
      }
      filters.limit = parsed;
    }

    const offset = params.get("offset");
    if (offset !== null) {
      const parsed = Number(offset);
      if (!Number.isInteger(parsed) || parsed < 0) {
        return badRequest(`Invalid offset: ${offset}`);
      }
      filters.offset = parsed;
    }

    return Response.json(await donationService.listDonations(filters));
  } catch (error) {
    return serverError(error);
  }
}
