// billNotifications.ts
import { LocalNotifications } from '@capacitor/local-notifications';
import { Bill } from './BillContext'; // Adjust the import path according to your project
import { UserSettings } from './BillContext';

/**
 * Sends local notifications for overdue bills.
 * Only sends for bills that are overdue or if `notifyUntilPaid` is true and not yet paid.
 */
export const sendBillNotifications = async (bills: Bill[], settings: UserSettings) => {
  if (!bills.length) return;

  const now = new Date();

  const notifications = bills
    .filter(bill => {
      const due = new Date(bill.nextDueDate);
      // Notify if past due OR if notifyUntilPaid is true and not paid
      return due <= now && (!bill.isPaid || bill.notifyUntilPaid);
    })
    .map((bill, index) => ({
      id: index + 1, // unique ID for the notification
      title: 'Bill Reminder',
      body: `Your bill "${bill.name}" of ${bill.amount} ${settings.currency} is due!`,
      schedule: { at: new Date(Date.now() + 1000) }, // schedule 1 sec later
      extra: { billId: bill.id }
    }));

  if (notifications.length > 0) {
    try {
      await LocalNotifications.schedule({ notifications });
      console.log('Notifications sent:', notifications.length);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }
};

/**
 * Starts an interval to automatically send notifications every hour.
 */
export const startBillNotificationLoop = (bills: Bill[], settings: UserSettings) => {
  // Run immediately first
  sendBillNotifications(bills, settings);

  // Repeat every 1 hour
  const interval = setInterval(() => {
    sendBillNotifications(bills, settings);
  }, 1000 * 60 * 60); // 1 hour

  return interval; // Return interval to allow cleanup with clearInterval
};
