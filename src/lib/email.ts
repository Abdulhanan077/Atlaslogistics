import nodemailer from 'nodemailer';

// Use Atlas Logistics as the sender name in the 'From' field
const FROM_EMAIL = `Atlas Logistics <${process.env.SCALEWAY_SENDER_EMAIL || 'noreply@yourdomain.com'}>`;

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

export async function sendShipmentEmail({ to, trackingNumber, status, location, description, receiverName, senderName, origin, destination, receiverAddress, estimatedDelivery, productDescription, attachment }: EmailParams) {
    if (!process.env.SCALEWAY_SMTP_USER || !process.env.SCALEWAY_SMTP_PASSWORD) {
        console.warn('SCALEWAY_SMTP_USER or SCALEWAY_SMTP_PASSWORD is/are not set. Skipping email.');
        return;
    }

    try {
        const trackingUrl = `${process.env.NEXTAUTH_URL}/track/${trackingNumber}`;
        const isCreated = status.toUpperCase() === 'CREATED' || status.toUpperCase() === 'CREATED';
        
        // Formatted subject based on status
        const subject = isCreated 
            ? `Your Shipment Has Been Created: ${trackingNumber}`
            : `Shipment Update: ${trackingNumber} is ${status.replace(/_/g, ' ')}`;

        const getStatusStyles = (s: string) => {
            switch (s.toUpperCase()) {
                case 'CREATED': return 'color: #ca8a04; background-color: #fefce8; border: 1px solid #fef08a;'; 
                case 'IN_TRANSIT': return 'color: #2563eb; background-color: #eff6ff; border: 1px solid #bfdbfe;';
                case 'ON_HOLD': return 'color: #ea580c; background-color: #fff7ed; border: 1px solid #fed7aa;';
                case 'OUT_FOR_DELIVERY': return 'color: #9333ea; background-color: #faf5ff; border: 1px solid #e9d5ff;';
                case 'DELIVERED': return 'color: #059669; background-color: #ecfdf5; border: 1px solid #a7f3d0;';
                case 'RETURNED': return 'color: #dc2626; background-color: #fef2f2; border: 1px solid #fecaca;';
                default: return 'color: #2563eb; background-color: #eff6ff; border: 1px solid #bfdbfe;'; 
            }
        };

        // Formatted body text based on status
        const statusText = isCreated
            ? `A new shipment has been created and is now being processed.`
            : `Your shipment status has changed to: <span style="display: inline-block; padding: 4px 12px; margin-left: 4px; border-radius: 9999px; font-weight: 700; font-size: 14px; text-transform: uppercase; ${getStatusStyles(status)}">${status.replace(/_/g, ' ')}</span>`;

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
                                    <td align="center" style="background-color: #0f172a; padding: 30px 20px;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Atlas Logistics</h1>
                                        <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Premium Delivery Network</p>
                                    </td>
                                </tr>
                                
                                <!-- Content Area -->
                                <tr>
                                    <td style="padding: 40px 30px;">
                                        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">
                                            Hi ${receiverName || 'there'},<br><br>
                                            ${isCreated ? 'Shipment Confirmed' : 'Shipment Update'}
                                        </h2>
                                        
                                        <!-- Tracking Card -->
                                        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 4px; margin-bottom: 24px;">
                                            <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Tracking Number</p>
                                            <p style="margin: 6px 0 0 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: 1px;">${trackingNumber}</p>
                                        </div>

                                        ${location ? `
                                            <div style="margin-bottom: 24px;">
                                                <h3 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a;">Location: ${location}</h3>
                                            </div>
                                        ` : ''}
                                        
                                        <p style="font-size: 16px; line-height: 1.5; color: #334155; margin: 0 0 24px 0;">
                                            ${statusText}
                                        </p>

                                        ${isCreated ? `
                                        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                                            <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Shipment Details</h3>
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.6;">
                                                ${senderName ? `<tr><td style="color: #64748b; width: 100px; padding-bottom: 8px;">From:</td><td style="color: #0f172a; font-weight: 500; padding-bottom: 8px;">${senderName}</td></tr>` : ''}
                                                ${receiverAddress ? `<tr><td style="color: #64748b; width: 100px; padding-bottom: 8px; vertical-align: top;">To:</td><td style="color: #0f172a; font-weight: 500; padding-bottom: 8px;">${receiverAddress}</td></tr>` : ''}
                                                ${(origin && destination) ? `<tr><td style="color: #64748b; width: 100px; padding-bottom: 8px; vertical-align: top;">Route:</td><td style="color: #0f172a; font-weight: 500; padding-bottom: 8px;">${origin} &rarr; ${destination}</td></tr>` : ''}
                                                ${estimatedDelivery ? `<tr><td style="color: #64748b; width: 100px; padding-bottom: 4px; vertical-align: top;">Est. Delivery:</td><td style="color: #0f172a; font-weight: 500; padding-bottom: 4px;">${estimatedDelivery}</td></tr>` : ''}
                                                ${productDescription ? `<tr><td style="color: #64748b; width: 100px; padding-top: 8px; vertical-align: top; border-top: 1px dashed #e2e8f0;">Product Details:</td><td style="color: #0f172a; font-weight: 500; padding-top: 8px; border-top: 1px dashed #e2e8f0; white-space: pre-wrap;">${productDescription}</td></tr>` : ''}
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
                                            Thank you for choosing <strong style="color: #0f172a;">Atlas Logistics</strong>.
                                        </p>
                                        <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">
                                            This is an automated message. Please do not reply to this email.
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

        const mailOptions: any = {
            from: FROM_EMAIL,
            to: to,
            subject: subject,
            html: html,
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
