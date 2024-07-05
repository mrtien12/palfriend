export function calculateAmortization(amount: number, annualRate: number, months: number): number {
    // Calculate monthly interest rate
    const monthlyRate = annualRate / 12 /100;

    // Calculate monthly payment using the amortization formula
    const monthlyPayment = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    
    return Math.abs(Math.ceil(monthlyPayment));
}
