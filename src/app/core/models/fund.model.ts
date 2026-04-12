export type NotificationMethod = 'email' | 'sms';
export type FundCategory = 'FPV' | 'FIC';
export type TransactionType = 'subscription' | 'cancellation';

export interface Fund {
  id: number;
  name: string;
  minimumAmount: number;
  category: FundCategory;
}

export interface Transaction {
  id: string;
  fundId: number;
  fundName: string;
  type: TransactionType;
  amount: number;
  notification: NotificationMethod;
  createdAt: string; // ISO string
}

export interface ActiveSubscription {
  fund: Fund;
  amount: number;
  notification: NotificationMethod;
  subscribedAt: string; // ISO string
}

export type OperationError =
  | 'INSUFFICIENT_BALANCE'
  | 'ALREADY_SUBSCRIBED'
  | 'NOT_FOUND'
  | 'BELOW_MINIMUM';

export type OperationResult =
  | { success: true }
  | { success: false; error: OperationError };
