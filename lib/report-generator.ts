import { Payment } from '@/types';

// PDF Report Generation
export async function generatePDFReport(
    payments: Payment[],
    title: string,
    dateRange: string
): Promise<void> {
    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241); // Indigo
    doc.text('Martı Takip', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text(title, pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(dateRange, pageWidth / 2, 38, { align: 'center' });

    // Summary
    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
    const cashTotal = payments.filter(p => p.paymentType === 'cash').reduce((sum, p) => sum + p.amount, 0);
    const ibanTotal = payments.filter(p => p.paymentType === 'iban').reduce((sum, p) => sum + p.amount, 0);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Özet', 20, 55);

    doc.setFontSize(10);
    doc.text(`Toplam Kazanç: ₺${totalEarnings.toFixed(2)}`, 20, 65);
    doc.text(`Nakit: ₺${cashTotal.toFixed(2)}`, 20, 72);
    doc.text(`IBAN: ₺${ibanTotal.toFixed(2)}`, 20, 79);
    doc.text(`Toplam Yolcu: ${payments.length}`, 20, 86);

    // Table header
    let yPos = 100;
    doc.setFillColor(99, 102, 241);
    doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Saat', 25, yPos + 2);
    doc.text('Tutar', 55, yPos + 2);
    doc.text('Tür', 95, yPos + 2);
    doc.text('Kullanıcı', 125, yPos + 2);
    doc.text('Konum', 160, yPos + 2);

    // Table rows
    doc.setTextColor(60, 60, 60);
    yPos += 12;

    payments.slice(0, 30).forEach((payment, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }

        const time = payment.createdAt instanceof Date
            ? `${payment.createdAt.getHours().toString().padStart(2, '0')}:${payment.createdAt.getMinutes().toString().padStart(2, '0')}`
            : '--:--';

        doc.text(time, 25, yPos);
        doc.text(`₺${payment.amount.toFixed(2)}`, 55, yPos);
        doc.text(payment.paymentType === 'cash' ? 'Nakit' : 'IBAN', 95, yPos);
        doc.text(payment.user.substring(0, 12), 125, yPos);
        doc.text(payment.location.substring(0, 20), 160, yPos);

        yPos += 8;
    });

    if (payments.length > 30) {
        doc.text(`... ve ${payments.length - 30} kayıt daha`, 20, yPos + 5);
    }

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
        `Oluşturulma: ${new Date().toLocaleString('tr-TR')}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
    );

    // Save
    doc.save(`marti-takip-rapor-${Date.now()}.pdf`);
}

// Excel Report Generation
export async function generateExcelReport(
    payments: Payment[],
    title: string
): Promise<void> {
    // Dynamic import
    const XLSX = await import('xlsx');

    // Prepare data
    const data = payments.map(p => ({
        'Tarih': p.createdAt instanceof Date ? p.createdAt.toLocaleDateString('tr-TR') : '-',
        'Saat': p.createdAt instanceof Date
            ? `${p.createdAt.getHours().toString().padStart(2, '0')}:${p.createdAt.getMinutes().toString().padStart(2, '0')}`
            : '-',
        'Tutar (₺)': p.amount,
        'Ödeme Türü': p.paymentType === 'cash' ? 'Nakit' : 'IBAN',
        'Kullanıcı': p.user,
        'Konum': p.location,
    }));

    // Add summary row
    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
    data.push({
        'Tarih': '',
        'Saat': '',
        'Tutar (₺)': totalEarnings,
        'Ödeme Türü': 'TOPLAM',
        'Kullanıcı': '',
        'Konum': '',
    });

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapor');

    // Auto-size columns
    const colWidths = [
        { wch: 12 }, // Tarih
        { wch: 8 },  // Saat
        { wch: 12 }, // Tutar
        { wch: 12 }, // Ödeme Türü
        { wch: 15 }, // Kullanıcı
        { wch: 25 }, // Konum
    ];
    ws['!cols'] = colWidths;

    // Save
    XLSX.writeFile(wb, `marti-takip-rapor-${Date.now()}.xlsx`);
}
