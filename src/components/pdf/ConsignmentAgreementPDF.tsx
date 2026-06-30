import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
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
    slateDark: '#0f172a',     // Slate slate
    slateBlue: '#1e3a8a',     // Corporate Blue
    borderLight: '#cbd5e1',   // Light border
    text: '#1e293b',          // Primary text
    textMuted: '#475569',     // Secondary text
    white: '#ffffff',
    tealStamp: '#0284c7'      // Corporate Teal Stamp
};

const styles = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingBottom: 30,
        paddingHorizontal: 40,
        fontFamily: 'Times-Roman', // Classic serif legal font
        color: colors.text,
        backgroundColor: colors.white,
    },
    // Faded background watermark logo image
    watermarkImage: {
        position: 'absolute',
        top: 220,
        left: 122,
        width: 350,
        height: 350,
        opacity: 0.05,            // Extremely subtle background watermark
    },
    // Top Clean Header
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1.5,
        borderBottomColor: colors.slateBlue,
        paddingBottom: 10,
    },
    logoLeft: {
        width: 80,
        height: 40,
        objectFit: 'contain',
    },
    headerRightBlock: {
        alignItems: 'flex-end',
        textAlign: 'right',
    },
    headerTitle: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: colors.slateBlue,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    headerSubtitle: {
        fontSize: 8,
        fontFamily: 'Helvetica',
        color: colors.textMuted,
        marginTop: 2,
    },
    headerCompany: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: colors.slateDark,
        textTransform: 'uppercase',
    },

    // Reference details row
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
        color: colors.slateDark,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 4,
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

    // Shipper / Receiver Columns (Minimalist Cards)
    partiesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    partyCol: {
        width: '49%',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fafafa',
    },
    partyHeader: {
        fontSize: 8.5,
        fontFamily: 'Helvetica-Bold',
        color: colors.slateBlue,
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        paddingBottom: 3,
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    partyText: {
        fontSize: 8,
        lineHeight: 1.4,
        color: colors.text,
    },

    // Cargo Details Table
    table: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    tableHeader: {
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1.5,
        borderBottomColor: '#cbd5e1',
    },
    colLabel: {
        width: '35%',
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: colors.slateDark,
    },
    colVal: {
        width: '65%',
        fontSize: 8,
        fontFamily: 'Helvetica',
        color: colors.text,
    },

    // Carriage Terms & Clauses
    termsHeader: {
        fontSize: 8.5,
        fontFamily: 'Helvetica-Bold',
        color: colors.slateBlue,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    clauseText: {
        fontSize: 7.2,
        color: colors.textMuted,
        lineHeight: 1.35,
        marginBottom: 5,
        textAlign: 'justify',
    },

    // Bottom signatures & stamps block
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 15,
    },
    signBlock: {
        width: '31%',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
    },
    dottedLine: {
        fontSize: 8,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: 3,
    },
    signTitle: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        color: colors.slateDark,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    signLabel: {
        fontSize: 6,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: 1,
    },

    // Teal Corporate Approval Stamp Overlay
    tealStampContainer: {
        position: 'absolute',
        bottom: 12,
        left: -12,
        width: 95,
        height: 50,
        zIndex: 50,
        transform: 'rotate(-6deg)',
        opacity: 0.9,
    },
    stampFrame: {
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
        fontSize: 4.5,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    companyStampDate: {
        color: '#dc2626',
        fontSize: 6.5,
        fontFamily: 'Helvetica-Bold',
        marginVertical: 0.1,
    }
});

interface ConsignmentAgreementPDFProps {
    shipment: any;
    settings?: any;
    origin?: string;
    companyLogoBase64?: string;
}

const ConsignmentAgreementPDF: React.FC<ConsignmentAgreementPDFProps> = ({ shipment, settings, origin, companyLogoBase64 }) => {
    // Helper to format Consignment Reference
    const generateConsignmentRef = (org: string | null, dest: string | null, trk: string) => {
        const oCode = org ? org.substring(0, 3).toUpperCase() : 'ATL';
        const dCode = dest ? dest.substring(0, 3).toUpperCase() : 'DEST';
        return `${oCode}/${dCode}-${trk.substring(3, 9)}`;
    };

    // Parse Sender
    let senderName = 'N/A';
    let senderAddress = 'N/A';
    let senderPhone = 'N/A';
    let vehicleType = 'PREMIUM CARRIER';
    try {
        const parsedSend = JSON.parse(shipment.senderInfo || '{}');
        senderName = parsedSend.name || shipment.origin || 'N/A';
        senderAddress = parsedSend.address || 'N/A';
        senderPhone = parsedSend.phone || 'N/A';
        if (parsedSend.vehicleType === 'PLANE') vehicleType = 'AIR FREIGHT';
        if (parsedSend.vehicleType === 'TRUCK') vehicleType = 'SECURE LAND TRANSPORT';
        if (parsedSend.vehicleType === 'SHIP') vehicleType = 'CARGO CARRIER';
        if (parsedSend.vehicleType === 'TRAIN') vehicleType = 'RAIL LOGISTICS';
    } catch (e) {
        senderName = shipment.origin || 'N/A';
    }

    // Parse Receiver
    let receiverName = 'N/A';
    let receiverAddress = 'N/A';
    let receiverPhone = 'N/A';
    try {
        const parsedRec = JSON.parse(shipment.receiverInfo || '{}');
        receiverName = parsedRec.name || shipment.destination || 'N/A';
        receiverAddress = parsedRec.address || 'N/A';
        receiverPhone = parsedRec.phone || 'N/A';
    } catch (e) {
        receiverName = shipment.destination || 'N/A';
    }

    const consignmentRef = generateConsignmentRef(shipment.origin, shipment.destination, shipment.trackingNumber);
    const dateStr = new Date(shipment.createdAt).toLocaleDateString('en-GB');

    // Resolve fallback company logo from local disk if remote base64 resolution fails
    const fallbackLogoPath = origin ? `${origin}/images/cbp_right_seal.png` : getLocalImagePath('cbp_right_seal.png');
    
    // Choose the logo to display as watermark (prioritize base64 generated server-side)
    const watermarkSrc = companyLogoBase64 || fallbackLogoPath;

    // Stamp Image Frames (photorealistic overlays)
    const companyRectFramePath = origin ? `${origin}/images/company_rect_stamp_frame.png` : getLocalImagePath('company_rect_stamp_frame.png');

    return (
        <Document title={`CONSIGNMENT-AGREEMENT-${shipment.trackingNumber}`}>
            <Page size="A4" style={styles.page}>
                {/* Background Watermark (Company Logo Base64 or Fallback) */}
                {watermarkSrc ? (
                    <Image src={watermarkSrc} style={styles.watermarkImage} />
                ) : null}

                {/* Clean Header */}
                <View style={styles.headerRow}>
                    {watermarkSrc ? (
                        <Image src={watermarkSrc} style={styles.logoLeft} />
                    ) : (
                        <View style={styles.logoLeft} />
                    )}
                    <View style={styles.headerRightBlock}>
                        <Text style={styles.headerCompany}>{settings?.companyName || 'ATLAS LOGISTICS'}</Text>
                        <Text style={styles.headerTitle}>Consignment Agreement</Text>
                        <Text style={styles.headerSubtitle}>
                            Operations Support: {settings?.supportEmail || 'support@atlaslogistics.site'} • {' '}
                            Phone: {settings?.supportPhone || 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* References Block */}
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Agreement Ref:</Text>
                        <Text style={styles.metaValue}>{consignmentRef}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Waybill Number:</Text>
                        <Text style={styles.metaValue}>{shipment.trackingNumber}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Date of Agreement:</Text>
                        <Text style={styles.metaValue}>{dateStr}</Text>
                    </View>
                </View>

                {/* Shipper & Consignee Columns */}
                <View style={styles.partiesRow}>
                    <View style={styles.partyCol}>
                        <Text style={styles.partyHeader}>Consignor / Shipper</Text>
                        <Text style={styles.partyText}><Text style={{fontFamily:'Times-Bold'}}>Name:</Text> {senderName}</Text>
                        <Text style={styles.partyText}><Text style={{fontFamily:'Times-Bold'}}>Phone:</Text> {senderPhone}</Text>
                        <Text style={styles.partyText}><Text style={{fontFamily:'Times-Bold'}}>Address:</Text> {senderAddress}</Text>
                    </View>
                    <View style={styles.partyCol}>
                        <Text style={styles.partyHeader}>Consignee / Receiver</Text>
                        <Text style={styles.partyText}><Text style={{fontFamily:'Times-Bold'}}>Name:</Text> {receiverName}</Text>
                        <Text style={styles.partyText}><Text style={{fontFamily:'Times-Bold'}}>Phone:</Text> {receiverPhone}</Text>
                        <Text style={styles.partyText}><Text style={{fontFamily:'Times-Bold'}}>Address:</Text> {receiverAddress}</Text>
                    </View>
                </View>

                {/* Cargo Details Grid Table */}
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={styles.colLabel}>Specification / Metric</Text>
                        <Text style={styles.colVal}>Carriage Declaration Details</Text>
                    </View>
                    <View style={[styles.tableRow, { backgroundColor: '#ffffff' }]}>
                        <Text style={styles.colLabel}>Consignment Description</Text>
                        <Text style={styles.colVal}>{shipment.productDescription || 'Declared Merchandise Cargo'}</Text>
                    </View>
                    <View style={[styles.tableRow, { backgroundColor: '#f8fafc' }]}>
                        <Text style={styles.colLabel}>Transit Mode / Vehicle</Text>
                        <Text style={styles.colVal}>{vehicleType}</Text>
                    </View>
                    <View style={[styles.tableRow, { backgroundColor: '#ffffff' }]}>
                        <Text style={styles.colLabel}>Origin Port Hub</Text>
                        <Text style={styles.colVal}>{shipment.origin || 'N/A'}</Text>
                    </View>
                    <View style={[styles.tableRow, { backgroundColor: '#f8fafc' }]}>
                        <Text style={styles.colLabel}>Destination Port Hub</Text>
                        <Text style={styles.colVal}>{shipment.destination || 'N/A'}</Text>
                    </View>
                    <View style={[styles.tableRow, { backgroundColor: '#ffffff' }]}>
                        <Text style={styles.colLabel}>Carriage Status</Text>
                        <Text style={[styles.colVal, { fontFamily: 'Helvetica-Bold', color: '#0284c7' }]}>
                            CREATED
                        </Text>
                    </View>
                </View>

                {/* Contract Carriage Clauses */}
                <Text style={styles.termsHeader}>Standard Clauses & Terms of Carriage</Text>
                
                <Text style={styles.clauseText}>
                    <Text style={{fontFamily:'Times-Bold'}}>Section 1: Carrier Warranties.</Text> The Carrier agrees to transport the consignment specified in this agreement securely from the point of origin to the designated destination. The Carrier undertakes to maintain safety custody logs, specialized environmental controls (where required for precious cargo), and continuous trackable status reporting during all phases of carriage.
                </Text>

                <Text style={styles.clauseText}>
                    <Text style={{fontFamily:'Times-Bold'}}>Section 2: Shipper Representations.</Text> The Shipper warrants that all details provided regarding the consignment contents, weights, and declarations are accurate and in full compliance with international maritime, air, and border safety protocols. The shipper accepts full civil and legal responsibility for any declarations and clearing fees assessed during transit.
                </Text>

                <Text style={styles.clauseText}>
                    <Text style={{fontFamily:'Times-Bold'}}>Section 3: Carriage Guarantee.</Text> This agreement serves as the initial, binding carriage contract of Atlas Logistics. Both shipper and carrier accept all liability, standard carriage limits, insurance coverages, and logistics parameters detailed herein. Release for final delivery will be executed in accordance with active logistics terms.
                </Text>

                {/* Bottom Row containing Stamps and Signatures */}
                <View style={styles.bottomRow}>
                    {/* Left: Shipper Signature (dotted line for manual signature) */}
                    <View style={styles.signBlock}>
                        <Text style={styles.dottedLine}>....................................................</Text>
                        <Text style={styles.signTitle}>Shipper Signature</Text>
                        <Text style={styles.signLabel}>Consignor Authorised signee</Text>
                    </View>

                    {/* Center: Consignee Signature (dotted line for manual signature) */}
                    <View style={styles.signBlock}>
                        <Text style={styles.dottedLine}>....................................................</Text>
                        <Text style={styles.signTitle}>Consignee Signature</Text>
                        <Text style={styles.signLabel}>Receiver Authorised signee</Text>
                    </View>

                    {/* Right: Company Representative Signature (with Teal Approval Stamp overlay) */}
                    <View style={styles.signBlock}>
                        {/* Teal Approval Stamp overlapping the signature block */}
                        <View style={styles.tealStampContainer}>
                            {companyRectFramePath ? (
                                <Image src={companyRectFramePath} style={styles.stampFrame} />
                            ) : null}
                            <View style={styles.companyStampContent}>
                                <Text style={styles.companyStampText}>{settings?.companyName || 'ATLAS LOGISTICS'}</Text>
                                <Text style={[styles.companyStampText, { fontSize: 4.5, fontFamily: 'Helvetica' }]}>SECURITY DIVISION</Text>
                                <Text style={styles.companyStampDate}>APPROVED {dateStr}</Text>
                                <Text style={[styles.companyStampText, { fontSize: 4.5 }]}>PASSED FOR DELIVERY</Text>
                            </View>
                        </View>
                        
                        <View style={{ height: 12 }} />
                        <Text style={styles.dottedLine}>....................................................</Text>
                        <Text style={styles.signTitle}>Authorized Signature</Text>
                        <Text style={styles.signLabel}>Operations Director</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
};

export default ConsignmentAgreementPDF;
