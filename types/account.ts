
export interface Account {
    id: string;
    name: string;
    type: string;
    amount: number;
    email: string;

}

export interface CheckingAccount extends Account {
    accountNumber: string;
    bank: string;

}

export interface DepositAccount extends Account {
    interestRate: number;
    phase: string ;
    startDate: Date;
    settlementDate: Date;

}

export interface DebtAccount extends Account {
    associated: string,
    principal: number
    interestRate: number;
    startDate: Date;
    paymentDay : string;
    months: number;
    monthly_payment: number;
    full : boolean;

}

export interface CreditCardAccount extends Account {
    limit: number;
    interestRate: number;
    paymentDay : string;
    grace: number;
    startDate: Date;
    full : boolean;

}