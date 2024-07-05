
interface AccountDetails {
    phase: '0' | '1' | '2' | '3' | '4';
  }

export function calculateInterest(balance: number, interestRate: number, phase: string){
    const phases: Record<AccountDetails['phase'], number> = {
        '0': 0,   // Demand Deposit, no fixed term
        '1': 1,   // 1 month term
        '2': 3,   // 3 months term
        '3': 6,   // 6 months term
        '4': 12,  // 12 months term
      };

    const interest  = balance * interestRate / 36500 * phases[phase as keyof typeof phases] * 30 
    return Math.ceil(interest)
}
