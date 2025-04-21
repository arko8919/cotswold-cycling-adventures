export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface AlertMessage {
  type: AlertType;
  message: string;
  timeout?: number;
}
