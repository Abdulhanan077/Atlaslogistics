import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { parseShipmentInfo } from '@/lib/utils';

// Refined colors for a professional logistics feel
const colors = {
    primary: '#0f172a',    // Dark blue/slate
    secondary: '#1e40af',  // Brand blue
    muted: '#64748b',      // Muted slate
    light: '#f8fafc',      // Background
    border: '#e2e8f0',     // Light border
    black: '#000000',
    white: '#ffffff',
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: colors.white,
        padding: 40,
        fontFamily: 'Helvetica',
        color: colors.primary,
    },
    // New Header Design Based on Screenshot
    headerSection: {
        marginBottom: 20,
    },
    logoBox: {
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    logo: {
        width: 150,
        height: 60,
        objectFit: 'contain',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    waybillText: {
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    trackingLabelBox: {
        textAlign: 'right',
    },
    trackingLabelSmall: {
        fontSize: 10,
        color: colors.muted,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    trackingNumberLarge: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    thickDivider: {
        height: 3,
        backgroundColor: colors.black,
        marginBottom: 25,
    },
    // Body Layout
    card: {
        backgroundColor: colors.light,
        borderRadius: 8,
        padding: 20,
        border: `1pt solid ${colors.border}`,
        marginBottom: 20,
    },
    statusPill: {
        alignSelf: 'center',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        gap: 40,
    },
    column: {
        flex: 1,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.muted,
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    locationValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 5,
    },
    addressLine: {
        fontSize: 11,
        color: colors.primary,
        lineHeight: 1.4,
    },
    smallDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 15,
    },
    detailsSection: {
        marginTop: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        color: colors.primary,
        borderBottom: `1pt solid ${colors.border}`,
        paddingBottom: 5,
    },
    descriptionText: {
        fontSize: 12,
        lineHeight: 1.5,
        color: colors.primary,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        marginTop: 10,
    },
    imageItem: {
        width: 160,
        height: 160,
        borderRadius: 6,
        border: `1pt solid ${colors.border}`,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTop: `1pt solid ${colors.border}`,
        paddingTop: 15,
    },
    footerText: {
        fontSize: 10,
        color: colors.muted,
        marginBottom: 4,
    }
});

interface ShipmentDetailsPDFProps {
    shipment: any;
    settings?: { companyName: string, logoUrl: string, supportEmail: string, supportPhone: string } | null;
}

const ShipmentDetailsPDF: React.FC<ShipmentDetailsPDFProps> = ({ shipment, settings }) => {
    const sender = parseShipmentInfo(shipment.senderInfo);
    const receiver = parseShipmentInfo(shipment.receiverInfo);

    let pdfImageUrls: string[] = [];
    try {
        pdfImageUrls = typeof shipment.imageUrls === 'string' 
            ? JSON.parse(shipment.imageUrls) 
            : (shipment.imageUrls || []);
    } catch (e) {
        pdfImageUrls = [];
    }

    const getStatusStyle = (status: string) => {
        const base = { color: colors.white };
        switch (status?.toUpperCase()) {
            case 'CREATED': return { ...base, backgroundColor: '#f59e0b' }; // Amber
            case 'DELIVERED': return { ...base, backgroundColor: '#10b981' }; // Emerald
            case 'IN_TRANSIT': return { ...base, backgroundColor: '#3b82f6' }; // Blue
            case 'ON_HOLD': return { ...base, backgroundColor: '#ef4444' }; // Red
            default: return { ...base, backgroundColor: '#6b7280' }; // Gray
        }
    };

    return (
        <Document title={`Waybill-${shipment.trackingNumber}`}>
            <Page size="A4" style={styles.page}>
                {/* Custom Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.logoBox}>
                        {settings?.logoUrl ? (
                            <Image src={settings.logoUrl} style={styles.logo} />
                        ) : (
                            <Text style={[styles.waybillText, { color: colors.secondary }]}>{settings?.companyName || 'ATLAS LOGISTICS'}</Text>
                        )}
                    </View>
                    <View style={styles.titleRow}>
                        <Text style={styles.waybillText}>SHIPMENT WAYBILL</Text>
                        <View style={styles.trackingLabelBox}>
                            <Text style={styles.trackingLabelSmall}>TRACKING NUMBER</Text>
                            <Text style={styles.trackingNumberLarge}>{shipment.trackingNumber}</Text>
                        </View>
                    </View>
                    <View style={styles.thickDivider} />
                </View>

                {/* Main Content Card */}
                <View style={styles.card}>
                    {/* Status Pill centered above main info */}
                    <Text style={[styles.statusPill, getStatusStyle(shipment.status)]}>
                        {shipment.status}
                    </Text>

                    <View style={styles.grid}>
                        <View style={styles.column}>
                            <Text style={styles.sectionLabel}>FROM</Text>
                            <Text style={styles.locationValue}>{shipment.origin || 'N/A'}</Text>
                            <Text style={styles.addressLine}>{sender.name}</Text>
                            <Text style={styles.addressLine}>{sender.address}</Text>
                            <Text style={styles.addressLine}>{sender.phone}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.sectionLabel}>TO</Text>
                            <Text style={styles.locationValue}>{shipment.destination || 'N/A'}</Text>
                            <Text style={styles.addressLine}>{receiver.name}</Text>
                            <Text style={styles.addressLine}>{receiver.address}</Text>
                            <Text style={styles.addressLine}>{receiver.phone}</Text>
                        </View>
                    </View>

                    <View style={styles.smallDivider} />

                    <View style={styles.grid}>
                        <View style={styles.column}>
                            <Text style={styles.sectionLabel}>Date of Shipment</Text>
                            <Text style={[styles.addressLine, { fontWeight: 'bold' }]}>{new Date(shipment.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.sectionLabel}>Estimated Delivery</Text>
                            <Text style={[styles.addressLine, { fontWeight: 'bold' }]}>
                                {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : 'Pending'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Product Details Section */}
                {shipment.productDescription && (
                    <View style={styles.detailsSection}>
                        <Text style={styles.sectionTitle}>Product Details</Text>
                        <Text style={styles.descriptionText}>{shipment.productDescription}</Text>
                    </View>
                )}

                {/* Attached Images Section */}
                {pdfImageUrls.length > 0 && (
                    <View wrap={false} style={styles.detailsSection}>
                        <Text style={styles.sectionTitle}>Attached Images</Text>
                        <View style={styles.imageGrid}>
                            {pdfImageUrls.map((url: string, i: number) => (
                                <Image key={i} src={url} style={styles.imageItem} />
                            ))}
                        </View>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Thank you for choosing {settings?.companyName || 'Atlas Logistics'}.</Text>
                    <Text style={styles.footerText}>Support: {settings?.supportEmail || 'support@atlaslogistics.com'} | {settings?.supportPhone || '+1 (555) 000-0000'}</Text>
                </View>
            </Page>
        </Document>
    );
};

export default ShipmentDetailsPDF;

