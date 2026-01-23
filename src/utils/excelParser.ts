import { read, utils } from 'xlsx';
import { Expense } from '../types';

export const parseExcel = async (
file: File,
userId: string)
: Promise<Partial<Expense>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = utils.sheet_to_json<any>(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          throw new Error('Excel file appears to be empty or missing data');
        }

        // Find header row (look for 'amount' or 'date')
        let headerRowIndex = 0;
        const headerRow = jsonData.find((row, index) => {
          const rowStr = JSON.stringify(row).toLowerCase();
          if (rowStr.includes('amount') || rowStr.includes('date')) {
            headerRowIndex = index;
            return true;
          }
          return false;
        });

        if (!headerRow) {
          // Fallback to first row if no header found
          headerRowIndex = 0;
        }

        const headers = (jsonData[headerRowIndex] as any[]).map((h) =>
        String(h).toLowerCase().trim()
        );
        const rows = jsonData.slice(headerRowIndex + 1);

        const expenses: Partial<Expense>[] = [];

        // Map column indices
        const amountIdx = headers.findIndex(
          (h) =>
          h.includes('amount') || h.includes('cost') || h.includes('price')
        );
        const dateIdx = headers.findIndex(
          (h) => h.includes('date') || h.includes('time')
        );
        const categoryIdx = headers.findIndex(
          (h) => h.includes('category') || h.includes('type')
        );
        const descIdx = headers.findIndex(
          (h) =>
          h.includes('description') ||
          h.includes('desc') ||
          h.includes('details') ||
          h.includes('note')
        );

        if (amountIdx === -1) {
          throw new Error(
            'Could not find an "Amount" column. Please check your Excel file headers.'
          );
        }

        rows.forEach((row: any) => {
          // Skip empty rows
          if (!row || row.length === 0) return;

          const amountVal = row[amountIdx];
          const dateVal = dateIdx !== -1 ? row[dateIdx] : new Date();
          const categoryVal = categoryIdx !== -1 ? row[categoryIdx] : 'General';
          const descVal = descIdx !== -1 ? row[descIdx] : 'Imported Expense';

          // Parse Amount
          let amount = 0;
          if (typeof amountVal === 'number') {
            amount = amountVal;
          } else if (typeof amountVal === 'string') {
            amount = parseFloat(amountVal.replace(/[^\d.-]/g, ''));
          }

          if (isNaN(amount) || amount <= 0) return;

          // Parse Date
          let date = new Date().toISOString().split('T')[0];
          if (dateVal) {
            // Excel dates are sometimes numbers (days since 1900)
            if (typeof dateVal === 'number') {
              const dateObj = new Date(
                Math.round((dateVal - 25569) * 86400 * 1000)
              );
              if (!isNaN(dateObj.getTime())) {
                date = dateObj.toISOString().split('T')[0];
              }
            } else {
              const dateObj = new Date(dateVal);
              if (!isNaN(dateObj.getTime())) {
                date = dateObj.toISOString().split('T')[0];
              }
            }
          }

          // Determine Type
          const essentialCategories = [
          'food',
          'housing',
          'rent',
          'transport',
          'utilities',
          'health',
          'education',
          'groceries',
          'medical',
          'insurance'];

          const type = essentialCategories.some((cat) =>
          String(categoryVal).toLowerCase().includes(cat)
          ) ?
          'essential' :
          'non-essential';

          expenses.push({
            userId,
            amount,
            category: String(categoryVal),
            date,
            type,
            description: String(descVal),
            createdAt: new Date().toISOString()
          });
        });

        resolve(expenses);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
};