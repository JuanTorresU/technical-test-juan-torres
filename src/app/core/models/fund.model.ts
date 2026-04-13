/** Tipos de dominio para la gestión de fondos de inversión */

export type NotificationMethod = 'email' | 'sms';
export type FundCategory = 'FPV' | 'FIC';
export type TransactionType = 'subscription' | 'cancellation';

/** Fondo de inversión disponible en el catálogo */
export interface Fund {
  id: number;
  name: string;
  minimumAmount: number;
  category: FundCategory;
}

/** Registro histórico de una operación (suscripción o cancelación) */
export interface Transaction {
  id: string;
  fundId: number;
  fundName: string;
  type: TransactionType;
  amount: number;
  notification: NotificationMethod;
  createdAt: string; // ISO 8601
}

/** Suscripción activa del usuario a un fondo */
export interface ActiveSubscription {
  fund: Fund;
  amount: number;
  notification: NotificationMethod;
  subscribedAt: string; // ISO 8601
}

/** Errores posibles al ejecutar una operación sobre fondos */
export type OperationError =
  | 'INSUFFICIENT_BALANCE'
  | 'ALREADY_SUBSCRIBED'
  | 'NOT_FOUND'
  | 'BELOW_MINIMUM';

/** Resultado discriminado de una operación: éxito o error tipado */
export type OperationResult =
  | { success: true }
  | { success: false; error: OperationError };
