 import { trackingService } from "@/lib/container"
 import { serverError, notFound } from "@/lib/api/responses"
 import { NextRequest } from "next/server"

 export async function GET(request: NextRequest, context: RouteContext<"/api/tracking/[id]">) {
   try {
     const { id } = await context.params;
     const tracking = await trackingService.getTracking(id);
     return tracking ? Response.json(tracking) : notFound("Donation not found");
   } catch (error) {
     return serverError(error);
   }
 }
