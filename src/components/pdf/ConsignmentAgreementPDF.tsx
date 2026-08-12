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

const getLocalImageAsBase64 = (fileName: string): string => {
    try {
        const localPath = getLocalImagePath(fileName);
        if (localPath && fs.existsSync(localPath)) {
            const buffer = fs.readFileSync(localPath);
            const ext = path.extname(localPath).substring(1);
            return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${buffer.toString('base64')}`;
        }
    } catch (e) {
        console.error(`Failed to convert local image to base64: ${fileName}`, e);
    }
    return '';
};

// Robust local font file path resolution
let fontPath = path.join(process.cwd(), 'public', 'fonts', 'DancingScript-Regular.ttf');
if (!fs.existsSync(fontPath)) {
    fontPath = path.join(process.cwd(), 'Atlaslogistics-main', 'public', 'fonts', 'DancingScript-Regular.ttf');
}
if (!fs.existsSync(fontPath)) {
    fontPath = path.join('c:\\Users\\Admin\\Desktop\\Atlaslogistics-main\\Atlaslogistics-main\\public\\fonts', 'DancingScript-Regular.ttf');
}

Font.register({
    family: 'DancingScript',
    src: fontPath
});

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

    // Teal Corporate Approval Stamp Overlay (borderless and realistically placed right above the signature line)
    tealStampContainer: {
        position: 'absolute',
        bottom: 23,
        left: 34,
        width: 95,
        height: 40,
        zIndex: 50,
        transform: 'rotate(-10deg)',
        opacity: 0.85,
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
        fontSize: 5.5,
        fontFamily: 'Helvetica-Bold',
        marginVertical: 0.1,
        textAlign: 'center',
    },
    signatureText: {
        fontFamily: 'DancingScript',
        fontSize: 16,
        color: '#0b3c5d',
        marginBottom: -8,
        textAlign: 'center',
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
    const dateStr = new Date(shipment.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Helper to extract declared value and quantity from product description
    const extractDeclaredValue = (desc: string) => {
        if (!desc) return '125,000.00';
        const match = desc.match(/(?:declared value of|value of)\s+(?:USD\s+)?\$?([0-9,]+(?:\.[0-9]{2})?)/i);
        if (match && match[1]) {
            return match[1];
        }
        const matches = desc.match(/\$[0-9,]+(?:\.[0-9]{2})?/g);
        if (matches) {
            let best = matches[0];
            for (const m of matches) {
                if (m.replace(/[^0-9]/g, '').length > best.replace(/[^0-9]/g, '').length) {
                    best = m;
                }
            }
            return best.replace('$', '');
        }
        return '125,000.00';
    };

    const extractQuantity = (desc: string) => {
        if (!desc) return '15 Freight Pallets (6,800 kg)';
        const regex = /([0-9,]+\s*(?:kilograms|kg|grams|g|pallets|tons|lbs|items|units|pieces|crates|boxes|drums)(?:\s+of\s+[^,.\n]+)?)/i;
        const match = desc.match(regex);
        if (match && match[1]) {
            return match[1].trim();
        }
        return '15 Freight Pallets (6,800 kg)';
    };

    const descText = shipment.productDescription || '';
    const declaredValStr = extractDeclaredValue(descText);
    const cargoQtyStr = extractQuantity(descText);
    
    // Compute dynamic storage rate
    const dailyHoldFee = shipment.holdFee || 0;
    const weeklyStorageFee = dailyHoldFee > 0 ? dailyHoldFee * 7 : 450;
    const storageRateText = `$${weeklyStorageFee.toFixed(2)} USD per week (computed at a daily storage rate of $${dailyHoldFee.toFixed(2)} USD)`;
    
    // Assessed brokerage base charge
    const assessedBaseCharge = shipment.holdBaseCharge || 6127.00;

    // Resolve fallback company logo as base64 from disk
    const fallbackLogoPath = getLocalImageAsBase64('cbp_right_seal.png');
    
    // Choose the logo to display as watermark (prioritize base64 generated server-side)
    const watermarkSrc = companyLogoBase64 || fallbackLogoPath;

    // Resolve stamp frame as base64 from disk
    const companyRectFramePath = getLocalImageAsBase64('company_rect_stamp_frame.png');

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
                    <Text style={{fontFamily:'Times-Bold'}}>Section 1: Agency and Customs Clearance Authorization.</Text> The Consignor hereby appoints the Consignee as its agent for the sole purpose of customs brokerage and clearance of the Goods at the designated Port of Entry, namely {shipment.destination || 'N/A'}. The Consignee accepts such appointment and agrees to act on behalf of the Consignor in preparing, filing, and executing all customs entry declarations, duty payment schedules, and compliance documentation required by U.S. Customs and Border Protection (CBP) and related federal regulatory agencies. The Consignor warrants that it shall execute a Customs Power of Attorney (POA) in favor of the Consignee to facilitate such operations, and that all supporting commercial invoices, packing lists, and bills of lading are true, correct, and complete.
                </Text>

                <Text style={styles.clauseText}>
                    <Text style={{fontFamily:'Times-Bold'}}>Section 2: Consignment, Custody, and Warehouse Storage.</Text> Upon customs clearance and release of the Goods, the Consignee shall take physical custody of the Goods. The Consignee agrees to store, protect, and warehouse the consignment at its designated secure facility or bonded warehouse. The Goods shall remain the exclusive property of the Consignor until sold or otherwise disposed of, and the Consignee shall hold the Goods as bailee only. The Consignee shall exercise the reasonable degree of care, diligence, and security precautions that a professional warehouseman would execute under identical circumstances, but shall not be liable for losses arising from acts of God, force majeure, or inherent vice of the Goods. The Consignee shall keep the Goods clearly segregated from the property of third parties.
                </Text>

                <Text style={styles.clauseText}>
                    <Text style={{fontFamily:'Times-Bold'}}>Section 3: Valuation, Customs Compliance, and Indemnification.</Text> The customs declared value of the consigned Goods subject to this Agreement is established as ${declaredValStr ? `$${declaredValStr} USD` : '$125,000.00 USD'}. The Consignor warrants that this valuation represents the true transaction value of the imported merchandise and complies in full with CBP valuation regulations (19 U.S.C. § 1401a). The Consignor agrees to defend, indemnify, and hold harmless the Consignee, its officers, and employees from any administrative penalties, fines, additional duties, or legal actions arising from valuation discrepancies, classification errors, or customs audits associated with the Goods.
                </Text>

                <Text style={styles.clauseText}>
                    <Text style={{fontFamily:'Times-Bold'}}>Section 4: Specifications of Consigned Cargo.</Text> The consignment subject to this Agreement is detailed as: {shipment.productDescription || 'Declared Merchandise Cargo'} (Quantity/Volume: {cargoQtyStr}).
                </Text>

                <Text style={styles.clauseText}>
                    <Text style={{fontFamily:'Times-Bold'}}>Section 5: Tariffs, Compensation, and Payment Terms.</Text> In consideration of the customs brokerage, warehousing, and logistics services rendered by the Consignee under this Agreement, the Consignor agrees to pay the Consignee: Customs Brokerage Service Fee (5.5% of declared customs value, or flat assessed charge of ${assessedBaseCharge ? `$${assessedBaseCharge.toLocaleString('en-US', {minimumFractionDigits: 2})} USD` : '$6,127.00 USD'}) and Storage Tariff Rate ({storageRateText}). All accrued invoices, customs duties, taxes, advances, and brokerage fees shall be paid by the Consignor in accordance with the payment terms of Net 15 days upon customs clearance. Any balance remaining unpaid after the due date shall bear interest at a rate of 1.5% per month, or the maximum rate permitted by law, whichever is lower.
                </Text>

                <Text style={styles.clauseText}>
                    <Text style={{fontFamily:'Times-Bold'}}>Section 6: Risk of Loss, Insurance, and Limitation of Liability.</Text> Title to the consigned Goods shall remain solely with the Consignor at all times. Risk of loss, damage, or destruction of the Goods due to fire, theft, customs seizure, or other casualty shall remain with the Consignor. The Consignor shall, at its own expense, secure and maintain a primary marine and inland cargo insurance policy for the full insurable value of the Goods. The Consignee shall only be liable for physical damage to or loss of the Goods resulting directly from the Consignee's proven gross negligence or willful misconduct, and such liability shall be limited to $500.00 USD per shipment or the actual depreciated value, whichever is less, unless a higher value is declared and additional insurance charges are paid.
                </Text>

                <Text style={styles.clauseText}>
                    <Text style={{fontFamily:'Times-Bold'}}>Section 7: Governing Law and Venue Jurisdiction.</Text> This Agreement, its construction, validity, interpretation, and performance, shall be governed by, construed, and enforced in accordance with the laws of the State of New York, without reference to its choice of law rules or conflict of law principles. Any legal action, suit, or proceeding arising out of or related to this Agreement shall be brought exclusively in the state or federal courts located in the designated State, and each party irrevocably submits to the personal jurisdiction and venue of such courts.
                </Text>

                <Text style={styles.clauseText}>
                    <Text style={{fontFamily:'Times-Bold'}}>Section 8: Delivery Performance and Release Deadline.</Text> Upon securing official customs release from U.S. Customs hold, the Consignee shall execute final shipping dispatch and delivery of the cargo to the Consignor's designated recipient Within 10 business days of customs release. If delivery is delayed due to force majeure events, customs audits, or consignor-caused manifest holds, the performance deadline shall be extended accordingly.
                </Text>

                <Text style={styles.clauseText}>
                    <Text style={{fontFamily:'Times-Bold'}}>Section 9: Miscellaneous Legal Provisions.</Text> Entire Agreement: This Agreement constitutes the entire contract between the parties concerning the subject matter and supersedes all prior proposals, negotiations, and agreements. Severability: If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. Force Majeure: Neither party shall be liable for delays or failure to perform obligations under this Agreement due to acts of God, strikes, natural disasters, war, government regulations, customs strikes, or other causes beyond its reasonable control.
                </Text>

                {/* Bottom Row containing Stamps and Signatures */}
                <View style={styles.bottomRow} wrap={false}>
                    {/* Left: Shipper Signature (dotted line for manual signature) */}
                    <View style={styles.signBlock}>
                        {senderName && senderName !== 'N/A' && (
                            <Text style={styles.signatureText}>{senderName}</Text>
                        )}
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
