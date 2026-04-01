import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { parseShipmentInfo } from '@/lib/utils';

// Standardize colors
const colors = {
    brand: '#2563eb',
    brandSecondary: '#1d4ed8',
    dark: '#0f172a',
    slate: '#475569',
    lightSlate: '#94a3b8',
    border: '#e2e8f0',
    background: '#f8fafc',
    white: '#ffffff',
    priority: '#ef4444',
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: colors.white,
        padding: 30,
        fontFamily: 'Helvetica',
        color: colors.dark,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: `2pt solid ${colors.dark}`,
    },
    logoContainer: {
        flexDirection: 'column',
    },
    logo: {
        width: 140,
        height: 60,
        objectFit: 'contain',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 1,
        color: colors.brand,
    },
    priorityBadge: {
        backgroundColor: colors.dark,
        color: colors.white,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    mainGrid: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 20,
    },
    addressCard: {
        flex: 1,
        padding: 12,
        border: `1pt solid ${colors.border}`,
        borderRadius: 8,
        backgroundColor: colors.background,
    },
    cardLabel: {
        fontSize: 10,
        color: colors.lightSlate,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 6,
        letterSpacing: 1,
    },
    locationLarge: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: colors.dark,
    },
    addressText: {
        fontSize: 11,
        color: colors.slate,
        lineHeight: 1.4,
    },
    secondaryGrid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    infoBox: {
        flex: 1,
        borderBottom: `1pt solid ${colors.border}`,
        paddingBottom: 10,
    },
    infoLabel: {
        fontSize: 9,
        color: colors.lightSlate,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.dark,
    },
    barcodeSection: {
        marginTop: 30,
        padding: 20,
        border: `2pt solid ${colors.dark}`,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
    },
    barcodeText: {
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 6,
        marginTop: 10,
    },
    barcodePlaceholder: {
        width: '100%',
        height: 40,
        backgroundColor: colors.dark,
        marginBottom: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 9,
        color: colors.lightSlate,
        borderTop: `0.5pt solid ${colors.border}`,
        paddingTop: 12,
    },
    watermark: {
        position: 'absolute',
        top: '45%',
        left: '10%',
        transform: 'rotate(-45deg)',
        fontSize: 80,
        color: 'rgba(226, 232, 240, 0.3)',
        fontWeight: 'bold',
        zIndex: -1,
    }
});

interface ShippingLabelProps {
    shipment: any;
    settings?: { companyName: string, logoUrl: string, supportEmail: string, supportPhone: string } | null;
}

const ShippingLabelPDF: React.FC<ShippingLabelProps> = ({ shipment, settings }) => {
    const sender = parseShipmentInfo(shipment.senderInfo);
    const receiver = parseShipmentInfo(shipment.receiverInfo);
    
    // Simple helper to remove potential non-standard characters that break Helvetica
    const cleanText = (text: string) => {
        if (!text) return 'N/A';
        // Replace common problematic unicode characters with safe versions
        return text.replace(/[^\x00-\x7F]/g, '');
    };

    return (
    <Document title={`Label-${shipment.trackingNumber}`}>
        <Page size="A6" style={styles.page}>
            {/* Design Watermark */}
            <Text style={styles.watermark}>ATLAS</Text>

            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    {settings?.logoUrl ? (
                        <Image src={settings.logoUrl} style={styles.logo} />
                    ) : (
                        <Text style={styles.companyName}>{settings?.companyName?.toUpperCase() || 'ATLAS LOGISTICS'}</Text>
                    )}
                </View>
                <View style={styles.priorityBadge}>
                    <Text>PRIORITY</Text>
                </View>
            </View>

            <View style={styles.mainGrid}>
                <View style={styles.addressCard}>
                    <Text style={styles.cardLabel}>FROM</Text>
                    <Text style={styles.locationLarge}>{cleanText(shipment.origin)}</Text>
                    <Text style={styles.addressText}>{cleanText(sender.name)}</Text>
                    <Text style={styles.addressText}>{cleanText(sender.address)}</Text>
                </View>
            </View>

            <View style={styles.mainGrid}>
                <View style={[styles.addressCard, { backgroundColor: colors.white, borderLeft: `4pt solid ${colors.brand}` }]}>
                    <Text style={styles.cardLabel}>SHIP TO</Text>
                    <Text style={styles.locationLarge}>{cleanText(shipment.destination)}</Text>
                    <Text style={[styles.addressText, { fontWeight: 'bold' }]}>{cleanText(receiver.name)}</Text>
                    <Text style={styles.addressText}>{cleanText(receiver.address)}</Text>
                    <Text style={styles.addressText}>{cleanText(receiver.phone)}</Text>
                </View>
            </View>

            <View style={styles.secondaryGrid}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Weight</Text>
                    <Text style={styles.infoValue}>{shipment.weight || '1.5'} KG</Text>
                </View>
                <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>{new Date(shipment.createdAt).toLocaleDateString()}</Text>
                </View>
            </View>

            <View style={styles.barcodeSection}>
                <View style={styles.barcodePlaceholder} />
                <Text style={styles.barcodeText}>{shipment.trackingNumber}</Text>
            </View>

            <Text style={styles.footer}>
                This is an official document of {settings?.companyName || 'Atlas Logistics'}. 
                Contact {settings?.supportEmail || 'support@atlaslogistics.com'} for assistance.
            </Text>
        </Page>
    </Document>
    );
};

export default ShippingLabelPDF;

