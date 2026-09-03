 import { donationService } from "@/lib/container"
 import { serverError, notFound } from "@/lib/api/responses"
 import { NextRequest } from "next/server"
  
 export async function GET(request: NextRequest, context: RouteContext<"/api/donations/[id]">) {
   try {
     const { id } = await context.params;
     const donation = await donationService.getDonationDetail(id);
     return donation ? Response.json(donation) : notFound("Donation not found");
   } catch (error) {
     return serverError(error);
   }
 }