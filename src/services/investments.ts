import { StockData, FundData } from '../types';

// Mock data for Indian Market
export const MOCK_STOCKS: StockData[] = [
{
  symbol: 'RELIANCE',
  name: 'Reliance Industries',
  price: 2450.5,
  change: 12.4,
  changePercent: 0.51
},
{
  symbol: 'TCS',
  name: 'Tata Consultancy Svcs',
  price: 3890.0,
  change: -15.2,
  changePercent: -0.39
},
{
  symbol: 'HDFCBANK',
  name: 'HDFC Bank',
  price: 1650.75,
  change: 8.9,
  changePercent: 0.54
},
{
  symbol: 'INFY',
  name: 'Infosys',
  price: 1420.3,
  change: 5.1,
  changePercent: 0.36
},
{
  symbol: 'ICICIBANK',
  name: 'ICICI Bank',
  price: 980.4,
  change: 10.2,
  changePercent: 1.05
}];


export const MOCK_FUNDS: FundData[] = [
{
  id: 'f1',
  name: 'HDFC Mid-Cap Opportunities',
  category: 'Equity',
  risk: 'High',
  minSip: 500,
  returns3Yr: 18.5
},
{
  id: 'f2',
  name: 'SBI Blue Chip Fund',
  category: 'Equity',
  risk: 'Moderate',
  minSip: 500,
  returns3Yr: 14.2
},
{
  id: 'f3',
  name: 'Axis Long Term Equity',
  category: 'ELSS',
  risk: 'Moderate',
  minSip: 500,
  returns3Yr: 15.8
},
{
  id: 'f4',
  name: 'ICICI Prudential Value',
  category: 'Value',
  risk: 'High',
  minSip: 1000,
  returns3Yr: 16.4
},
{
  id: 'f5',
  name: 'Parag Parikh Flexi Cap',
  category: 'Flexi Cap',
  risk: 'Low',
  minSip: 1000,
  returns3Yr: 20.1
}];


export const getLiveStockPrices = async (): Promise<StockData[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Add some random fluctuation
  return MOCK_STOCKS.map((stock) => ({
    ...stock,
    price: stock.price + (Math.random() * 10 - 5),
    change: stock.change + (Math.random() * 2 - 1)
  }));
};

export const getRecommendedFunds = (
riskProfile: 'Low' | 'Moderate' | 'High')
: FundData[] => {
  if (riskProfile === 'High') return MOCK_FUNDS;
  if (riskProfile === 'Moderate')
  return MOCK_FUNDS.filter((f) => f.risk !== 'High');
  return MOCK_FUNDS.filter((f) => f.risk === 'Low');
};