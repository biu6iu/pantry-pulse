import { donationService } from "@/lib/container";
import { serverError } from "@/lib/api/responses";

export async function GET() {
   try {
     return Response.json(await donationService.listDonations());
   } catch (error) {
     return serverError(error);
   }
 }