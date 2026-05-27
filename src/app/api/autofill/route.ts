import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// This endpoint is called by the Chrome extension (Bearer token auth only)
// Returns all autofill data for the user
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const user = await prisma.user.findUnique({
      where: { apiToken: token },
      select: {
        name: true,
        email: true,
        currentRole: true,
        yearsExp: true,
        location: true,
        linkedinUrl: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        portfolioUrl: true,
        githubUrl: true,
        pronouns: true,
        skills: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Split name into first/last
    const nameParts = (user.name || "").trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName  = nameParts.slice(1).join(" ") || "";

    return NextResponse.json({
      firstName,
      lastName,
      fullName:     user.name || "",
      email:        user.email || "",
      phone:        user.phone || "",
      currentRole:  user.currentRole || "",
      yearsExp:     user.yearsExp || "",
      linkedinUrl:  user.linkedinUrl || "",
      portfolioUrl: user.portfolioUrl || "",
      githubUrl:    user.githubUrl || "",
      pronouns:     user.pronouns || "",
      skills:       user.skills || "",
      addressLine1: user.addressLine1 || "",
      addressLine2: user.addressLine2 || "",
      city:         user.city || "",
      state:        user.state || "",
      zipCode:      user.zipCode || "",
      country:      user.country || "United States",
      // Derived
      location:     user.location || [user.city, user.state].filter(Boolean).join(", "),
    });
  } catch (error) {
    console.error("GET /api/autofill error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
