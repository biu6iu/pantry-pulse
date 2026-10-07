import { NextRequest } from "next/server";
import { donationService } from "@/lib/container";
import { serverError, badRequest } from "@/lib/api/responses";
import { parseDonationFilters } from "@/lib/api/filters";

export async function GET(request: NextRequest) {
  try {
    const parsed = parseDonationFilters(request.nextUrl.searchParams);
    if (!parsed.ok) {
      return badRequest(parsed.error);
    }

    return Response.json(await donationService.listDonations(parsed.filters));
  } catch (error) {
    return serverError(error);
  }
}
