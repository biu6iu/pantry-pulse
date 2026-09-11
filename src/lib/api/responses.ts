 export function notFound(message: string): Response {
   return Response.json({ error: message }, { status: 404 });
 }

 export function serverError(error: unknown): Response {
   console.error(error);
   return Response.json({ error: "Internal server error" }, { status: 500 });
 }
