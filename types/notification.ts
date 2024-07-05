export interface NotificationApp{
    id: string;
    text: string;
    status : 'success' | 'error' ;
    time: Date;
    type : string;
    email: string;
}