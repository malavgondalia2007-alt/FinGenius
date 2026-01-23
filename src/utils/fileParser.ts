import { Expense } from '../types';
import { parseExcel } from './excelParser';
import { parsePDF } from './pdfParser';

export const parseCSV = (
content: string,
userId: string)
: Partial<Expense>[] => {
  const lines = content.split('\n');
  const expenses: Partial<Expense>[] = [];

  // Skip header if present
  const startIndex = lines[0]?.
  toLowerCase().
  match(/amount|category|date|description/) ?
  1 :
  0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV parsing with quotes
    // Matches: "quoted value" OR value-without-comma
    const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const cleanParts = parts.map((p) => p.replace(/^"|"$/g, '').trim());

    if (cleanParts.length >= 3) {
      // Expected: Amount, Category, Date, Description (flexible order if we had headers, but assuming standard for now)
      // Standard format: Amount, Category, Date, Description

      const amountStr = cleanParts[0].replace(/[^\d.-]/g, '');
      const amount = parseFloat(amountStr);
      const category = cleanParts[1] || 'General';
      const dateStr = cleanParts[2];
      const description = cleanParts[3] || 'Imported from CSV';

      // Parse date
      let date = dateStr;
      try {
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString().split('T')[0];
        }
      } catch {}

      if (!isNaN(amount) && amount > 0) {
        const essentialCategories = [
        'food',
        'housing',
        'rent',
        'transport',
        'utilities',
        'health',
        'education',
        'groceries'];

        const type = essentialCategories.some((cat) =>
        category.toLowerCase().includes(cat)
        ) ?
        'essential' :
        'non-essential';

        expenses.push({
          userId,
          amount,
          category,
          date,
          type,
          description,
          createdAt: new Date().toISOString()
        });
      }
    }
  }
  return expenses;
};

export const parseFile = async (
file: File,
userId: string)
: Promise<Partial<Expense>[]> => {
  const fileType = file.name.split('.').pop()?.toLowerCase();

  if (fileType === 'csv') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const expenses = parseCSV(text, userId);
          if (expenses.length === 0) {
            reject(new Error('No valid expenses found in CSV.'));
          } else {
            resolve(expenses);
          }
        } catch (err) {
          reject(new Error('Failed to parse CSV file.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    return parseExcel(file, userId);
  } else if (fileType === 'pdf') {
    return parsePDF(file, userId);
  } else {
    throw new Error('Unsupported file format. Please use CSV, Excel, or PDF.');
  }
};