import { invoke as tauriInvoke } from '@tauri-apps/api/core';

// Helper to check if we're running inside Tauri
const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri()) {
    return tauriInvoke<T>(cmd, args);
  }

  console.warn(`[Browser Mock] Tauri invoke called for: ${cmd}`, args);

  // Provide mock responses for the browser preview environment
  switch (cmd) {
    case 'check_system_setup':
      return true as T;
    case 'setup_system':
      return "Admin user created successfully." as T;
    case 'login':
      if (args?.username === 'admin' && args?.password === 'admin123') {
        return { id: 1, username: 'admin', role: 'admin' } as T;
      }
      throw new Error("Invalid credentials");
    case 'get_dashboard_stats':
      return {
        active_subscribers: 15,
        current_month_revenue: 1250.50,
        expiring_soon: 3,
        churn_rate: 2.5
      } as T;
    case 'get_chart_data':
      return [
        { name: '2023-01', revenue: 400 },
        { name: '2023-02', revenue: 600 },
        { name: '2023-03', revenue: 800 },
      ] as T;
    case 'get_subscribers':
      return [
        { id: 1, full_name: 'John Doe', phone: '123456789', email: 'john@example.com', national_id: '1234', notes: '', created_at: new Date().toISOString() }
      ] as T;
    case 'get_plans':
      return [
        { id: 1, name: 'Basic', description: 'Basic Plan', duration_days: 30, price: 10 }
      ] as T;
    case 'get_subscriptions':
      return [
        { id: 1, subscriber_id: 1, subscriber_name: 'John Doe', plan_id: 1, plan_name: 'Basic', start_date: '2023-01-01', end_date: '2023-01-31', status: 'active' }
      ] as T;
    case 'get_payments':
      return [
        { id: 1, subscriber_name: 'John Doe', plan_name: 'Basic', amount: 10, payment_method: 'Cash', payment_date: '2023-01-01', receipt_number: 'REC-001' }
      ] as T;
    case 'add_subscriber':
    case 'add_plan':
    case 'add_subscription':
    case 'add_payment':
      return 1 as T;
    case 'delete_subscriber':
      return undefined as T;
    default:
      console.warn(`No mock provided for ${cmd}`);
      return null as T;
  }
}
