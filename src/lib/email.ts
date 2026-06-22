/* eslint-disable */
import nodemailer from 'nodemailer';
import prisma from "@/lib/prisma";

// We generate FROM_EMAIL dynamically now

interface EmailParams {
    to: string;
    trackingNumber: string;
    status: string;
    location?: string;
    description?: string;
    receiverName?: string;
    senderName?: string;
    origin?: string;
    destination?: string;
    receiverAddress?: string;
    estimatedDelivery?: string;
    productDescription?: string;
    attachment?: { filename: string; content: Buffer };
    holdFee?: number | null;
    holdReason?: string | null;
}

interface MailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
}

const transporter = nodemailer.createTransport({
    host: 'smtp.tem.scaleway.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SCALEWAY_SMTP_USER || '',
        pass: process.env.SCALEWAY_SMTP_PASSWORD || '',
    },
});

export async function sendShipmentEmail({ to, trackingNumber, status, location, description, receiverName, senderName, origin, destination, receiverAddress, estimatedDelivery, productDescription, attachment, holdFee, holdReason }: EmailParams) {
    if (!process.env.SCALEWAY_SMTP_USER || !process.env.SCALEWAY_SMTP_PASSWORD) {
        console.warn('SCALEWAY_SMTP_USER or SCALEWAY_SMTP_PASSWORD is/are not set. Skipping email.');
        return;
    }

    try {
        
        
        const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
        const companyName = settings?.companyName || 'Atlas Logistics';
        const emailHeaderName = `${companyName} <${process.env.SCALEWAY_SENDER_EMAIL || 'noreply@yourdomain.com'}>`;
        const brandColor = settings?.emailBrandColor || '#2563eb';
        const headerBg = settings?.emailHeaderBg || '#0f172a';
        
        const trackingUrl = `${process.env.NEXTAUTH_URL}/track/${trackingNumber}`;
        const upperStatus = status.toUpperCase();
        let subject = `Shipment Update: ${trackingNumber} is ${status.replace(/_/g, ' ')}`;
        let bodyText = `Your shipment status has changed to: ${status.replace(/_/g, ' ')}`;

        const getStatusStyles = (s: string) => {
            switch (s.toUpperCase()) {
                case 'CREATED':
                case 'PENDING': return 'color: #ca8a04; background-color: #fefce8; border: 1px solid #fef08a;'; 
                case 'IN_TRANSIT': return `color: ${brandColor}; background-color: #eff6ff; border: 1px solid #bfdbfe;`;
                case 'ON_HOLD': return 'color: #ea580c; background-color: #fff7ed; border: 1px solid #fed7aa;';
                case 'OUT_FOR_DELIVERY': return 'color: #9333ea; background-color: #faf5ff; border: 1px solid #e9d5ff;';
                case 'DELIVERED': return 'color: #059669; background-color: #ecfdf5; border: 1px solid #a7f3d0;';
                case 'RETURNED': return 'color: #dc2626; background-color: #fef2f2; border: 1px solid #fecaca;';
                default: return `color: ${brandColor}; background-color: #eff6ff; border: 1px solid #bfdbfe;`; 
            }
        };

        // Core fallback/default email texts
        switch (upperStatus) {
            case 'CREATED':
                subject = `Shipment Confirmed: Tracking Number ${trackingNumber}`;
                bodyText = `We are pleased to confirm that we have received the billing and route details for your shipment. Your package is currently being processed at our origin facility and is being prepped for secure dispatch. You will receive another notification once the shipment is picked up and in transit.`;
                break;
            case 'PENDING':
                subject = `Awaiting Pickup: Shipment ${trackingNumber} - Status Update`;
                bodyText = `Your shipment status is now updated to Pending. This indicates that your package is scheduled for pickup by our courier team or is awaiting arrival at our local processing center. No action is required on your part at this time. Once the package has been scanned into our system, transit tracking will begin immediately.`;
                break;
            case 'IN_TRANSIT':
                subject = `In Transit: Tracking Update for Shipment ${trackingNumber}`;
                bodyText = `Your package is on its journey. It has departed from our regional logistics facility and is actively moving towards the destination. Our logistics network is tracking the shipment at every milestone to ensure secure transit. You can see the full route details and current location by clicking the tracking button below.`;
                break;
            case 'ON_HOLD':
                subject = `Important Update: Shipment ${trackingNumber} Placed on Hold`;
                bodyText = `Your shipment has been temporarily placed on hold. A hold state is typically applied when additional details (such as address verification or customs documentation) are required, or when storage fee reviews are pending. Please review the hold details and notice box below for instructions. If you need assistance resolving this hold, please click the tracking button and use the support chat to contact us.`;
                break;
            case 'OUT_FOR_DELIVERY':
                subject = `Out for Delivery: Expect your shipment today (${trackingNumber})`;
                bodyText = `Great news! Your package has been sorted, loaded onto a local delivery vehicle, and is out for delivery today. Our driver is scheduled to arrive at your destination address before end of day. If a signature is required, please ensure an authorized recipient is present to sign for the package.`;
                break;
            case 'DELIVERED':
                subject = `Delivered: Shipment ${trackingNumber} has arrived`;
                bodyText = `Your package has been successfully delivered! Our courier has confirmed drop-off at your specified address. If you cannot find the package, please check around your building entrance, mailroom, or neighbors, or contact our support team immediately via our chat box by clicking the link below.`;
                break;
            case 'RETURNED':
                subject = `Returned Notice: Shipment ${trackingNumber} returning to sender`;
                bodyText = `We were unable to complete the delivery of your shipment, and it is now being returned to the sender. Common reasons for return include invalid delivery address details, multiple failed delivery attempts, or package rejection at the destination. Please contact the sender or reach out to our logistics support team for details on re-routing or re-shipping.`;
                break;
        }

        // Apply custom templates if configured
        if (settings?.emailTemplates) {
            try {
                const templatesMap = JSON.parse(settings.emailTemplates);
                const template = templatesMap[upperStatus];
                
                const interpolateTemplate = (tpl: string) => {
                    if (!tpl) return '';
                    return tpl
                        .replace(/{trackingNumber}/g, trackingNumber || '')
                        .replace(/{receiverName}/g, receiverName || '')
                        .replace(/{senderName}/g, senderName || '')
                        .replace(/{origin}/g, origin || '')
                        .replace(/{destination}/g, destination || '')
                        .replace(/{receiverAddress}/g, receiverAddress || '')
                        .replace(/{estimatedDelivery}/g, estimatedDelivery || '')
                        .replace(/{status}/g, status.replace(/_/g, ' ') || '')
                        .replace(/{companyName}/g, companyName || '');
                };

                if (template) {
                    if (template.subject && template.subject.trim()) {
                        subject = interpolateTemplate(template.subject);
                    }
                    if (template.body && template.body.trim()) {
                        bodyText = interpolateTemplate(template.body);
                    }
                }
            } catch (e) {
                console.error("[EMAIL_TEMPLATE_PARSE_ERROR]", e);
            }
        }

        // Format newlines as HTML br tags
        const formattedBodyText = bodyText.replace(/\r?\n/g, '<br />');

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Shipment Update</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                                <!-- Header -->
                                <tr>
                                    <td align="center" style="background-color: ${headerBg}; padding: 40px 20px; border-bottom: 4px solid ${brandColor};">
                                        ${settings?.logoUrl 
                                            ? `<img src="${settings.logoUrl}" alt="${companyName}" style="height: 60px; max-width: 250px; object-fit: contain; display: block;" />`
                                            : `<div style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0;">${companyName}</div>`
                                        }
                                        <div style="color: #60a5fa; margin-top: 10px; font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">Freight & Logistics Service</div>
                                    </td>
                                </tr>
                                
                                <!-- Content Area -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">
                                            Hi ${receiverName || 'there'},
                                        </h2>
                                        
                                        <!-- Tracking & Status Card -->
                                        <div style="background-color: #f8fafc; border-left: 4px solid ${brandColor}; padding: 16px 20px; border-radius: 4px; margin-bottom: 24px;">
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td>
                                                        <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Tracking Number</p>
                                                        <p style="margin: 4px 0 0 0; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: 1px;">${trackingNumber}</p>
                                                    </td>
                                                    <td align="right" style="vertical-align: middle;">
                                                        <span style="display: inline-block; padding: 6px 16px; border-radius: 9999px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; ${getStatusStyles(status)}">
                                                            ${status.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>

                                        ${location ? `
                                            <div style="margin-bottom: 24px;">
                                                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a;">Location: ${location}</h3>
                                            </div>
                                        ` : ''}
                                        
                                        <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">
                                            ${formattedBodyText}
                                        </p>

                                        ${(status.toUpperCase() === 'ON_HOLD' || (holdFee !== undefined && holdFee !== null && holdFee > 0)) ? `
                                        <div style="background-color: #fff7ed; border: 2px solid #ea580c; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                                            <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #c2410c; font-weight: 700;">⚠️ ACTION REQUIRED: PACKAGE ON HOLD</h3>
                                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #7c2d12; line-height: 1.5;">
                                                Your package is currently on hold. Please note that a daily storage charge of <strong>$${holdFee || 0}</strong> will be applied for each day the package remains on hold.
                                            </p>
                                            ${holdReason ? `
                                            <div style="border-top: 1px dashed #fed7aa; padding-top: 12px; margin-top: 12px;">
                                                <strong style="display: block; color: #c2410c; font-size: 13px; text-transform: uppercase; margin-bottom: 4px;">Reason for Hold</strong>
                                                <p style="margin: 0; font-size: 14px; color: #9a3412;">${holdReason}</p>
                                            </div>
                                            ` : ''}
                                        </div>
                                        ` : ''}

                                        ${(status.toUpperCase() === 'CREATED' && (senderName || receiverAddress || origin || destination || estimatedDelivery)) ? `
                                        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                                            <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Shipment Details</h3>
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.6;">
                                                ${senderName ? `<tr><td style="color: #64748b; width: 100px; padding-bottom: 8px;">From:</td><td style="color: #0f172a; font-weight: 500; padding-bottom: 8px;">${senderName}</td></tr>` : ''}
                                                ${receiverAddress ? `<tr><td style="color: #64748b; width: 100px; padding-bottom: 8px; vertical-align: top;">To:</td><td style="color: #0f172a; font-weight: 500; padding-bottom: 8px;">${receiverAddress}</td></tr>` : ''}
                                                ${(origin && destination) ? `<tr><td style="color: #64748b; width: 100px; padding-bottom: 8px; vertical-align: top;">Route:</td><td style="color: #0f172a; font-weight: 500; padding-bottom: 8px;">${origin} &rarr; ${destination}</td></tr>` : ''}
                                                ${estimatedDelivery ? `<tr><td style="color: #64748b; width: 100px; padding-bottom: 12px; vertical-align: top;">Est. Delivery:</td><td style="color: #0f172a; font-weight: 500; padding-bottom: 12px;">${estimatedDelivery}</td></tr>` : ''}
                                                ${productDescription ? `<tr><td colspan="2" style="padding-top: 20px; border-top: 1px dashed #e2e8f0;"><div style="text-align: center; font-weight: 700; color: #0f172a; margin-bottom: 12px; font-size: 15px; letter-spacing: 0.5px; text-transform: uppercase;">Product Details</div><div style="color: #334155; font-weight: 400; text-align: left; white-space: pre-wrap; line-height: 1.7; background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #cbd5e1;">${productDescription}</div></td></tr>` : ''}
                                            </table>
                                        </div>
                                        ` : ''}
                                        
                                        ${description ? `
                                            <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; background-color: #f8fafc;">
                                                <strong style="display: block; color: #1e293b; font-size: 14px; margin-bottom: 6px;">Update Note</strong>
                                                <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">${description}</p>
                                            </div>
                                        ` : ''}
                                        
                                        <!-- CTA Button -->
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="${trackingUrl}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; border: 1px solid ${brandColor};">
                                                        Track Your Shipment
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td align="center" style="background-color: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0;">
                                        <p style="margin: 0; font-size: 13px; color: #64748b;">
                                            Thank you for choosing <strong style="color: #0f172a;">${companyName}</strong>.
                                        </p>
                                        <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                                            This is an automated status update for your active shipment (${trackingNumber}). Please do not reply directly to this email. For any queries, please visit our tracking portal or contact support.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        const replyToEmail = settings?.supportEmail || 'support@atlaslogistics.site';

        const mailOptions: MailOptions = {
            from: emailHeaderName,
            to: to,
            subject: subject,
            html: html,
            text: bodyText,
            replyTo: replyToEmail,
        };

        if (attachment) {
            mailOptions.attachments = [
                {
                    filename: attachment.filename,
                    content: attachment.content,
                    contentType: 'application/pdf'
                }
            ];
        }

        const info = await transporter.sendMail(mailOptions);

        console.log(`Email sent to ${to} for shipment ${trackingNumber}`, info.messageId);
        return info;
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

export async function sendPasswordResetEmail(to: string, resetCode: string) {
    if (!process.env.SCALEWAY_SMTP_USER || !process.env.SCALEWAY_SMTP_PASSWORD) {
        console.warn('SCALEWAY_SMTP_USER or SCALEWAY_SMTP_PASSWORD is/are not set. Skipping email.');
        return;
    }

    try {
        
        
        const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
        const companyName = settings?.companyName || 'Atlas Logistics';
        const emailHeaderName = `${companyName} <${process.env.SCALEWAY_SENDER_EMAIL || 'noreply@yourdomain.com'}>`;
        
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset Request</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                                <!-- Header -->
                                <tr>
                                    <td align="center" style="background-color: #0f172a; padding: 30px 20px;">
                                        ${settings?.logoUrl ? `<img src="${settings.logoUrl}" alt="${companyName} Logo" style="height: 60px; margin-bottom: 15px; display: block;" />` : ''}
                                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Password Reset</h1>
                                    </td>
                                </tr>
                                
                                <!-- Content Area -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">
                                            Reset Your Administrator Password
                                        </h2>
                                        
                                        <p style="font-size: 16px; line-height: 1.5; color: #334155; margin: 0 0 24px 0;">
                                            We received a request to securely reset your password for the <strong>${companyName}</strong> administrative panel. Please use the 6-digit code below to set a new password. If you did not make this request, you can safely ignore this email.
                                        </p>
                                        
                                        <!-- OTP Block -->
                                        <div style="margin: 30px 0; text-align: center; background-color: #f8fafc; padding: 24px; border-radius: 8px; border: 2px dashed #cbd5e1;">
                                            <span style="font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #0f172a; margin-left: 12px;">${resetCode}</span>
                                        </div>

                                        <p style="font-size: 13px; color: #64748b; margin: 30px 0 0 0; text-align: center;">
                                            For security reasons, this link will expire in exactly 1 hour.
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td align="center" style="background-color: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0;">
                                        <p style="margin: 0; font-size: 13px; color: #64748b;">
                                            &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        const replyToEmail = settings?.supportEmail || 'support@atlaslogistics.site';

        const mailOptions: MailOptions = {
            from: emailHeaderName,
            to: to,
            subject: 'Password Reset Sequence Initiated',
            html: html,
            text: `Hi administrator,\n\nWe received a request to securely reset your password for the ${companyName} administrative panel.\n\nPlease use the 6-digit code below to set a new password:\n\n${resetCode}\n\nFor security reasons, this link will expire in exactly 1 hour.\n\nIf you did not make this request, you can safely ignore this email.`,
            replyTo: replyToEmail,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Password Reset email sent securely to ${to}`, info.messageId);
        return info;
    } catch (error) {
        console.error('Failed to dispatch password reset email:', error);
    }
}

export async function sendChatNotification(to: string, trackingNumber: string, shipmentId: string, messageContent: string, isToAdmin: boolean) {
    if (!process.env.SCALEWAY_SMTP_USER || !process.env.SCALEWAY_SMTP_PASSWORD) {
        console.warn('SCALEWAY_SMTP_USER or SCALEWAY_SMTP_PASSWORD is/are not set. Skipping email.');
        return;
    }

    try {
        const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
        const companyName = settings?.companyName || 'Atlas Logistics';
        const emailHeaderName = `${companyName} <${process.env.SCALEWAY_SENDER_EMAIL || 'noreply@yourdomain.com'}>`;
        
        const actionUrl = isToAdmin 
            ? `${process.env.NEXTAUTH_URL}/admin/shipments/${shipmentId}`
            : `${process.env.NEXTAUTH_URL}/track/${trackingNumber}`;

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Chat Message</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                                <tr>
                                    <td align="center" style="background-color: #0f172a; padding: 30px 20px;">
                                        ${settings?.logoUrl ? `<img src="${settings.logoUrl}" alt="${companyName} Logo" style="height: 60px; margin-bottom: 15px; display: block;" />` : ''}
                                        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase;">New Message Received</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <p style="font-size: 16px; line-height: 1.5; color: #334155; margin: 0 0 20px 0;">
                                            ${isToAdmin ? 'A customer has replied to their shipment tracking thread.' : 'An administrator has replied to your tracking thread.'}
                                        </p>
                                        <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 4px; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; margin-bottom: 24px;">
                                            <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Tracking Number: ${trackingNumber}</p>
                                            <p style="margin: 12px 0 0 0; font-size: 15px; color: #0f172a; font-style: italic;">&quot;${messageContent}&quot;</p>
                                        </div>
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="${actionUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; border: 1px solid #1d4ed8;">
                                                        ${isToAdmin ? 'View in Dashboard' : 'Reply & Track'}
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="background-color: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0;">
                                        <p style="margin: 0; font-size: 13px; color: #64748b;">
                                            &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        const replyToEmail = settings?.supportEmail || 'support@atlaslogistics.site';

        const mailOptions: MailOptions = {
            from: emailHeaderName,
            to: to,
            subject: `New Message Regarding Shipment ${trackingNumber}`,
            html: html,
            text: `${isToAdmin ? 'A customer has replied to their shipment tracking thread.' : 'An administrator has replied to your tracking thread.'}\n\nTracking Number: ${trackingNumber}\n\n"${messageContent}"\n\nView details: ${actionUrl}`,
            replyTo: replyToEmail,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Chat notification sent securely config to ${to}`, info.messageId);
        return info;
    } catch (error) {
        console.error('Failed to dispatch chat notification email:', error);
    }
}

export interface PaymentEmailParams {
    to: string;
    trackingNumber: string;
    receiverName: string;
    holdBaseCharge: number;
    dailyFee: number;
    daysElapsed: number;
    totalStorageAccrued: number;
    totalDue: number;
    amountPaid: number;
    remainingBalance: number;
    holdReason?: string | null;
    newPaymentAmount?: number;
}

export async function sendPaymentNotificationEmail({
    to,
    trackingNumber,
    receiverName,
    holdBaseCharge,
    dailyFee,
    daysElapsed,
    totalStorageAccrued,
    totalDue,
    amountPaid,
    remainingBalance,
    holdReason,
    newPaymentAmount
}: PaymentEmailParams) {
    if (!process.env.SCALEWAY_SMTP_USER || !process.env.SCALEWAY_SMTP_PASSWORD) {
        console.warn('SCALEWAY_SMTP_USER or SCALEWAY_SMTP_PASSWORD is/are not set. Skipping email.');
        return;
    }

    try {
        const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
        const companyName = settings?.companyName || 'Atlas Logistics';
        const emailHeaderName = `${companyName} <${process.env.SCALEWAY_SENDER_EMAIL || 'noreply@yourdomain.com'}>`;
        
        const trackingUrl = `${process.env.NEXTAUTH_URL}/track/${trackingNumber}`;

        const isNewPayment = newPaymentAmount !== undefined && newPaymentAmount > 0;

        const subject = isNewPayment
            ? `Payment Receipt & Balance Statement: Shipment ${trackingNumber}`
            : `Storage Invoice & Balance Statement: Shipment ${trackingNumber}`;

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${isNewPayment ? 'Payment Received & Balance Statement' : 'Storage Invoice & Balance Statement'}</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                                <!-- Header -->
                                <tr>
                                    <td align="center" style="background-color: #0f172a; padding: 40px 20px; border-bottom: 4px solid #ea580c;">
                                        ${settings?.logoUrl 
                                            ? `<img src="${settings.logoUrl}" alt="${companyName}" style="height: 60px; max-width: 250px; object-fit: contain; display: block;" />`
                                            : `<div style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0;">${companyName}</div>`
                                        }
                                        <div style="color: #fdba74; margin-top: 10px; font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">Freight & Logistics Service</div>
                                    </td>
                                </tr>
                                
                                <!-- Content Area -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">
                                            Hi ${receiverName || 'there'},
                                        </h2>
                                        
                                        <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">
                                            ${isNewPayment 
                                                ? `We are writing to confirm that an installment payment of <strong>$${newPaymentAmount.toFixed(2)}</strong> has been credited to your shipment hold account. Below is the detailed statement showing your storage fees and remaining balance.`
                                                : amountPaid > 0
                                                    ? `We are writing to provide a statement reminder of the outstanding storage fees and remaining balance for your shipment. Below is the detailed breakdown of your account status (including your previous payment(s) of <strong>$${amountPaid.toFixed(2)}</strong>).`
                                                    : `We are writing to provide a statement reminder of the outstanding storage fees and remaining balance for your shipment. Below is the detailed breakdown of your account status.`
                                            }
                                        </p>

                                        <!-- Statement Breakdown Table -->
                                        <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                                            <h3 style="margin: 0 0 16px 0; font-size: 15px; color: #c2410c; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px dashed #fed7aa; padding-bottom: 8px;">
                                                Statement Account Details (Shipment ${trackingNumber})
                                            </h3>
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.6; color: #4a0404;">
                                                <tr>
                                                    <td style="padding: 6px 0; color: #7c2d12;">Base Hold / Clearance Charge:</td>
                                                    <td align="right" style="padding: 6px 0; font-weight: 600; color: #1e293b;">$${holdBaseCharge.toFixed(2)}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color: #7c2d12;">Daily Storage Rate:</td>
                                                    <td align="right" style="padding: 6px 0; font-weight: 600; color: #1e293b;">$${dailyFee.toFixed(2)} / day</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color: #7c2d12;">Days Elapsed on Hold:</td>
                                                    <td align="right" style="padding: 6px 0; font-weight: 600; color: #1e293b;">${daysElapsed} ${daysElapsed === 1 ? 'day' : 'days'}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color: #7c2d12; border-bottom: 1px solid #fed7aa; padding-bottom: 10px;">Accrued Storage Fees:</td>
                                                    <td align="right" style="padding: 6px 0; font-weight: 600; color: #1e293b; border-bottom: 1px solid #fed7aa; padding-bottom: 10px;">$${totalStorageAccrued.toFixed(2)}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 10px 0 6px 0; color: #7c2d12; font-weight: 600;">Total Amount Due:</td>
                                                    <td align="right" style="padding: 10px 0 6px 0; font-weight: 700; color: #0f172a;">$${totalDue.toFixed(2)}</td>
                                                </tr>
                                                ${isNewPayment && newPaymentAmount ? `
                                                <tr>
                                                    <td style="padding: 6px 0; color: #047857; font-weight: 600;">Current Installment Paid:</td>
                                                    <td align="right" style="padding: 6px 0; font-weight: 700; color: #047857;">-$${newPaymentAmount.toFixed(2)}</td>
                                                </tr>
                                                ` : ''}
                                                <tr>
                                                    <td style="padding: 6px 0; color: #047857; font-weight: 600; border-bottom: 2px solid #fed7aa; padding-bottom: 10px;">Total Paid to Date:</td>
                                                    <td align="right" style="padding: 6px 0; font-weight: 700; color: #047857; border-bottom: 2px solid #fed7aa; padding-bottom: 10px;">-$${amountPaid.toFixed(2)}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 12px 0 0 0; color: #c2410c; font-size: 16px; font-weight: 800;">Remaining Balance Due:</td>
                                                    <td align="right" style="padding: 12px 0 0 0; font-size: 18px; font-weight: 900; color: #ea580c;">$${remainingBalance.toFixed(2)}</td>
                                                </tr>
                                            </table>
                                        </div>

                                        ${holdReason ? `
                                        <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; background-color: #f8fafc;">
                                            <strong style="display: block; color: #1e293b; font-size: 14px; margin-bottom: 6px;">Hold Notice Details</strong>
                                            <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">${holdReason}</p>
                                        </div>
                                        ` : ''}
                                        
                                        <!-- CTA Button -->
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
                                            <tr>
                                                <td align="center">
                                                    <a href="${trackingUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; border: 1px solid #1d4ed8;">
                                                        Track Your Shipment
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td align="center" style="background-color: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0;">
                                        <p style="margin: 0; font-size: 13px; color: #64748b;">
                                            Thank you for choosing <strong style="color: #0f172a;">${companyName}</strong>.
                                        </p>
                                        <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                                            You are receiving this automated email because you have an active installment agreement for shipment tracking ${trackingNumber}. Please do not reply directly to this email. For any queries, please visit our tracking portal or contact support.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        const replyToEmail = settings?.supportEmail || 'support@atlaslogistics.site';

        const mailOptions: MailOptions = {
            from: emailHeaderName,
            to: to,
            subject: subject,
            html: html,
            text: `${isNewPayment 
                ? `We are writing to confirm that an installment payment of $${newPaymentAmount.toFixed(2)} has been credited to your shipment hold account.` 
                : `We are writing to provide a statement reminder of the outstanding storage fees and remaining balance for your shipment.`}\n\nTracking Number: ${trackingNumber}\nTotal Amount Due: $${totalDue.toFixed(2)}\nTotal Paid to Date: -$${amountPaid.toFixed(2)}\nRemaining Balance Due: $${remainingBalance.toFixed(2)}\n\nTrack your shipment: ${trackingUrl}`,
            replyTo: replyToEmail,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Payment statement email sent to ${to} for shipment ${trackingNumber}`, info.messageId);
        return info;
    } catch (error) {
        console.error('Failed to send payment statement email:', error);
    }
}
