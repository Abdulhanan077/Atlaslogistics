import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { parseShipmentInfo } from '@/lib/utils';

// Register a standard bold font for better look
Font.register({
    family: 'Helvetica-Bold',
    src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf'
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },
    // Header Section (Top Logo & Title)
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    logo: {
        width: 140,
        height: 60,
        objectFit: 'contain',
    },
    headerTracking: {
        textAlign: 'right',
    },
    headerLabel: {
        fontSize: 8,
        color: '#64748b',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginTop: 2,
    },
    titleSection: {
        borderBottom: '2.5pt solid #000000',
        paddingBottom: 5,
        marginBottom: 25,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },

    // Main Card Box
    card: {
        border: '1pt solid #e2e8f0',
        borderRadius: 12,
        padding: 25,
        marginBottom: 25,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    mainTracking: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
    },
    dateRow: {
        marginTop: 4,
    },
    dateLabel: {
        fontSize: 10,
        color: '#64748b',
    },
    estDelivery: {
        fontSize: 10,
        color: '#2563eb',
        fontWeight: 'bold',
        marginTop: 2,
    },
    statusPill: {
        paddingVertical: 4,
        paddingHorizontal: 15,
        borderRadius: 15,
        borderWidth: 1.5,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },

    // Sender/Receiver Columns
    routeSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    routeColumn: {
        width: '45%',
    },
    sectionLabel: {
        fontSize: 9,
        color: '#94a3b8',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    cityName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    contactName: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 3,
    },
    contactInfo: {
        fontSize: 10,
        color: '#475569',
        marginBottom: 2,
    },

    // Product Details Section
    productSection: {
        marginTop: 10,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    descLabel: {
        fontSize: 9,
        color: '#94a3b8',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    productDesc: {
        fontSize: 11,
        color: '#1e293b',
        lineHeight: 1.5,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTop: '0.5pt solid #e2e8f0',
        paddingTop: 15,
    },
    footerText: {
        fontSize: 8,
        color: '#94a3b8',
    }
});

interface ShipmentDetailsPDFProps {
    shipment: any;
    settings?: { companyName: string, logoUrl: string, supportEmail: string, supportPhone: string } | null;
}

const ShipmentDetailsPDF: React.FC<ShipmentDetailsPDFProps> = ({ shipment, settings }) => {
    const sender = parseShipmentInfo(shipment.senderInfo);
    const receiver = parseShipmentInfo(shipment.receiverInfo);

    const getStatusStyles = (status: string) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'CREATED': return { color: '#ca8a04', backgroundColor: '#fefce8', borderColor: '#fef08a' };
            case 'IN_TRANSIT': return { color: '#2563eb', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' };
            case 'DELIVERED': return { color: '#059669', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' };
            default: return { color: '#64748b', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' };
        }
    };

    const statusStyle = getStatusStyles(shipment.status);

    return (
        <Document title={`WAYBILL-${shipment.trackingNumber}`}>
            <Page size="A4" style={styles.page}>
                {/* Header Row */}
                <View style={styles.header}>
                    {settings?.logoUrl ? (
                        <Image src={settings.logoUrl} style={styles.logo} />
                    ) : (
                        <Text style={[styles.headerValue, { color: '#1e40af' }]}>{settings?.companyName || 'ATLAS'}</Text>
                    )}
                    <View style={styles.headerTracking}>
                        <Text style={styles.headerLabel}>Tracking Number</Text>
                        <Text style={styles.headerValue}>{shipment.trackingNumber}</Text>
                    </View>
                </View>

                {/* Waybill Line */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>Shipment Waybill</Text>
                </View>

                {/* Main Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.mainTracking}>{shipment.trackingNumber}</Text>
                            <View style={styles.dateRow}>
                                <Text style={styles.dateLabel}>Created on {new Date(shipment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                {shipment.estimatedDelivery && (
                                    <Text style={styles.estDelivery}>Est. Delivery: {new Date(shipment.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                )}
                            </View>
                        </View>
                        <Text style={[styles.statusPill, { 
                            color: statusStyle.color, 
                            backgroundColor: statusStyle.backgroundColor, 
                            borderColor: statusStyle.borderColor 
                        }]}>
                            {shipment.status}
                        </Text>
                    </View>

                    {/* From / To Section */}
                    <View style={styles.routeSection}>
                        <View style={styles.routeColumn}>
                            <Text style={styles.sectionLabel}>From</Text>
                            <Text style={styles.cityName}>{shipment.origin || 'Origin'}</Text>
                            <Text style={styles.contactName}>{sender.name}</Text>
                            <Text style={styles.contactInfo}>{sender.phone}</Text>
                            <Text style={styles.contactInfo}>{sender.address}</Text>
                        </View>
                        <View style={[styles.routeColumn, { textAlign: 'right' }]}>
                            <Text style={styles.sectionLabel}>To</Text>
                            <Text style={styles.cityName}>{shipment.destination || 'Destination'}</Text>
                            <Text style={styles.contactName}>{receiver.name}</Text>
                            <Text style={styles.contactInfo}>{receiver.phone}</Text>
                            <Text style={styles.contactInfo}>{receiver.address}</Text>
                        </View>
                    </View>

                    <View style={{ borderTop: '1pt solid #e2e8f0', marginVertical: 20 }} />

                    {/* Product Details */}
                    <View style={styles.productSection}>
                        <Text style={styles.productTitle}>Product Details</Text>
                        <Text style={styles.descLabel}>Description</Text>
                        <Text style={styles.productDesc}>{shipment.productDescription}</Text>
                        {sender.vehicleType && sender.vehicleType !== 'NONE' && (
                            <View style={{ marginTop: 10 }}>
                                <Text style={styles.descLabel}>Transit Mode</Text>
                                <Text style={styles.productDesc}>
                                    {sender.vehicleType === 'TRUCK' ? 'Truck' :
                                     sender.vehicleType === 'SHIP' ? 'Ship' :
                                     sender.vehicleType === 'PLANE' ? 'Airplane' :
                                     sender.vehicleType === 'VAN' ? 'Van' :
                                     sender.vehicleType === 'TRAIN' ? 'Train' :
                                     sender.vehicleType}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Thank you for choosing {settings?.companyName || 'Atlas Logistics'}.</Text>
                    <Text style={[styles.footerText, { marginTop: 5 }]}>This is an official document of {settings?.companyName}.</Text>
                </View>
            </Page>
        </Document>
    );
};

export default ShipmentDetailsPDF;


