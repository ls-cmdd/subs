import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Printer } from 'lucide-react';
import { invoke } from '../../lib/tauri';
import { jsPDF } from 'jspdf';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { format, parseISO } from 'date-fns';

interface Payment {
  id: number;
  subscription_id: number;
  subscriber_name: string;
  plan_name: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_id: string | null;
}

export default function PaymentsList() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);

  const fetchPayments = async () => {
    try {
      const p: Payment[] = await invoke('get_payments');
      setPayments(p);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handlePrintReceipt = (payment: Payment) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5' // A5 size is good for receipts
    });

    doc.setFontSize(20);
    doc.text('SubManager Receipt', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Receipt #: ${payment.id.toString().padStart(6, '0')}`, 20, 40);
    doc.text(`Date: ${format(parseISO(payment.payment_date), 'MMM dd, yyyy')}`, 20, 50);
    
    doc.line(20, 55, 130, 55);
    
    doc.text('Billed To:', 20, 65);
    doc.setFont('', 'bold');
    doc.text(payment.subscriber_name, 20, 72);
    doc.setFont('', 'normal');
    
    doc.text(`Plan: ${payment.plan_name}`, 20, 85);
    doc.text(`Method: ${payment.payment_method.toUpperCase()}`, 20, 95);
    if(payment.reference_id) {
      doc.text(`Ref: ${payment.reference_id}`, 20, 105);
    }
    
    doc.line(20, 115, 130, 115);
    
    doc.setFontSize(16);
    doc.setFont('', 'bold');
    doc.text(`Total Paid: $${payment.amount.toFixed(2)}`, 20, 130);
    
    doc.setFontSize(10);
    doc.setFont('', 'normal');
    doc.text('Thank you for your business!', 105, 180, { align: 'center' });

    doc.save(`Receipt-${payment.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">{t('payments')}</h1>
          <p className="text-sm text-surface-500 mt-1">View transaction history</p>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Receipt #</TableHead>
              <TableHead>Subscriber</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-end">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-surface-500">
                  {payment.id.toString().padStart(6, '0')}
                </TableCell>
                <TableCell className="font-medium">{payment.subscriber_name}</TableCell>
                <TableCell className="text-surface-600">{payment.plan_name}</TableCell>
                <TableCell className="font-semibold text-surface-900">${payment.amount.toFixed(2)}</TableCell>
                <TableCell className="text-surface-600">
                  {format(parseISO(payment.payment_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <span className="uppercase text-xs font-semibold tracking-wider text-surface-500 bg-surface-100 px-2 py-1 rounded">
                    {payment.payment_method}
                  </span>
                </TableCell>
                <TableCell className="text-end">
                  <Button variant="outline" size="sm" onClick={() => handlePrintReceipt(payment)}>
                    <Printer className="w-4 h-4 rtl:ml-2 ltr:mr-2" />
                    Print
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-surface-500">
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
