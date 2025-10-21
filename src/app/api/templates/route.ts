import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "../../../../auth";


export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const templates = await prisma.template.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, role, experienceLevel, description } = body;

    if (!name || !role || !experienceLevel) {
      return NextResponse.json(
        { success: false, error: "Name, role, and experience level are required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        role,
        experienceLevel,
        description: description || "",
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error("Failed to create template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create template" },
      { status: 500 }
    );
  }
}


export async function DELETE(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      );
    }

    await prisma.template.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete template" },
      { status: 500 }
    );
  }
}