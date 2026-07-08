import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Filter } from 'lucide-react';
import { invoke } from '../../lib/tauri';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { format, parseISO } from 'date-fns';

interface Subscription {
  id: number;
  subscriber_id: number;
  subscriber_name: string;
  plan_id: number;
  plan_name: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Subscriber {
  id: number;
  full_name: string;
}

interface Plan {
  id: number;
  name: string;
  duration_days: number;
}

const subSchema = z.object({
  subscriberId: z.coerce.number().min(1, 'Please select a subscriber'),
  planId: z.coerce.number().min(1, 'Please select a plan')
});

type SubFormValues = z.infer<typeof subSchema>;

export default function SubscriptionsList() {
  const { t } = useTranslation();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(subSchema) as any,
  });

  const fetchData = async () => {
    try {
      const [subs, subers, ps] = await Promise.all([
        invoke<Subscription[]>('get_subscriptions'),
        invoke<Subscriber[]>('get_subscribers', { search: '' }),
        invoke<Plan[]>('get_plans')
      ]);
      setSubscriptions(subs);
      setSubscribers(subers);
      setPlans(ps);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: SubFormValues) => {
    const plan = plans.find(p => p.id === data.planId);
    if (!plan) return;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.duration_days);
    
    try {
      await invoke('add_subscription', {
        subscriberId: data.subscriberId,
        planId: data.planId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: 'active',
        autoRenew: false
      });
      setIsAdding(false);
      reset();
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return <Badge variant="success">Active</Badge>;
      case 'expired': return <Badge variant="danger">Expired</Badge>;
      case 'cancelled': return <Badge variant="default">Cancelled</Badge>;
      default: return <Badge variant="warning">{status}</Badge>;
    }
  };

  const filteredSubs = subscriptions.filter(sub => 
    filterStatus === 'all' ? true : sub.status === filterStatus
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">{t('subscriptions')}</h1>
          <p className="text-sm text-surface-500 mt-1">Monitor active and expired memberships</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 rtl:ml-2 ltr:mr-2" />
          {t('add_new')}
        </Button>
      </div>

      <Dialog isOpen={isAdding} onClose={() => setIsAdding(false)} title="New Subscription" description="Assign a plan to a member.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Subscriber *</label>
              <select 
                {...register('subscriberId')} 
                className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.subscriberId ? 'border-red-500 focus:ring-red-500' : 'border-surface-300'}`}
              >
                <option value="">Select Subscriber</option>
                {subscribers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
              {errors.subscriberId && <p className="mt-1 text-xs text-red-500">{errors.subscriberId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Plan *</label>
              <select 
                {...register('planId')} 
                className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.planId ? 'border-red-500 focus:ring-red-500' : 'border-surface-300'}`}
              >
                <option value="">Select Plan</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration_days} days)</option>)}
              </select>
              {errors.planId && <p className="mt-1 text-xs text-red-500">{errors.planId.message}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>{t('cancel')}</Button>
            <Button type="submit" isLoading={isSubmitting}>{t('save')}</Button>
          </div>
        </form>
      </Dialog>

      <Card>
        <div className="p-4 border-b border-surface-200 flex items-center justify-between bg-surface-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-surface-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm bg-transparent border-none text-surface-700 focus:ring-0 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscriber</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubs.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.subscriber_name}</TableCell>
                <TableCell className="text-surface-600">{sub.plan_name}</TableCell>
                <TableCell className="text-surface-600">
                  {format(parseISO(sub.start_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-surface-600">
                  {format(parseISO(sub.end_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {getStatusBadge(sub.status)}
                </TableCell>
              </TableRow>
            ))}
            {filteredSubs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-surface-500">
                  No subscriptions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
