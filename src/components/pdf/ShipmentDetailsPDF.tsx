import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { getWaybillDetails } from '@/lib/waybill';

// Register bold font
Font.register({
    family: 'Helvetica-Bold',
    src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf'
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },
    // Top Logo & Document Header
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#0f172a',
        paddingBottom: 10,
    },
    logo: {
        width: 140,
        height: 45,
        objectFit: 'contain',
    },
    brandTitle: {
        fontSize: 20,
        fontFamily: 'Helvetica-Bold',
        color: '#0f172a',
        letterSpacing: 1,
    },
    brandSubtitle: {
        fontSize: 8,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginTop: 2,
    },
    headerRightBlock: {
        alignItems: 'flex-end',
    },
    awbBadgeLabel: {
        fontSize: 8,
        color: '#64748b',
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    awbBadgeValue: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: '#0f172a',
        marginTop: 2,
    },

    // Main Air Waybill Outer Frame
    awbFrame: {
        borderWidth: 1.5,
        borderColor: '#0f172a',
        borderRadius: 2,
        marginBottom: 20,
        backgroundColor: '#ffffff',
    },

    // Row 1: Header (114 - LHR - 90481204 | INTERNATIONAL AIR WAYBILL (AWB))
    frameHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 7,
        paddingHorizontal: 10,
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1.5,
        borderBottomColor: '#0f172a',
    },
    awbNumberText: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: '#0f172a',
        letterSpacing: 1,
    },
    awbTitleText: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: '#0f172a',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },

    // Row 2: Shipper & Consignee 2-Column Grid
    partiesRow: {
        flexDirection: 'row',
        borderBottomWidth: 1.5,
        borderBottomColor: '#0f172a',
    },
    partyColLeft: {
        width: '50%',
        padding: 8,
        borderRightWidth: 1.5,
        borderRightColor: '#0f172a',
    },
    partyColRight: {
        width: '50%',
        padding: 8,
    },
    sectionLabel: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        color: '#334155',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    partyName: {
        fontSize: 9.5,
        fontFamily: 'Helvetica-Bold',
        color: '#0f172a',
        marginBottom: 2,
    },
    partyAddress: {
        fontSize: 8.5,
        color: '#334155',
        lineHeight: 1.3,
    },
    partyEmail: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#1e40af',
        marginTop: 4,
    },

    // Row 3: Airport of Departure & Destination Bar
    routeBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderBottomWidth: 1.5,
        borderBottomColor: '#0f172a',
        backgroundColor: '#f8fafc',
    },
    routeItemText: {
        fontSize: 8.5,
        color: '#0f172a',
    },
    routeItemBold: {
        fontFamily: 'Helvetica-Bold',
    },

    // Row 4 & 5: Cargo Table Header & Row
    tableHeaderRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#0f172a',
        backgroundColor: '#f1f5f9',
    },
    tableDataRow: {
        flexDirection: 'row',
        borderBottomWidth: 1.5,
        borderBottomColor: '#0f172a',
        minHeight: 40,
    },

    colPkgs: {
        width: '10%',
        padding: 6,
        borderRightWidth: 1,
        borderRightColor: '#0f172a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    colWeight: {
        width: '18%',
        padding: 6,
        borderRightWidth: 1,
        borderRightColor: '#0f172a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    colCommodity: {
        width: '30%',
        padding: 6,
        borderRightWidth: 1,
        borderRightColor: '#0f172a',
        justifyContent: 'center',
    },
    colValue: {
        width: '24%',
        padding: 6,
        borderRightWidth: 1,
        borderRightColor: '#0f172a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    colFreight: {
        width: '18%',
        padding: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },

    colHeaderText: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: '#0f172a',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    colCellText: {
        fontSize: 8.5,
        color: '#0f172a',
        textAlign: 'center',
    },
    colCellTextBold: {
        fontFamily: 'Helvetica-Bold',
    },

    // Row 6: Special Handling Instructions
    handlingRow: {
        padding: 8,
        borderBottomWidth: 1.5,
        borderBottomColor: '#0f172a',
        backgroundColor: '#ffffff',
    },
    handlingText: {
        fontSize: 8.5,
        color: '#0f172a',
        lineHeight: 1.35,
        marginTop: 2,
    },

    // Row 7: Stamp & Date Footer Bar
    frameFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 7,
        paddingHorizontal: 10,
        backgroundColor: '#f8fafc',
    },
    footerStampText: {
        fontSize: 8.5,
        color: '#0f172a',
    },
    stampBadge: {
        fontFamily: 'Helvetica-Bold',
        color: '#0284c7',
    },

    // Additional Info / Official Verification Footer
    officialFooter: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 0.5,
        borderTopColor: '#cbd5e1',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    officialFooterText: {
        fontSize: 7.5,
        color: '#64748b',
    },
    statusBadge: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#059669',
        backgroundColor: '#ecfdf5',
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#059669',
        textTransform: 'uppercase',
    }
});

interface ShipmentDetailsPDFProps {
    shipment: any;
    settings?: { companyName: string, logoUrl: string, supportEmail: string, supportPhone: string } | null;
}

const ShipmentDetailsPDF: React.FC<ShipmentDetailsPDFProps> = ({ shipment, settings }) => {
    const wb = getWaybillDetails(shipment);
    const companyName = settings?.companyName || 'Atlas Logistics';
    const companyEmail = settings?.supportEmail || wb.companyEmail || 'support@atlaslogistics.site';

    return (
        <Document title={`WAYBILL-${wb.awbNumber}`}>
            <Page size="A4" style={styles.page}>
                {/* Top Branding & Document Header */}
                <View style={styles.topHeader}>
                    <View>
                        {settings?.logoUrl ? (
                            <Image src={settings.logoUrl} style={styles.logo} />
                        ) : (
                            <Text style={styles.brandTitle}>{companyName.toUpperCase()}</Text>
                        )}
                        <Text style={styles.brandSubtitle}>GLOBAL AIR FREIGHT & CONSIGNMENT SERVICES • {companyEmail}</Text>
                    </View>
                    <View style={styles.headerRightBlock}>
                        <Text style={styles.awbBadgeLabel}>Air Waybill Reference</Text>
                        <Text style={styles.awbBadgeValue}>{wb.awbPrefix} - {wb.departureCode} - {wb.awbNumber}</Text>
                    </View>
                </View>

                {/* Main Air Waybill Box (Matching User Requested Specification) */}
                <View style={styles.awbFrame}>
                    {/* Header Row */}
                    <View style={styles.frameHeaderRow}>
                        <Text style={styles.awbNumberText}>
                            {wb.awbPrefix} - {wb.departureCode} - {wb.awbNumber}
                        </Text>
                        <Text style={styles.awbTitleText}>
                            INTERNATIONAL AIR WAYBILL (AWB)
                        </Text>
                    </View>

                    {/* Shipper & Consignee 2-Column Section */}
                    <View style={styles.partiesRow}>
                        <View style={styles.partyColLeft}>
                            <Text style={styles.sectionLabel}>SHIPPER'S NAME & ADDRESS:</Text>
                            <Text style={styles.partyName}>{wb.shipperName}</Text>
                            {wb.shipperAddress.split('\n').map((line, idx) => (
                                <Text key={idx} style={styles.partyAddress}>{line}</Text>
                            ))}
                            {wb.shipperEmail && (
                                <Text style={styles.partyEmail}>Email: {wb.shipperEmail}</Text>
                            )}
                        </View>
                        <View style={styles.partyColRight}>
                            <Text style={styles.sectionLabel}>CONSIGNEE'S NAME & ADDRESS:</Text>
                            <Text style={styles.partyName}>{wb.consigneeName}</Text>
                            {wb.consigneeAddress.split('\n').map((line, idx) => (
                                <Text key={idx} style={styles.partyAddress}>{line}</Text>
                            ))}
                            {wb.consigneeEmail && (
                                <Text style={styles.partyEmail}>Email: {wb.consigneeEmail}</Text>
                            )}
                        </View>
                    </View>

                    {/* Route Bar */}
                    <View style={styles.routeBar}>
                        <Text style={styles.routeItemText}>
                            <Text style={styles.routeItemBold}>AIRPORT OF DEPARTURE: </Text>
                            {wb.airportOfDeparture}
                        </Text>
                        <Text style={styles.routeItemText}>
                            <Text style={styles.routeItemBold}>DESTINATION: </Text>
                            {wb.airportOfDestination}
                        </Text>
                    </View>

                    {/* Cargo Table Header */}
                    <View style={styles.tableHeaderRow}>
                        <View style={styles.colPkgs}>
                            <Text style={styles.colHeaderText}>PKGS</Text>
                        </View>
                        <View style={styles.colWeight}>
                            <Text style={styles.colHeaderText}>WEIGHT</Text>
                        </View>
                        <View style={styles.colCommodity}>
                            <Text style={[styles.colHeaderText, { textAlign: 'left' }]}>COMMODITY/HS</Text>
                        </View>
                        <View style={styles.colValue}>
                            <Text style={styles.colHeaderText}>DECLARED CUSTOMS VALUE</Text>
                        </View>
                        <View style={styles.colFreight}>
                            <Text style={styles.colHeaderText}>FREIGHT CHARGE</Text>
                        </View>
                    </View>

                    {/* Cargo Table Data Row */}
                    <View style={styles.tableDataRow}>
                        <View style={styles.colPkgs}>
                            <Text style={[styles.colCellText, styles.colCellTextBold]}>{wb.pkgs}</Text>
                        </View>
                        <View style={styles.colWeight}>
                            <Text style={[styles.colCellText, styles.colCellTextBold]}>{wb.weight}</Text>
                        </View>
                        <View style={styles.colCommodity}>
                            <Text style={[styles.colCellText, styles.colCellTextBold, { textAlign: 'left' }]}>{wb.hsCode}</Text>
                            <Text style={[styles.colCellText, { textAlign: 'left', color: '#334155', marginTop: 2 }]}>
                                ({wb.commodity})
                            </Text>
                        </View>
                        <View style={styles.colValue}>
                            <Text style={[styles.colCellText, styles.colCellTextBold]}>{wb.declaredCustomsValue}</Text>
                        </View>
                        <View style={styles.colFreight}>
                            <Text style={[styles.colCellText, styles.colCellTextBold]}>{wb.freightCharge}</Text>
                        </View>
                    </View>

                    {/* Special Handling Instructions Row */}
                    <View style={styles.handlingRow}>
                        <Text style={styles.sectionLabel}>SPECIAL HANDLING INSTRUCTIONS:</Text>
                        {wb.specialHandling.split('\n').map((line, idx) => (
                            <Text key={idx} style={styles.handlingText}>{line}</Text>
                        ))}
                    </View>

                    {/* Carrier Digital Stamp & Date Row */}
                    <View style={styles.frameFooterRow}>
                        <Text style={styles.footerStampText}>
                            <Text style={styles.routeItemBold}>CARRIER DIGITAL STAMP: </Text>
                            <Text style={styles.stampBadge}>{wb.carrierDigitalStamp}</Text>
                            <Text style={{ fontSize: 8, color: '#475569' }}> ({companyEmail})</Text>
                        </Text>
                        <Text style={styles.footerStampText}>
                            <Text style={styles.routeItemBold}>DATE: </Text>
                            {wb.waybillDate}
                        </Text>
                    </View>
                </View>

                {/* Footer Section */}
                <View style={styles.officialFooter}>
                    <Text style={styles.officialFooterText}>
                        Issued by {companyName} ({companyEmail}) • Official IATA Compliant International Air Waybill
                    </Text>
                    <Text style={styles.statusBadge}>
                        {shipment?.status || 'VALIDATED'}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default ShipmentDetailsPDF;
