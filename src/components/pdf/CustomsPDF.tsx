import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';

// Helper function to resolve the absolute local path of the image on the server disk
const getLocalImagePath = (fileName: string) => {
    try {
        let filePath = path.join(process.cwd(), 'public', 'images', fileName);
        if (!fs.existsSync(filePath)) {
            filePath = path.join(process.cwd(), 'Atlaslogistics-main', 'public', 'images', fileName);
        }
        if (!fs.existsSync(filePath)) {
            filePath = path.join('c:\\Users\\Admin\\Desktop\\Atlaslogistics-main\\Atlaslogistics-main\\public\\images', fileName);
        }
        
        if (fs.existsSync(filePath)) {
            return filePath.replace(/\\/g, '/');
        } else {
            console.error(`Image file not found: ${fileName}`);
        }
    } catch (e) {
        console.error(`Failed to locate image: ${fileName}`, e);
    }
    return '';
};

const colors = {
    govDark: '#0f172a',      // Dark slate
    govBlue: '#1e3a8a',      // Official Navy Blue
    govRed: '#b91c1c',       // Red warning/clearance text
    text: '#1e293b',         // Slate text
    textMuted: '#475569',    // Slate secondary
    border: '#cbd5e1',       // Gray border
    white: '#ffffff'
};

const styles = StyleSheet.create({
    page: {
        paddingTop: 22,
        paddingBottom: 22,
        paddingHorizontal: 45,
        fontFamily: 'Times-Roman', // Official legal serif font
        color: colors.text,
        backgroundColor: colors.white,
    },
    // Faded background watermark seal image
    watermarkImage: {
        position: 'absolute',
        top: 220,
        left: 122,
        width: 350,
        height: 350,
        opacity: 0.11,            // Increased opacity for higher visibility
    },
    // Top Official Header
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#1e3a8a',
        paddingBottom: 5,
    },
    logoLeft: {
        width: 60,
        height: 60,
        objectFit: 'contain',
    },
    logoRight: {
        width: 60,
        height: 60,
        objectFit: 'contain',
    },
    headerCenter: {
        flex: 1,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    headerTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: colors.govBlue,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: colors.govDark,
        textTransform: 'uppercase',
        marginTop: 2,
        textAlign: 'center',
    },
    headerAddress: {
        fontSize: 6.5,
        fontFamily: 'Helvetica',
        color: colors.textMuted,
        marginTop: 2,
        textAlign: 'center',
        lineHeight: 1.2,
    },

    // Reference meta details row
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
        color: colors.govDark,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 3,
    },
    metaItem: {
        flexDirection: 'row',
    },
    metaLabel: {
        fontFamily: 'Times-Bold',
    },
    metaValue: {
        marginLeft: 4,
    },

    // Address & Stamps row block
    addressStampsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressColumn: {
        width: '55%',
    },
    stampsColumn: {
        width: '45%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    // Client/Attention box
    attentionBlock: {
        lineHeight: 1.2,
    },
    attentionLabel: {
        fontSize: 9,
        fontFamily: 'Times-Bold',
        color: colors.govDark,
    },
    attentionValue: {
        fontSize: 9,
        color: colors.text,
    },

    // CBP Admission Oval Stamp (Top Right)
    cbpStampContainer: {
        width: 125,
        height: 68,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'rotate(-4deg)',
    },
    cbpStampFrame: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    cbpStampContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 5, // Offset down slightly to sit perfectly centered inside the oval
    },
    cbpStampTextBlue: {
        color: '#1d4ed8',
        fontSize: 5.5,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    cbpStampAdmitted: {
        color: '#1d4ed8',
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 0.5,
        marginVertical: 0.2,
    },
    cbpStampTextRed: {
        color: '#dc2626', // Red stamp ink date
        fontSize: 9.5,
        fontFamily: 'Helvetica-Bold',
        marginVertical: 0.2,
    },

    // CBP Red rectangular stamp with image frame (Now Bottom Right)
    cbpRedStampContainer: {
        width: 110,
        height: 56,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'rotate(5deg)',
    },
    cbpRedStampFrame: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    cbpRedStampContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingTop: 1, // Balanced vertical layout
    },
    cbpRedStampText: {
        color: '#b91c1c',
        fontSize: 4.8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    cbpRedStampBold: {
        color: '#b91c1c',
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        marginVertical: 0.2,
        letterSpacing: 0.5,
    },

    // Company Clearance Stamp (Bottom Left)
    companyStampContainer: {
        width: 105,
        height: 56,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'rotate(-6deg)', // Slight left tilt for organic feel
    },
    companyStampFrame: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    companyStampContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        paddingTop: 1,
    },
    companyStampText: {
        color: '#0284c7',
        fontSize: 5,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    companyStampDate: {
        color: '#dc2626', // Red clearance date
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        marginVertical: 0.2,
    },

    // Warning Title
    titleBlock: {
        alignItems: 'center',
        marginBottom: 8,
    },
    titleText: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: colors.govRed,
        textTransform: 'uppercase',
        letterSpacing: 2,
        borderBottomWidth: 1.5,
        borderBottomColor: colors.govRed,
        paddingBottom: 2,
    },

    // Letter Body paragraphs - slightly more compact
    bodyParagraph: {
        fontSize: 8.5,
        color: colors.text,
        lineHeight: 1.3,
        marginBottom: 5,
        textAlign: 'justify',
    },

    // Items table
    table: {
        borderWidth: 1,
        borderColor: '#94a3b8',
        borderRadius: 4,
        overflow: 'hidden',
        marginVertical: 6,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingHorizontal: 10,
        paddingVertical: 2.2, // Very compact vertical height
    },
    tableHeader: {
        backgroundColor: '#f1f5f9',
        borderBottomWidth: 1.5,
        borderBottomColor: '#94a3b8',
    },
    colNum: {
        width: '8%',
        fontSize: 8,
        fontFamily: 'Helvetica',
    },
    colDesc: {
        width: '62%',
        fontSize: 8,
        fontFamily: 'Helvetica',
    },
    colCost: {
        width: '30%',
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'right',
    },
    totalRow: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: '#f8fafc',
    },
    totalLabel: {
        width: '70%',
        fontSize: 8.5,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'right',
    },
    totalValue: {
        width: '30%',
        fontSize: 8.5,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'right',
        color: colors.govRed,
    },

    // Bottom layout row containing Company Stamp, Signature, and CBP Secure Hold Stamp
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 10,
    },
    bottomLeftStamp: {
        width: '30%',
        alignItems: 'flex-start',
    },
    bottomCenterSign: {
        width: '40%',
        alignItems: 'center',
        textAlign: 'center',
    },
    bottomRightSeal: {
        width: '30%',
        alignItems: 'flex-end',
    },

    signatureLine: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: colors.govDark,
        marginBottom: 3,
        marginTop: 6,
    },
    signScript: {
        fontSize: 13,
        fontFamily: 'Times-Italic', // Serif italic looks like formal handwriting
        color: colors.govBlue,
        textAlign: 'center',
        marginBottom: -3,
    },
    signName: {
        fontSize: 8.5,
        fontFamily: 'Times-Bold',
        color: colors.govDark,
        textAlign: 'center',
    },
    signTitle: {
        fontSize: 6.5,
        color: colors.textMuted,
        textTransform: 'uppercase',
        lineHeight: 1.2,
        textAlign: 'center',
    }
});

interface CustomsPDFProps {
    shipment: any;
    settings?: any;
    origin?: string;
}

const CustomsPDF: React.FC<CustomsPDFProps> = ({ shipment, settings, origin }) => {
    // Parse Receiver Info
    let receiverName = 'N/A';
    let receiverAddress = 'N/A';
    try {
        const parsedRec = JSON.parse(shipment.receiverInfo || '{}');
        receiverName = parsedRec.name || shipment.destination || 'N/A';
        receiverAddress = parsedRec.address || 'N/A';
    } catch (e) {
        receiverName = shipment.destination || 'N/A';
    }

    // Parse Customs Data JSON from holdReason
    let customs = {
        isCustoms: true,
        ourRef: `CBP/REF-${shipment.trackingNumber.substring(0, 8)}`,
        yourRef: 'N/A',
        date: new Date().toLocaleDateString('en-GB'),
        reason: "The consignment has been placed on hold pending the settlement of the import processing, security, and clearance invoice.",
        paragraphs: [
            "This office is writing to you regarding the Custom Inspection and Clearance protocol. The CBP Custom Clearance Unit has intercepted your incoming consignment for thorough inspection. The package has been flagged pending proper security clearance and surety clearing validation.",
            "You are hereby notified that the policy of US Customs and Border Protection mandates that all incoming international packages must hold a valid corporate surety clearing tag or an approved clearance waiver. Your package is currently being held at our security facility and will not be released for final delivery until the outstanding custom clearance and administration duties are fully settled."
        ],
        items: [
            { name: "Customs Brokerage Entry Processing Fee", amount: 245.00 },
            { name: "Terminal Handling Charge", amount: 310.00 },
            { name: "Merchandise Processing Fee", amount: 614.35 },
            { name: "Single-Entry Customs Bond Fee", amount: 185.00 },
            { name: "Intensive Examination Site Transfer Fee", amount: 275.00 },
            { name: "Intensive Examination Handling Fee", amount: 395.00 },
            { name: "Airport Security Surcharge", amount: 150.00 },
            { name: "Insurance Liability Revalidation Fee", amount: 225.05 },
            { name: "High-Value Cargo Storage Fee", amount: 160.00 },
            { name: "Chain-of-Custody Integrity Verification Fee", amount: 295.00 },
            { name: "Digital Manifest and EDI Transmission Fee", amount: 180.00 },
            { name: "Port Security Oversight Fee", amount: 480.00 },
            { name: "High-Risk Commodity Handling Fee", amount: 575.00 },
            { name: "Armored Carrier Intake and Release Preparation Fee", amount: 400.00 },
            { name: "Administrative Consolidation and Processing Fee", amount: 1637.60 }
        ],
        timeLimit: "48 hours",
        signatoryName: "ANGELA. C",
        signatoryTitle: "CUSTOMS BORDER PROTECTION - DEPUTY DIRECTOR",
        stampDate: '',
        stampClass: 'RELEASED',
        companyStampDate: ''
    };

    const rawHoldReason = shipment.holdReason || "";
    if (rawHoldReason.startsWith('{"isCustoms"')) {
        try {
            const parsed = JSON.parse(rawHoldReason);
            customs = { ...customs, ...parsed };
        } catch (e) {
            console.error("Failed to parse customsData JSON from holdReason", e);
        }
    }

    // Compute total cost
    const totalCost = customs.items.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0);

    // Resolve dynamic web URLs or fallback absolute paths
    const leftLogoPath = origin ? `${origin}/images/cbp_bg_watermark.png` : getLocalImagePath('cbp_bg_watermark.png');
    const bgWatermarkPath = origin ? `${origin}/images/cbp_bg_watermark.png` : getLocalImagePath('cbp_bg_watermark.png');

    // Stamp Image Frames (photorealistic overlays)
    const cbpOvalFramePath = origin ? `${origin}/images/cbp_oval_stamp_frame.png` : getLocalImagePath('cbp_oval_stamp_frame.png');
    const cbpRedFramePath = origin ? `${origin}/images/cbp_rect_red_stamp_frame.png` : getLocalImagePath('cbp_rect_red_stamp_frame.png');
    const companyRectFramePath = origin ? `${origin}/images/company_rect_stamp_frame.png` : getLocalImagePath('company_rect_stamp_frame.png');

    // Header Right Logo: company logo if set in settings, fallback to standard right seal
    let rightLogoPath = '';
    if (settings?.logoUrl) {
        if (settings.logoUrl.startsWith('http')) {
            rightLogoPath = settings.logoUrl;
        } else {
            if (origin) {
                rightLogoPath = `${origin}${settings.logoUrl.startsWith('/') ? '' : '/'}${settings.logoUrl}`;
            } else {
                const localLogo = getLocalImagePath(path.basename(settings.logoUrl));
                if (localLogo) rightLogoPath = localLogo;
            }
        }
    }
    if (!rightLogoPath) {
        rightLogoPath = origin ? `${origin}/images/cbp_right_seal.png` : getLocalImagePath('cbp_right_seal.png');
    }

    return (
        <Document title={`CUSTOMS-DOC-${shipment.trackingNumber}`}>
            <Page size="A4" style={styles.page}>
                
                {/* Background Watermark Seal */}
                {bgWatermarkPath ? (
                    <Image src={bgWatermarkPath} style={styles.watermarkImage} />
                ) : null}

                {/* Gov Header */}
                <View style={styles.headerRow}>
                    {leftLogoPath ? (
                        <Image src={leftLogoPath} style={styles.logoLeft} />
                    ) : (
                        <View style={styles.logoLeft} />
                    )}
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>CUSTOMS AND BORDER PROTECTION(CBP)</Text>
                        <Text style={styles.headerSubtitle}>DEPARTMENT OF HOMELAND SECURITY</Text>
                        <Text style={styles.headerAddress}>
                            One World Trade Center, Suite 50.200, New York, NY 10007{'\n'}United States
                        </Text>
                    </View>
                    {rightLogoPath ? (
                        <Image src={rightLogoPath} style={styles.logoRight} />
                    ) : (
                        <View style={styles.logoRight} />
                    )}
                </View>

                {/* References Block */}
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Our Ref:</Text>
                        <Text style={styles.metaValue}>{customs.ourRef}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Your Ref:</Text>
                        <Text style={styles.metaValue}>{customs.yourRef || 'N/A'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Date:</Text>
                        <Text style={styles.metaValue}>{customs.date}</Text>
                    </View>
                </View>

                {/* Address & Dynamic CBP Oval Stamp layout */}
                <View style={styles.addressStampsRow}>
                    <View style={styles.addressColumn}>
                        <View style={styles.attentionBlock}>
                            <Text style={styles.attentionLabel}>Attention: {receiverName}</Text>
                            <Text style={styles.attentionValue}>Address: {receiverAddress}</Text>
                        </View>
                    </View>
                    <View style={styles.stampsColumn}>
                        {/* Dynamic CBP Admission Oval Stamp (Top Right - Image Frame + Text Overlay) */}
                        <View style={styles.cbpStampContainer}>
                            {cbpOvalFramePath ? (
                                <Image src={cbpOvalFramePath} style={styles.cbpStampFrame} />
                            ) : null}
                            <View style={styles.cbpStampContent}>
                                <Text style={styles.cbpStampAdmitted}>ADMITTED</Text>
                                <Text style={styles.cbpStampTextRed}>{customs.stampDate || customs.date}</Text>
                                <Text style={[styles.cbpStampTextBlue, { fontSize: 5, marginTop: 1 }]}>CLASS: {customs.stampClass || 'RELEASED'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Warning Red Title */}
                <View style={styles.titleBlock}>
                    <Text style={styles.titleText}>CLEARANCE REQUIREMENT</Text>
                </View>

                {/* Custom Body Paragraphs */}
                {customs.paragraphs.map((para, index) => (
                    <Text key={index} style={styles.bodyParagraph}>
                        {para}
                    </Text>
                ))}

                {/* Cost/Fee Items Table */}
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.colNum, { fontFamily: 'Helvetica-Bold' }]}>No.</Text>
                        <Text style={[styles.colDesc, { fontFamily: 'Helvetica-Bold' }]}>Custom Duty & Clearance Specifications</Text>
                        <Text style={[styles.colCost, { fontFamily: 'Helvetica-Bold' }]}>Amount (USD)</Text>
                    </View>

                    {customs.items.map((item: any, idx: number) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={styles.colNum}>{idx + 1}.</Text>
                            <Text style={styles.colDesc}>{item.name}</Text>
                            <Text style={styles.colCost}>${(parseFloat(item.amount) || 0).toFixed(2)}</Text>
                        </View>
                    ))}

                    <View style={totalRowStyle(customs.items.length)}>
                        <Text style={styles.totalLabel}>Total Balance Outstanding:</Text>
                        <Text style={styles.totalValue}>${totalCost.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Warning/Terms Footer */}
                <Text style={styles.bodyParagraph}>
                    The total clearance cost specified above must be paid in full to prevent custom confiscation. Failure to resolve this clearance requirement will authorize border agents to seize and inspect the consignment container contents and execute standard legal protocols.
                </Text>

                {customs.timeLimit && (
                    <Text style={[styles.bodyParagraph, { fontFamily: 'Times-Bold', color: colors.govRed, marginBottom: 4 }]}>
                        You have {customs.timeLimit} to settle this account.
                    </Text>
                )}

                {/* Bottom Row containing Company Stamp, Signature block, and CBP Red SECURE HOLD Stamp */}
                <View style={styles.bottomRow}>
                    {/* Left: Company Clearance Stamp (Image Frame + Text Overlay) */}
                    <View style={styles.bottomLeftStamp}>
                        <View style={styles.companyStampContainer}>
                            {companyRectFramePath ? (
                                <Image src={companyRectFramePath} style={styles.companyStampFrame} />
                            ) : null}
                            <View style={styles.companyStampContent}>
                                <Text style={styles.companyStampText}>{settings?.companyName || 'ATLAS LOGISTICS'}</Text>
                                <Text style={[styles.companyStampText, { fontSize: 4.5, fontFamily: 'Helvetica' }]}>SECURITY DIVISION</Text>
                                <Text style={styles.companyStampDate}>APPROVED {customs.companyStampDate || customs.date}</Text>
                                <Text style={[styles.companyStampText, { fontSize: 4.5 }]}>PASSED FOR DELIVERY</Text>
                            </View>
                        </View>
                    </View>

                    {/* Center: Signatory Block */}
                    <View style={styles.bottomCenterSign}>
                        <Text style={styles.signScript}>{customs.signatoryName}</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signName}>{customs.signatoryName}</Text>
                        <Text style={styles.signTitle}>{customs.signatoryTitle}</Text>
                    </View>

                    {/* Right: CBP Red SECURE HOLD Stamp (Image Frame + Text Overlay) */}
                    <View style={styles.bottomRightSeal}>
                        <View style={styles.cbpRedStampContainer}>
                            {cbpRedFramePath ? (
                                <Image src={cbpRedFramePath} style={styles.cbpRedStampFrame} />
                            ) : null}
                            <View style={styles.cbpRedStampContent}>
                                <Text style={styles.cbpRedStampText}>★ U.S. BORDER SECURITY ★</Text>
                                <Text style={[styles.cbpRedStampText, { fontSize: 4.2 }]}>PORT OF ENTRY - NY/NJ</Text>
                                <Text style={styles.cbpRedStampBold}>SECURE HOLD</Text>
                                <Text style={[styles.cbpRedStampText, { fontSize: 4.2 }]}>CBP DETENTION FACILITY</Text>
                            </View>
                        </View>
                    </View>
                </View>
                
            </Page>
        </Document>
    );
};

// Helper function to return compact style for final total row
const totalRowStyle = (length: number) => {
    return {
        flexDirection: 'row' as const,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: '#f8fafc',
        borderTopWidth: 1,
        borderTopColor: '#cbd5e1',
    };
};

export default CustomsPDF;
