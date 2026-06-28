import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { parseShipmentInfo } from '@/lib/utils';

// Register standard Helvetica-Bold for professional headers
Font.register({
    family: 'Helvetica-Bold',
    src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf'
});

// Curated professional palette
const colors = {
    primary: '#1e3a8a',      // Navy Blue
    secondary: '#0f172a',    // Dark Slate
    success: '#059669',      // Emerald Green
    warning: '#d97706',      // Amber
    danger: '#dc2626',       // Red
    text: '#334155',         // Slate text
    textMuted: '#64748b',    // Lighter slate
    bgLight: '#f8fafc',      // Light gray background
    border: '#e2e8f0',       // Border gray
    white: '#ffffff'
};

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        color: colors.secondary,
        backgroundColor: colors.white,
    },
    // Header section
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: `2pt solid ${colors.primary}`,
        paddingBottom: 15,
        marginBottom: 20,
    },
    logoContainer: {
        flexDirection: 'column',
    },
    logo: {
        width: 140,
        height: 60,
        objectFit: 'contain',
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    companySub: {
        fontSize: 8,
        color: colors.textMuted,
        marginTop: 2,
    },
    titleContainer: {
        textAlign: 'right',
    },
    receiptTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    receiptMeta: {
        fontSize: 9,
        color: colors.text,
        marginTop: 4,
    },
    bold: {
        fontWeight: 'bold',
    },

    // Info section (two columns)
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 15,
    },
    infoBlock: {
        flex: 1,
        padding: 12,
        backgroundColor: colors.bgLight,
        borderRadius: 8,
        border: `1pt solid ${colors.border}`,
    },
    infoTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'uppercase',
        marginBottom: 6,
        borderBottom: `0.5pt solid ${colors.border}`,
        paddingBottom: 4,
    },
    infoText: {
        fontSize: 9,
        color: colors.text,
        lineHeight: 1.4,
    },

    // Big Stats Panel (Ledger Summary)
    ledgerCard: {
        backgroundColor: colors.bgLight,
        borderRadius: 10,
        border: `1.5pt solid ${colors.border}`,
        padding: 15,
        marginBottom: 20,
    },
    ledgerTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.secondary,
        textTransform: 'uppercase',
        borderBottom: `1pt solid ${colors.border}`,
        paddingBottom: 6,
        marginBottom: 8,
    },
    ledgerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    ledgerItem: {
        width: '48%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
        fontSize: 9,
        color: colors.text,
    },
    balanceBlock: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        marginTop: 6,
        borderTop: `1pt solid ${colors.border}`,
    },
    balanceLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.secondary,
    },
    balanceValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Table Section
    tableTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: colors.primary,
        color: colors.white,
    },
    colDate: {
        width: '35%',
        fontSize: 9,
    },
    colStatus: {
        width: '30%',
        fontSize: 9,
        textAlign: 'center',
    },
    colAmount: {
        width: '35%',
        fontSize: 9,
        textAlign: 'right',
        fontWeight: 'bold',
    },
    headerCell: {
        color: colors.white,
        fontWeight: 'bold',
    },
    pill: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        fontSize: 7,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },

    // Footer section
    footer: {
        marginTop: 'auto',
        borderTop: `0.5pt solid ${colors.border}`,
        paddingTop: 15,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 8,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 1.4,
    },
    badgePaid: {
        position: 'absolute',
        top: 130,
        right: 60,
        transform: 'rotate(-12deg)',
        borderWidth: 3,
        borderRadius: 8,
        padding: 8,
        fontSize: 24,
        fontWeight: 'bold',
        opacity: 0.18,
        zIndex: 100,
    },
    signatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 20,
        marginBottom: 10,
    },
    signatureBlock: {
        width: '45%',
    },
    signatureTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.secondary,
        marginBottom: 35,
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: colors.textMuted,
        marginBottom: 4,
    },
    signatureSub: {
        fontSize: 7,
        color: colors.textMuted,
    },
    stampBlock: {
        width: '45%',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    stampOuter: {
        borderWidth: 2,
        borderRadius: 4,
        padding: 3,
        transform: 'rotate(-5deg)',
    },
    stampInner: {
        borderWidth: 1,
        borderStyle: 'dashed',
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    stampHeader: {
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    stampMain: {
        fontSize: 12,
        fontWeight: 'bold',
        marginVertical: 3,
        letterSpacing: 2,
    },
    stampFooter: {
        fontSize: 7,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    stampDate: {
        fontSize: 6,
        marginTop: 2,
    }
});

interface ReceiptPDFProps {
    shipment: any;
    settings?: { companyName: string, logoUrl: string, supportEmail: string, supportPhone: string } | null;
}

const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ shipment, settings }) => {
    const sender = parseShipmentInfo(shipment.senderInfo);
    const receiver = parseShipmentInfo(shipment.receiverInfo);

    // Ledger Calculation Helper (matching Client/Tracking views)
    const calculateLedger = () => {
        const events = shipment.events || [];
        const activeHoldEvent = events.find((e: any) => e.status === 'ON_HOLD' && !e.isDeleted);
        
        const isCurrentlyOnHold = shipment.status === 'ON_HOLD';
        const nonDeletedEvents = events.filter((e: any) => !e.isDeleted);
        const k = activeHoldEvent ? nonDeletedEvents.findIndex((e: any) => e.id === activeHoldEvent.id) : -1;
        
        const holdStart = activeHoldEvent ? new Date(activeHoldEvent.timestamp) : (shipment.createdAt ? new Date(shipment.createdAt) : new Date());
        const holdEnd = (activeHoldEvent && !isCurrentlyOnHold && k > 0) ? new Date(nonDeletedEvents[k - 1].timestamp) : new Date();
        
        const diffTime = Math.max(0, holdEnd.getTime() - holdStart.getTime());
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        
        const dailyFee = activeHoldEvent 
            ? (activeHoldEvent.holdFee ?? shipment.holdFee ?? 0) 
            : (shipment.holdFee ?? 0);
            
        const holdBaseCharge = activeHoldEvent 
            ? (activeHoldEvent.holdBaseCharge ?? shipment.holdBaseCharge ?? 0) 
            : (shipment.holdBaseCharge ?? 0);
            
        const storageAccrued = diffDays * dailyFee;
        const totalDue = holdBaseCharge + storageAccrued;
        const holdPaid = shipment.holdPaid ?? 0;
        const remainingBalance = totalDue - holdPaid;
        
        let installments: any[] = [];
        try {
            installments = typeof shipment.holdInstallments === 'string' 
                ? JSON.parse(shipment.holdInstallments || '[]') 
                : (shipment.holdInstallments || []);
            if (!Array.isArray(installments)) installments = [];
        } catch (e) {
            installments = [];
        }
        
        return {
            holdStart,
            holdEnd,
            diffDays,
            dailyFee,
            holdBaseCharge,
            storageAccrued,
            totalDue,
            holdPaid,
            remainingBalance,
            installments
        };
    };

    const ledger = calculateLedger();
    const isPaid = ledger.remainingBalance <= 0;

    return (
        <Document title={`RECEIPT-${shipment.trackingNumber}`}>
            <Page size="A4" style={styles.page}>
                
                {/* Visual Stamp Badge for PAID / OUTSTANDING */}
                <Text style={[
                    styles.badgePaid, 
                    isPaid 
                        ? { color: colors.success, borderColor: colors.success } 
                        : { color: colors.warning, borderColor: colors.warning }
                ]}>
                    {isPaid ? 'PAID IN FULL' : 'BALANCE DUE'}
                </Text>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        {settings?.logoUrl ? (
                            <Image src={settings.logoUrl} style={styles.logo} />
                        ) : (
                            <Text style={styles.companyName}>{settings?.companyName?.toUpperCase() || 'ATLAS LOGISTICS'}</Text>
                        )}
                        <Text style={styles.companySub}>Global Cargo Tracking & Logistic Solutions</Text>
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.receiptTitle}>Payment Receipt</Text>
                        <Text style={styles.receiptMeta}>
                            Date: <Text style={styles.bold}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                        </Text>
                        <Text style={styles.receiptMeta}>
                            Tracking No: <Text style={styles.bold}>{shipment.trackingNumber}</Text>
                        </Text>
                    </View>
                </View>

                {/* Info Blocks */}
                <View style={styles.infoSection}>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoTitle}>Shipment Information</Text>
                        <Text style={styles.infoText}>
                            <Text style={styles.bold}>Origin:</Text> {shipment.origin || 'N/A'}{'\n'}
                            <Text style={styles.bold}>Destination:</Text> {shipment.destination || 'N/A'}{'\n'}
                            <Text style={styles.bold}>Carrier:</Text> {settings?.companyName || 'Atlas Logistics'}{'\n'}
                            <Text style={styles.bold}>Waybill Date:</Text> {new Date(shipment.createdAt).toLocaleDateString('en-US')}{'\n'}
                            <Text style={styles.bold}>Customer Email:</Text> {shipment.customerEmail || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoTitle}>Consignee / Client Info</Text>
                        <Text style={styles.infoText}>
                            <Text style={styles.bold}>Receiver:</Text> {receiver.name || 'N/A'}{'\n'}
                            <Text style={styles.bold}>Phone:</Text> {receiver.phone || 'N/A'}{'\n'}
                            <Text style={styles.bold}>Address:</Text> {receiver.address || 'N/A'}{'\n'}
                            <Text style={styles.bold}>Sender:</Text> {sender.name || 'N/A'}{'\n'}
                            <Text style={styles.bold}>Transit Mode:</Text> {sender.vehicleType || 'TRUCK'}
                        </Text>
                    </View>
                </View>

                {/* Hold Details / Storage Invoice Summary */}
                <View style={styles.ledgerCard}>
                    <Text style={styles.ledgerTitle}>Storage & Hold Ledger Summary</Text>
                    <View style={styles.ledgerGrid}>
                        <View style={styles.ledgerItem}>
                            <Text style={styles.bold}>Base Hold Fee:</Text>
                            <Text>${ledger.holdBaseCharge.toFixed(2)}</Text>
                        </View>
                        <View style={styles.ledgerItem}>
                            <Text style={styles.bold}>Storage Daily Rate:</Text>
                            <Text>${ledger.dailyFee.toFixed(2)} / day</Text>
                        </View>
                        <View style={styles.ledgerItem}>
                            <Text style={styles.bold}>Storage Days:</Text>
                            <Text>{ledger.diffDays} {ledger.diffDays === 1 ? 'day' : 'days'}</Text>
                        </View>
                        <View style={styles.ledgerItem}>
                            <Text style={styles.bold}>Storage Accrued:</Text>
                            <Text>${ledger.storageAccrued.toFixed(2)}</Text>
                        </View>
                        <View style={styles.ledgerItem}>
                            <Text style={styles.bold}>Total Charge:</Text>
                            <Text>${ledger.totalDue.toFixed(2)}</Text>
                        </View>
                        <View style={styles.ledgerItem}>
                            <Text style={{ fontWeight: 'bold', color: colors.success }}>Total Paid to Date:</Text>
                            <Text style={{ fontWeight: 'bold', color: colors.success }}>-${ledger.holdPaid.toFixed(2)}</Text>
                        </View>

                        <View style={styles.balanceBlock}>
                            <Text style={styles.balanceLabel}>Outstanding Balance Due:</Text>
                            <Text style={[
                                styles.balanceValue, 
                                isPaid 
                                    ? { color: colors.success } 
                                    : { color: colors.danger }
                            ]}>
                                {ledger.remainingBalance < 0 
                                    ? `-$${Math.abs(ledger.remainingBalance).toFixed(2)}` 
                                    : `$${ledger.remainingBalance.toFixed(2)}`}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Payment History Table */}
                <Text style={styles.tableTitle}>Installment Payment Details</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.colDate, styles.headerCell]}>Transaction Date</Text>
                        <Text style={[styles.colStatus, styles.headerCell]}>Status</Text>
                        <Text style={[styles.colAmount, styles.headerCell]}>Amount Paid</Text>
                    </View>

                    {ledger.installments.length === 0 ? (
                        <View style={styles.tableRow}>
                            <Text style={{ width: '100%', fontSize: 9, color: colors.textMuted, textAlign: 'center', paddingVertical: 10 }}>
                                No payments recorded yet.
                            </Text>
                        </View>
                    ) : (
                        ledger.installments.map((inst, index) => (
                            <View 
                                key={inst.id || index} 
                                style={[
                                    styles.tableRow, 
                                    inst.isDeleted ? { backgroundColor: '#fef2f2' } : {}
                                ]}
                            >
                                <Text style={styles.colDate}>
                                    {new Date(inst.timestamp).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                                <View style={styles.colStatus}>
                                    <Text style={[
                                        styles.pill, 
                                        inst.isDeleted 
                                            ? { backgroundColor: '#fee2e2', color: colors.danger } 
                                            : { backgroundColor: '#d1fae5', color: colors.success }
                                    ]}>
                                        {inst.isDeleted ? 'CANCELLED' : 'CLEARED'}
                                    </Text>
                                </View>
                                <Text style={[
                                    styles.colAmount,
                                    inst.isDeleted ? { color: colors.textMuted, textDecoration: 'line-through' } : { color: colors.secondary }
                                ]}>
                                    ${(parseFloat(inst.amount) || 0).toFixed(2)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Signatures & Stamp Row */}
                <View style={styles.signatureRow}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureTitle}>Authorized Representative Signature</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureSub}>Atlas Cargo Group - Finance Department</Text>
                    </View>
                    <View style={styles.stampBlock}>
                        <View style={[
                            styles.stampOuter,
                            isPaid 
                                ? { borderColor: colors.success, backgroundColor: '#f0fdf4' } 
                                : { borderColor: colors.danger, backgroundColor: '#fef2f2' }
                        ]}>
                            <View style={[
                                styles.stampInner,
                                isPaid ? { borderColor: colors.success } : { borderColor: colors.danger }
                            ]}>
                                <Text style={[
                                    styles.stampHeader,
                                    isPaid ? { color: colors.success } : { color: colors.danger }
                                ]}>
                                    {settings?.companyName?.toUpperCase() || 'ATLAS LOGISTICS'}
                                </Text>
                                <Text style={[
                                    styles.stampMain,
                                    isPaid ? { color: colors.success } : { color: colors.danger }
                                ]}>
                                    {isPaid ? 'PAID & RELEASED' : 'SECURED / HOLD'}
                                </Text>
                                <Text style={[
                                    styles.stampFooter,
                                    isPaid ? { color: colors.success } : { color: colors.danger }
                                ]}>
                                    OFFICIAL SEAL
                                </Text>
                                <Text style={[
                                    styles.stampDate,
                                    isPaid ? { color: colors.success } : { color: colors.danger }
                                ]}>
                                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer Section */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        This invoice/receipt serves as an official statement of payment activities and holds associated with the tracking number listed.{'\n'}
                        If you have any questions, please contact our support desk at <Text style={styles.bold}>{settings?.supportEmail || 'support@atlaslogistics.site'}</Text>
                        {settings?.supportPhone ? ` or call ${settings.supportPhone}` : ''}.
                    </Text>
                    <Text style={[styles.footerText, { marginTop: 10, fontSize: 7 }]}>
                        Generated on {new Date().toLocaleString()} | Official Document of {settings?.companyName || 'Atlas Logistics'}.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default ReceiptPDF;
