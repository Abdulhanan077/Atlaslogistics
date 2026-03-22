import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { parseShipmentInfo } from '@/lib/utils';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    mainHeader: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2563eb', // blue-600
        textAlign: 'center',
        marginBottom: 30,
        letterSpacing: 2,
    },
    card: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    trackingBlock: {
        flexDirection: 'column',
        gap: 4,
    },
    trackingNumber: {
        fontSize: 24,
        fontWeight: 'extrabold',
        color: '#0f172a',
    },
    dateText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    estDeliveryText: {
        fontSize: 12,
        color: '#2563eb',
        marginTop: 2,
    },
    statusPill: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ca8a04', // default yellow for pending
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fef08a',
        backgroundColor: '#fefce8',
        textTransform: 'uppercase',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 20,
    },
    addressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    addressColumnLeft: {
        width: '45%',
    },
    addressColumnRight: {
        width: '45%',
        alignItems: 'flex-end',
        textAlign: 'right',
    },
    labelSmall: {
        fontSize: 10,
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    locationLarge: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    addressText: {
        fontSize: 11,
        color: '#334155',
        marginTop: 2,
    },
    productHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 11,
        color: '#334155',
        lineHeight: 1.5,
    },
    imagesHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 10,
    },
    imagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    imageItem: {
        width: 150,
        height: 150,
        objectFit: 'cover',
        borderRadius: 4,
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
        switch (status?.toUpperCase()) {
            case 'CREATED':
            case 'PENDING': return { color: '#ca8a04', borderColor: '#fef08a', backgroundColor: '#fefce8' };
            case 'IN_TRANSIT': return { color: '#2563eb', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' };
            case 'ON_HOLD': return { color: '#ea580c', borderColor: '#fed7aa', backgroundColor: '#fff7ed' };
            case 'OUT_FOR_DELIVERY': return { color: '#9333ea', borderColor: '#e9d5ff', backgroundColor: '#faf5ff' };
            case 'DELIVERED': return { color: '#059669', borderColor: '#a7f3d0', backgroundColor: '#ecfdf5' };
            case 'RETURNED': return { color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fef2f2' };
            default: return { color: '#ca8a04', borderColor: '#fef08a', backgroundColor: '#fefce8' };
        }
    };

    const statusStyle = getStatusStyle(shipment.status);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {settings?.logoUrl && (
                    <Image src={settings.logoUrl} style={{ width: 120, height: 120, objectFit: 'contain', alignSelf: 'center', marginBottom: 10 }} />
                )}
                <Text style={styles.mainHeader}>{settings?.companyName?.toUpperCase() || 'ATLAS LOGISTICS'}</Text>

                <View style={styles.card}>
                    {/* Header Row */}
                    <View style={styles.headerRow}>
                        <View style={styles.trackingBlock}>
                            <Text style={styles.trackingNumber}>{shipment.trackingNumber}</Text>
                            <Text style={styles.dateText}>Created on {new Date(shipment.createdAt).toLocaleDateString()}</Text>
                            {shipment.estimatedDelivery && (
                                <Text style={styles.estDeliveryText}>Est. Delivery: {new Date(shipment.estimatedDelivery).toLocaleDateString()}</Text>
                            )}
                        </View>
                        <View>
                            <Text style={[styles.statusPill, statusStyle]}>{shipment.status}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Addresses Row */}
                    <View style={styles.addressRow}>
                        <View style={styles.addressColumnLeft}>
                            <Text style={styles.labelSmall}>FROM</Text>
                            <Text style={styles.locationLarge}>{shipment.origin || 'System'}</Text>
                            {sender.name && <Text style={styles.addressText}>{sender.name}</Text>}
                            {sender.phone && <Text style={styles.addressText}>{sender.phone}</Text>}
                            {sender.address && <Text style={styles.addressText}>{sender.address}</Text>}
                        </View>
                        <View style={styles.addressColumnRight}>
                            <Text style={styles.labelSmall}>TO</Text>
                            <Text style={styles.locationLarge}>{shipment.destination || 'N/A'}</Text>
                            {receiver.name && <Text style={styles.addressText}>{receiver.name}</Text>}
                            {receiver.phone && <Text style={styles.addressText}>{receiver.phone}</Text>}
                            {receiver.address && <Text style={styles.addressText}>{receiver.address}</Text>}
                        </View>
                    </View>

                    {shipment.productDescription && (
                        <>
                            <View style={styles.divider} />
                            
                            <View>
                                <Text style={styles.productHeader}>Product Details</Text>
                                <Text style={styles.labelSmall}>DESCRIPTION</Text>
                                <Text style={styles.descriptionText}>{shipment.productDescription}</Text>
                            </View>
                        </>
                    )}

                    {pdfImageUrls.length > 0 && (
                        <View wrap={false}>
                            <View style={styles.divider} />
                            <Text style={styles.imagesHeader}>Attached Images</Text>
                            <View style={styles.imagesGrid}>
                                {pdfImageUrls.map((url: string, i: number) => (
                                    <Image key={i} src={url} style={styles.imageItem} />
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </Page>
        </Document>
    );
};

export default ShipmentDetailsPDF;
