import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        let settings = await prisma.siteSettings.findUnique({
            where: { id: "default" }
        });

        // If not found, create the default singleton
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: { id: "default" }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("[SETTINGS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    // You can enforce SUPER_ADMIN strictly if you want, but for now any ADMIN can edit if you have a single team.
    // Let's protect the integrity by just ensuring they are logged in.
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { companyName, supportEmail, supportPhone, logoUrl } = body;

        const settings = await prisma.siteSettings.upsert({
            where: { id: "default" },
            update: {
                companyName: companyName !== undefined ? companyName : undefined,
                supportEmail: supportEmail !== undefined ? supportEmail : undefined,
                supportPhone: supportPhone !== undefined ? supportPhone : undefined,
                logoUrl: logoUrl !== undefined ? logoUrl : undefined
            },
            create: {
                id: "default",
                companyName: companyName || "Atlas Logistics",
                supportEmail: supportEmail || "support@atlaslogistics.site",
                supportPhone: supportPhone || "",
                logoUrl: logoUrl || ""
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error("[SETTINGS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
