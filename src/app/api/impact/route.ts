import { impactService } from "@/lib/container";
import { serverError } from "@/lib/api/responses";

export async function GET() {
   try {
     return Response.json(await impactService.getImpactReport());
   } catch (error) {
     return serverError(error);
   }
 }