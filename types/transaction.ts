export interface Transaction {
    id: string;
    account: string;
    amount: number;
    date: Date;
    type: string;
    memo: string;
    category: string;
    toAccount: string;
    transferid: string
    from : boolean;
}

export interface ScheduleTransaction extends Transaction {
    frequency: string;
    every  : string
    upcomingDate: Date;
    email: string
}

