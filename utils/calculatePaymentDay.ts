import { lastDayOfMonth, isValid, addDays, getDate, differenceInCalendarDays } from 'date-fns';

/**
 * Calculates the payout date for a given payment day, month, and year.
 * @param paymentDay - The payment day as a string ("1" to "31" or "32" for the last day of the month).
 * @param month - The month (1 to 12).
 * @param year - The year (e.g., 2024).
 * @returns The calculated payout date.
 */
export function calculatePaymentDate(paymentDay: string, month: number, year: number): Date {
    const day = parseInt(paymentDay, 10);

    // Ensure the payment day is valid
    if (isNaN(day) || day < 1 || day > 32) {
        throw new Error('Invalid payment day. It must be between "1" and "32".');
    }

    // Handle the case where the payment day is the last day of the month
    if (day === 32) {
        return lastDayOfMonth(new Date(year, month - 1));
    }

    // Handle the case for days 1 to 31
    let tentativeDate = new Date(year, month - 1, day);

    // If the current date is past the payment day, move to the next month
    const today = new Date();
    if (tentativeDate < today) {
        tentativeDate = new Date(year, month, day);
    }

    // Check if the tentative date is valid
    if (isValid(tentativeDate) && getDate(tentativeDate) === day) {
        return tentativeDate;
    }

    // If the date is not valid (e.g., February 30), return the last day of the month
    return lastDayOfMonth(new Date(year, month - 1));
}

export function daysFromPaymentDate(paymentDay: string, month: number, year: number): number {
    const payoutDate = calculatePaymentDate(paymentDay, month, year);
    const today = new Date();

    return Math.abs(differenceInCalendarDays(today, payoutDate));
}

export function calculateFinalDate(paymentDay: string, month: number, year: number, gracePeriod: number): Date {
    const paymentDate = calculatePaymentDate(paymentDay, month, year);
    const finalDate = addDays(paymentDate, gracePeriod);
    return finalDate;
}
