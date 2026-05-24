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

        const session = await getServerSession(authOptions);
        const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

        const result = { ...settings };
        if (!isSuperAdmin) {
            // Scrub payment fields
            delete (result as any).usdtTrc20Address;
            delete (result as any).usdtTrc20Enabled;
            delete (result as any).usdtBep20Address;
            delete (result as any).usdtBep20Enabled;
            delete (result as any).btcAddress;
            delete (result as any).btcEnabled;
            delete (result as any).paypalEmail;
            delete (result as any).paypalEnabled;
            delete (result as any).paypalName;
            delete (result as any).cashappTag;
            delete (result as any).cashappEnabled;
            delete (result as any).cashappName;
            delete (result as any).venmoTag;
            delete (result as any).venmoEnabled;
            delete (result as any).venmoName;
            delete (result as any).zelleEmail;
            delete (result as any).zelleEnabled;
            delete (result as any).zelleName;
            delete (result as any).customCryptoMethods;
            delete (result as any).customStandardMethods;
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("[SETTINGS_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { 
            companyName, supportEmail, chatNotificationEmail, supportPhone, logoUrl, theme, 
            usdtTrc20Address, usdtTrc20Enabled, 
            usdtBep20Address, usdtBep20Enabled, 
            btcAddress, btcEnabled,
            paypalEmail, paypalEnabled, paypalName,
            cashappTag, cashappEnabled, cashappName,
            venmoTag, venmoEnabled, venmoName,
            zelleEmail, zelleEnabled, zelleName,
            customCryptoMethods, customStandardMethods
        } = body;

        const isSuperAdmin = session.user.role === 'SUPER_ADMIN';

        // Block non-SUPER_ADMINs from changing payment details
        if (!isSuperAdmin) {
            if (
                usdtTrc20Address !== undefined ||
                usdtTrc20Enabled !== undefined ||
                usdtBep20Address !== undefined ||
                usdtBep20Enabled !== undefined ||
                btcAddress !== undefined ||
                btcEnabled !== undefined ||
                paypalEmail !== undefined ||
                paypalEnabled !== undefined ||
                paypalName !== undefined ||
                cashappTag !== undefined ||
                cashappEnabled !== undefined ||
                cashappName !== undefined ||
                venmoTag !== undefined ||
                venmoEnabled !== undefined ||
                venmoName !== undefined ||
                zelleEmail !== undefined ||
                zelleEnabled !== undefined ||
                zelleName !== undefined ||
                customCryptoMethods !== undefined ||
                customStandardMethods !== undefined
            ) {
                return new NextResponse("Forbidden: Only SUPER_ADMIN can modify payment settings", { status: 403 });
            }
        }

        const settings = await prisma.siteSettings.upsert({
            where: { id: "default" },
            update: {
                companyName: companyName !== undefined ? companyName : undefined,
                supportEmail: supportEmail !== undefined ? supportEmail : undefined,
                chatNotificationEmail: chatNotificationEmail !== undefined ? chatNotificationEmail : undefined,
                supportPhone: supportPhone !== undefined ? supportPhone : undefined,
                logoUrl: logoUrl !== undefined ? logoUrl : undefined,
                theme: theme !== undefined ? theme : undefined,
                ...(isSuperAdmin ? {
                    usdtTrc20Address: usdtTrc20Address !== undefined ? usdtTrc20Address : undefined,
                    usdtTrc20Enabled: usdtTrc20Enabled !== undefined ? usdtTrc20Enabled : undefined,
                    usdtBep20Address: usdtBep20Address !== undefined ? usdtBep20Address : undefined,
                    usdtBep20Enabled: usdtBep20Enabled !== undefined ? usdtBep20Enabled : undefined,
                    btcAddress: btcAddress !== undefined ? btcAddress : undefined,
                    btcEnabled: btcEnabled !== undefined ? btcEnabled : undefined,
                    paypalEmail: paypalEmail !== undefined ? paypalEmail : undefined,
                    paypalEnabled: paypalEnabled !== undefined ? paypalEnabled : undefined,
                    paypalName: paypalName !== undefined ? paypalName : undefined,
                    cashappTag: cashappTag !== undefined ? cashappTag : undefined,
                    cashappEnabled: cashappEnabled !== undefined ? cashappEnabled : undefined,
                    cashappName: cashappName !== undefined ? cashappName : undefined,
                    venmoTag: venmoTag !== undefined ? venmoTag : undefined,
                    venmoEnabled: venmoEnabled !== undefined ? venmoEnabled : undefined,
                    venmoName: venmoName !== undefined ? venmoName : undefined,
                    zelleEmail: zelleEmail !== undefined ? zelleEmail : undefined,
                    zelleEnabled: zelleEnabled !== undefined ? zelleEnabled : undefined,
                    zelleName: zelleName !== undefined ? zelleName : undefined,
                    customCryptoMethods: customCryptoMethods !== undefined ? customCryptoMethods : undefined,
                    customStandardMethods: customStandardMethods !== undefined ? customStandardMethods : undefined
                } : {})
            } as any,
            create: {
                id: "default",
                companyName: companyName || "Atlas Logistics",
                supportEmail: supportEmail || "support@atlaslogistics.site",
                chatNotificationEmail: chatNotificationEmail || "",
                supportPhone: supportPhone || "",
                logoUrl: logoUrl || "",
                theme: theme || "dark",
                usdtTrc20Address: usdtTrc20Address || "",
                usdtTrc20Enabled: usdtTrc20Enabled !== undefined ? usdtTrc20Enabled : true,
                usdtBep20Address: usdtBep20Address || "",
                usdtBep20Enabled: usdtBep20Enabled !== undefined ? usdtBep20Enabled : true,
                btcAddress: btcAddress || "",
                btcEnabled: btcEnabled !== undefined ? btcEnabled : true,
                paypalEmail: paypalEmail || "",
                paypalEnabled: paypalEnabled || false,
                paypalName: paypalName || "",
                cashappTag: cashappTag || "",
                cashappEnabled: cashappEnabled || false,
                cashappName: cashappName || "",
                venmoTag: venmoTag || "",
                venmoEnabled: venmoEnabled || false,
                venmoName: venmoName || "",
                zelleEmail: zelleEmail || "",
                zelleEnabled: zelleEnabled || false,
                zelleName: zelleName || "",
                customCryptoMethods: customCryptoMethods || "[]",
                customStandardMethods: customStandardMethods || "[]"
            } as any
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error("[SETTINGS_PATCH]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
