export function calculateDates(date1: Date, date2: Date): number {
    // Get the time difference in milliseconds
    const differenceInTime = date2.getTime() - date1.getTime();

    // Convert the time difference from milliseconds to days
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

    return Math.floor(differenceInDays);
}