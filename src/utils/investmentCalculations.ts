export interface CalculationResult {
  invested: number;
  totalValue: number;
  gains: number;
}

export const calculateLumpSum = (
principal: number,
rate: number,
years: number)
: CalculationResult => {
  const r = rate / 100;
  const fv = principal * Math.pow(1 + r, years);
  return {
    invested: principal,
    totalValue: Math.round(fv),
    gains: Math.round(fv - principal)
  };
};

export const calculateCompoundInterest = (
principal: number,
rate: number,
years: number,
frequency: number = 1 // 1 = Annually, 12 = Monthly, 4 = Quarterly
): CalculationResult => {
  const r = rate / 100;
  const n = frequency;
  const t = years;
  const amount = principal * Math.pow(1 + r / n, n * t);
  return {
    invested: principal,
    totalValue: Math.round(amount),
    gains: Math.round(amount - principal)
  };
};

export const calculateROI = (initialInvestment: number, finalValue: number) => {
  const gains = finalValue - initialInvestment;
  const roi = gains / initialInvestment * 100;
  return {
    gains,
    roi: parseFloat(roi.toFixed(2))
  };
};

export const calculateFutureValue = (
presentValue: number,
rate: number,
years: number,
periodicPayment: number = 0,
paymentFrequency: number = 12 // Monthly by default
) => {
  const r = rate / 100;
  // FV of PV
  const fvPv = presentValue * Math.pow(1 + r, years);

  // FV of periodic payments (Annuity)
  // Formula: PMT * (((1 + r/n)^(nt) - 1) / (r/n))
  let fvPmt = 0;
  if (periodicPayment > 0) {
    const n = paymentFrequency;
    const t = years;
    const ratePerPeriod = r / n;
    fvPmt =
    periodicPayment * (
    (Math.pow(1 + ratePerPeriod, n * t) - 1) / ratePerPeriod);
  }

  const totalValue = fvPv + fvPmt;
  const totalInvested =
  presentValue + periodicPayment * paymentFrequency * years;

  return {
    invested: totalInvested,
    totalValue: Math.round(totalValue),
    gains: Math.round(totalValue - totalInvested)
  };
};

export const calculateInflationAdjustedReturn = (
investmentAmount: number,
rateOfReturn: number,
inflationRate: number,
years: number) =>
{
  // Real Rate of Return = ((1 + Nominal Rate) / (1 + Inflation Rate)) - 1
  const nominal = rateOfReturn / 100;
  const inflation = inflationRate / 100;
  const realRate = (1 + nominal) / (1 + inflation) - 1;

  const nominalValue = investmentAmount * Math.pow(1 + nominal, years);
  const realValue = investmentAmount * Math.pow(1 + realRate, years);

  return {
    nominalValue: Math.round(nominalValue),
    realValue: Math.round(realValue),
    purchasingPowerLoss: Math.round(nominalValue - realValue),
    realRate: parseFloat((realRate * 100).toFixed(2))
  };
};

export const getAssetAllocation = (
age: number,
riskProfile: 'conservative' | 'moderate' | 'aggressive') =>
{
  // Rule of thumb: Equity = 100 - Age (modified by risk)
  let equityBase = 100 - age;

  if (riskProfile === 'conservative') equityBase -= 10;
  if (riskProfile === 'aggressive') equityBase += 10;

  // Clamp between 10 and 90
  const equity = Math.max(10, Math.min(90, equityBase));
  const debt = 100 - equity;

  // Further breakdown
  return {
    equity: {
      largeCap: Math.round(equity * 0.6),
      midCap: Math.round(equity * 0.25),
      smallCap: Math.round(equity * 0.15),
      total: equity
    },
    debt: {
      government: Math.round(debt * 0.7),
      corporate: Math.round(debt * 0.3),
      total: debt
    },
    gold: 0 // Optional, could add 5-10% and reduce others
  };
};