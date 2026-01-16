import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    trackingNumber: {
        fontSize: 14,
        marginTop: 5,
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    addressBlock: {
        width: '45%',
    },
    label: {
        fontSize: 10,
        color: '#666666',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        textAlign: 'center',
        fontSize: 10,
        color: '#666666',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: 10,
    },
    barcodeBox: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        borderWidth: 1,
        borderColor: '#000000',
    }
});

interface ShippingLabelProps {
    shipment: any;
}

const ShippingLabelPDF: React.FC<ShippingLabelProps> = ({ shipment }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Atlas Logistics</Text>
                    <Text style={styles.trackingNumber}>{shipment.trackingNumber}</Text>
                </View>
                <View>
                    <Text style={[styles.title, { fontSize: 16 }]}>PRIORITY</Text>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.addressBlock}>
                    <Text style={styles.label}>From:</Text>
                    <Text style={styles.value}>{shipment.origin}</Text>
                    <Text style={[styles.value, { fontSize: 10, marginTop: 4, fontWeight: 'normal' }]}>{shipment.senderInfo}</Text>
                </View>
                <View style={styles.addressBlock}>
                    <Text style={styles.label}>To:</Text>
                    <Text style={styles.value}>{shipment.destination}</Text>
                    <Text style={[styles.value, { fontSize: 10, marginTop: 4, fontWeight: 'normal' }]}>{shipment.receiverInfo}</Text>
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.addressBlock}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>{new Date(shipment.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={styles.addressBlock}>
                    <Text style={styles.label}>Estimated Delivery:</Text>
                    <Text style={styles.value}>
                        {shipment.estimatedDelivery
                            ? new Date(shipment.estimatedDelivery).toLocaleDateString()
                            : 'N/A'}
                    </Text>
                </View>
            </View>

            <View style={{ marginTop: 20 }}>
                <Text style={styles.label}>Contents:</Text>
                <Text style={styles.value}>{shipment.productDescription || 'N/A'}</Text>
            </View>

            <View style={styles.barcodeBox}>
                <Text>{/* Barcode placeholder - react-pdf doesn't natively support barcodes easily without image generation */}</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', letterSpacing: 4 }}>{shipment.trackingNumber}</Text>
            </View>

            <Text style={styles.footer}>
                Thank you for choosing Atlas Logistics. For support, visit support.atlaslogistics.com
            </Text>
        </Page>
    </Document>
);

export default ShippingLabelPDF;
