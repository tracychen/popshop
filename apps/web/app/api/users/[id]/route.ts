import { NextRequest } from "next/server";
import { prisma } from "@starter/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.id !== params.id) {
    return new Response(null, { status: 403 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    });
    return new Response(JSON.stringify(user));
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}
