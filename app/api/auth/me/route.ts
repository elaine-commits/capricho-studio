import { authorize, failure } from "../../../../lib/auth";
export async function GET() {
  try {
    return Response.json(await authorize());
  } catch (e) {
    return failure(e);
  }
}
