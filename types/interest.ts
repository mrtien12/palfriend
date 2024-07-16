
export interface Interest {
    bank: string;
    interest1: string;
    interest3: string;
    interest6: string;
    interest9: string;
    interest12: string;
    interest18: string;
    interest24: string;
    orderDirection?: 'asc' | 'desc';
    limit?: number;
    type: string
}