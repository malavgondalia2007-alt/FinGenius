import * as pdfjsLib from 'pdfjs-dist';
import { Expense } from '../types';

// Set worker source - in a real app this might need to be configured differently
// depending on the build system (Vite, Webpack, etc.)
// For now we'll assume the worker is available or handled by the bundler
// If this fails, we might need to set GlobalWorkerOptions.workerSrc
try {
  // @ts-ignore
  if (
  typeof window !== 'undefined' &&
  !pdfjsLib.GlobalWorkerOptions.workerSrc)
  {
    // @ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
} catch (e) {
  console.warn('Failed to set PDF worker source', e);
}

interface PDFTextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
}

interface PDFTextContent {
  items: PDFTextItem[];
  styles: Record<string, unknown>;
}

export const parsePDF = async (
file: File,
userId: string)
: Promise<Partial<Expense>[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let fullText = '';

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = (await page.getTextContent()) as PDFTextContent;
        const pageText = textContent.items.map((item) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      const expenses: Partial<Expense>[] = [];

      // Strategy: Look for patterns in the text
      // This is heuristic-based as PDF structure varies wildly

      // Split by lines or common delimiters
      // We'll try to find lines that look like transactions
      // Pattern: Date ... Description ... Amount OR Description ... Date ... Amount

      // Regex for date (DD/MM/YYYY, YYYY-MM-DD, etc.)
      const dateRegex =
      /(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})|(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/;

      // Regex for amount (currency symbols optional, commas allowed)
      const amountRegex =
      /(?:rs\.?|inr|₹|\$)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i;

      // Split text into potential transaction lines
      // We use a more aggressive split to handle table rows that might be concatenated
      const lines = fullText.
      split(/\n|\r|\s{4,}/).
      filter((line) => line.trim().length > 5);

      for (const line of lines) {
        // Must have a number that looks like an amount
        const amountMatch = line.match(amountRegex);
        if (!amountMatch) continue;

        // Must have something that looks like a date
        const dateMatch = line.match(dateRegex);

        // If we have an amount, we'll try to extract it
        const amountStr = amountMatch[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);

        if (isNaN(amount) || amount <= 0) continue;

        // If we have a date, parse it, otherwise default to today
        let date = new Date().toISOString().split('T')[0];
        if (dateMatch) {
          try {
            const dateStr = dateMatch[0].replace(/[./]/g, '-');
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              date = parsedDate.toISOString().split('T')[0];
            }
          } catch (e) {

            // Keep default date
          }}

        // Description is the rest of the line
        // Remove the date and amount from the line to get description
        let description = line.
        replace(amountMatch[0], '').
        replace(dateMatch ? dateMatch[0] : '', '').
        trim();

        // Clean up description
        description = description.replace(/^[^\w]+|[^\w]+$/g, ''); // Trim non-word chars
        if (description.length < 3) description = 'Imported Transaction';

        // Guess category based on keywords in description
        const lowerDesc = description.toLowerCase();
        let category = 'General';

        const categoryMap: Record<string, string[]> = {
          Food: [
          'restaurant',
          'cafe',
          'coffee',
          'burger',
          'pizza',
          'swiggy',
          'zomato',
          'food',
          'dining'],

          Groceries: [
          'mart',
          'grocery',
          'supermarket',
          'vegetable',
          'fruit',
          'milk',
          'bigbasket',
          'blinkit'],

          Transport: [
          'uber',
          'ola',
          'fuel',
          'petrol',
          'diesel',
          'parking',
          'toll',
          'metro',
          'bus',
          'train',
          'flight',
          'airline'],

          Shopping: [
          'amazon',
          'flipkart',
          'myntra',
          'clothing',
          'shoe',
          'wear',
          'store',
          'shop'],

          Utilities: [
          'bill',
          'electricity',
          'water',
          'gas',
          'internet',
          'wifi',
          'broadband',
          'mobile',
          'recharge',
          'phone'],

          Entertainment: [
          'movie',
          'cinema',
          'netflix',
          'prime',
          'spotify',
          'game',
          'show'],

          Health: [
          'pharmacy',
          'medical',
          'doctor',
          'hospital',
          'clinic',
          'medicine',
          'health'],

          Rent: ['rent', 'housing', 'maintenance'],
          Education: [
          'school',
          'college',
          'course',
          'udemy',
          'coursera',
          'book',
          'tuition']

        };

        for (const [cat, keywords] of Object.entries(categoryMap)) {
          if (keywords.some((k) => lowerDesc.includes(k))) {
            category = cat;
            break;
          }
        }

        // Determine type
        const essentialCategories = [
        'Food',
        'Groceries',
        'Transport',
        'Utilities',
        'Health',
        'Rent',
        'Education'];

        const type = essentialCategories.includes(category) ?
        'essential' :
        'non-essential';

        // Avoid duplicates or header rows that might have been matched
        // e.g. "Amount Date Description" might match if it has numbers
        if (
        description.toLowerCase().includes('total') &&
        description.length < 10)

        continue;

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

      if (expenses.length === 0) {
        reject(
          new Error(
            'No valid transactions found in PDF. Please try converting to CSV or Excel.'
          )
        );
      } else {
        resolve(expenses);
      }
    } catch (error) {
      console.error('PDF parsing error:', error);
      reject(
        new Error(
          'Failed to parse PDF file. Ensure it is a valid PDF document.'
        )
      );
    }
  });
};