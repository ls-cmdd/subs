import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Check, Trash, Activity } from 'lucide-react';
import { invoke } from '../../lib/tauri';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';

interface Plan {
  id: number;
  name: string;
  description: string | null;
  duration_days: number;
  price: number;
}

const planSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(50),
  description: z.string().or(z.literal('')),
  durationDays: z.coerce.number().min(1, 'Must be at least 1 day'),
  price: z.coerce.number().min(0, 'Cannot be negative')
});

type PlanFormValues = z.infer<typeof planSchema>;

export default function PlansList() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(planSchema) as any,
    defaultValues: { name: '', description: '', durationDays: 30, price: 0 }
  });

  const fetchPlans = async () => {
    try {
      const p: Plan[] = await invoke('get_plans');
      setPlans(p);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const onSubmit = async (data: PlanFormValues) => {
    try {
      await invoke('add_plan', {
        name: data.name,
        description: data.description || null,
        durationDays: data.durationDays,
        price: data.price
      });
      setIsAdding(false);
      reset();
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">{t('plans')}</h1>
          <p className="text-sm text-surface-500 mt-1">Manage subscription packages</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 rtl:ml-2 ltr:mr-2" />
          {t('add_new')}
        </Button>
      </div>

      <Dialog isOpen={isAdding} onClose={() => setIsAdding(false)} title="Create New Plan" description="Define the pricing and duration.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Plan Name *</label>
              <Input 
                {...register('name')} 
                error={errors.name?.message} 
                placeholder="e.g. Gold Membership"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
              <Input 
                {...register('description')} 
                error={errors.description?.message} 
                placeholder="Brief details about the plan"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Duration (Days) *</label>
                <Input 
                  type="number"
                  {...register('durationDays')} 
                  error={errors.durationDays?.message} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Price *</label>
                <Input 
                  type="number"
                  step="0.01"
                  {...register('price')} 
                  error={errors.price?.message} 
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>{t('cancel')}</Button>
            <Button type="submit" isLoading={isSubmitting}>{t('save')}</Button>
          </div>
        </form>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col relative overflow-hidden group hover:border-primary-300 transition-colors">
            <div className="absolute top-0 right-0 p-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              {plan.description && <CardDescription>{plan.description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-surface-900">${plan.price}</span>
                <span className="text-sm font-medium text-surface-500">/ {plan.duration_days} days</span>
              </div>
              
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2 text-sm text-surface-600">
                  <Check className="h-4 w-4 text-primary-600 mt-0.5 shrink-0" />
                  <span>Access to all basic facilities</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-surface-600">
                  <Check className="h-4 w-4 text-primary-600 mt-0.5 shrink-0" />
                  <span>Valid for {plan.duration_days} consecutive days</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-4 border-t border-surface-100 bg-surface-50/50">
              <Button variant="ghost" className="w-full text-surface-500 hover:text-primary-700">
                Edit Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
