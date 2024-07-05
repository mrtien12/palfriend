export interface Budget {
        id: string;
        name: string;
        amount: number;
        category: string;
        accounts: string[];
        startDate: Date
        endDate: Date
        currentAmount: number;
        recurring: boolean;
        type: string
    }

