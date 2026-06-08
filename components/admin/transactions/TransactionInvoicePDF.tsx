

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Optional: Register custom fonts if needed (e.g. Inter or Roboto) to make it look premium.
// Using default fonts for safety, but styling them nicely.
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: '1px solid #eeeeee',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  invoiceTitle: {
    fontSize: 32,
    color: '#111827',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  column: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    color: '#111827',
    fontWeight: 'bold',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    flex: 1,
  },
  tableHeaderCellRight: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    flex: 1,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 12,
    color: '#111827',
    flex: 1,
  },
  tableCellRight: {
    fontSize: 12,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  summarySection: {
    marginTop: 40,
    alignItems: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 12,
    color: '#111827',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  totalLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10,
    borderTop: '1px solid #eeeeee',
    paddingTop: 20,
  },
  badgeSuccess: {
    backgroundColor: '#d1fae5',
    color: '#059669',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 10,
    alignSelf: 'flex-start',
  },
  badgeFailed: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 10,
    alignSelf: 'flex-start',
  },
  badgePending: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 10,
    alignSelf: 'flex-start',
  },
  watermark: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    opacity: 0.05,
    transform: 'rotate(-45deg)',
    fontSize: 100,
    color: '#000000',
    fontWeight: 'bold',
    zIndex: -1,
  },
  seal: {
    position: 'absolute',
    top: 40,
    right: 40,
    borderWidth: 4,
    borderRadius: 8,
    padding: '10px 20px',
    transform: 'rotate(15deg)',
    opacity: 0.8,
  },
  sealPaid: {
    borderColor: '#16a34a',
    color: '#16a34a',
  },
  sealUnpaid: {
    borderColor: '#dc2626',
    color: '#dc2626',
  },
  sealText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  systemDesignFooter: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: '1px solid #eeeeee',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 10,
  },
  agencyInfo: {
    flexDirection: 'column',
  },
  agencyTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  agencyDetail: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  agencyLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    objectFit: 'cover',
  }
});

interface TransactionInvoiceProps {
  transaction: any;
}

export const TransactionInvoicePDF = ({ transaction }: TransactionInvoiceProps) => {
  const date = new Date(transaction.createdAt).toLocaleDateString();
  const time = new Date(transaction.createdAt).toLocaleTimeString();
  
  const isPaid = transaction.status === 'success';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* WATERMARK */}
        <Text style={styles.watermark}>JILANIHOME</Text>

        {/* SEAL */}
        <View style={[styles.seal, isPaid ? styles.sealPaid : styles.sealUnpaid]}>
          <Text style={styles.sealText}>{isPaid ? 'PAID' : 'UNPAID'}</Text>
        </View>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>JilaniHome</Text>
            <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>Premium Property Platform</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
          </View>
        </View>

        {/* INFO SECTION */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Billed To</Text>
              <Text style={styles.value}>{transaction.userName || 'N/A'}</Text>
              <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{transaction.userEmail || 'N/A'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{date}</Text>
              <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{time}</Text>
            </View>
          </View>

          <View style={[styles.row, { marginTop: 20 }]}>
            <View style={styles.column}>
              <Text style={styles.label}>Invoice Number</Text>
              <Text style={styles.value}>{transaction.invoiceNumber || 'N/A'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Transaction ID</Text>
              <Text style={styles.value}>{transaction.gatewayTrxId || transaction.id.substring(0, 8).toUpperCase()}</Text>
            </View>
          </View>

          <View style={[styles.row, { marginTop: 20 }]}>
            <View style={styles.column}>
              <Text style={styles.label}>Payment Gateway</Text>
              <Text style={styles.value}>{transaction.gateway || 'N/A'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Status</Text>
              <View style={
                transaction.status === 'success' ? styles.badgeSuccess : 
                transaction.status === 'failed' ? styles.badgeFailed : 
                styles.badgePending
              }>
                <Text>{transaction.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ITEMS TABLE */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Description</Text>
            <Text style={styles.tableHeaderCell}>Points</Text>
            <Text style={styles.tableHeaderCellRight}>Amount</Text>
          </View>
          
          <View style={styles.tableRow}>
            <View style={{ flex: 2 }}>
              <Text style={styles.tableCell}>{transaction.packageName || 'Custom Package'}</Text>
            </View>
            <Text style={styles.tableCell}>{transaction.pointsCredited}</Text>
            <Text style={styles.tableCellRight}>BDT {Number(transaction.originalAmount).toFixed(2)}</Text>
          </View>
        </View>

        {/* SUMMARY */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>BDT {Number(transaction.originalAmount).toFixed(2)}</Text>
          </View>
          
          {Number(transaction.discountAmount) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Discount {transaction.promoCode ? `(${transaction.promoCode})` : ''}:
              </Text>
              <Text style={[styles.summaryValue, { color: '#dc2626' }]}>
                - BDT {Number(transaction.discountAmount).toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid:</Text>
            <Text style={styles.totalValue}>BDT {Number(transaction.amountPaid).toFixed(2)}</Text>
          </View>
        </View>

        {/* SYSTEM DESIGNED BY FOOTER */}
        <View style={styles.systemDesignFooter}>
          <View style={styles.agencyInfo}>
            <Text style={{ fontSize: 9, color: '#9ca3af', marginBottom: 4 }}>System designed by</Text>
            <Text style={styles.agencyTitle}>NeoSparkX (a software agency)</Text>
            <Text style={styles.agencyDetail}>www.neosparkx.com</Text>
            <Text style={styles.agencyDetail}>hello@neosparkx.com</Text>
            <Text style={styles.agencyDetail}>Whatsapp: +880 1788-992953</Text>
          </View>
          <View>
            {/* Provide a full URL or absolute path if available, otherwise fallback. Relative URLs often break in node environments for react-pdf. */}
            <Image src={typeof window !== 'undefined' ? "/agency/neosparkx.jpeg" : (process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/agency/neosparkx.jpeg` : "https://neosparkx.com/logo.png")} style={styles.agencyLogo} />
          </View>
        </View>

      </Page>
    </Document>
  );
};
