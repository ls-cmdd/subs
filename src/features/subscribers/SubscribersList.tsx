import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Trash, User, Phone, Mail, FileText, ChevronRight, Activity } from 'lucide-react';
import { invoke } from '../../lib/tauri';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

interface Subscriber {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  national_id: string | null;
  notes: string | null;
  created_at: string;
}

const subscriberSchema = z.object({
  fullName: z.string().min(2, 'Name is too short').max(100),
  phone: z.string().min(5, 'Phone is too short').max(20),
  email: z.string().email('Invalid email').or(z.literal('')),
  nationalId: z.string().or(z.literal('')),
  notes: z.string().or(z.literal(''))
});

type SubscriberFormValues = z.infer<typeof subscriberSchema>;

export default function SubscribersList() {
  const { t } = useTranslation();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SubscriberFormValues>({
    resolver: zodResolver(subscriberSchema),
    defaultValues: { fullName: '', phone: '', email: '', nationalId: '', notes: '' }
  });

  const fetchSubscribers = async () => {
    try {
      const subs: Subscriber[] = await invoke('get_subscribers', { search });
      setSubscribers(subs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubscribers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const onSubmit = async (data: SubscriberFormValues) => {
    try {
      await invoke('add_subscriber', { 
        fullName: data.fullName, 
        phone: data.phone,
        email: data.email || null,
        nationalId: data.nationalId || null,
        notes: data.notes || null
      });
      setIsAdding(false);
      reset();
      fetchSubscribers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm(t('are_you_sure', 'Are you sure?'))) return;
    try {
      await invoke('delete_subscriber', { id });
      fetchSubscribers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">{t('subscribers')}</h1>
          <p className="text-sm text-surface-500 mt-1">Manage your facility members</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 rtl:ml-2 ltr:mr-2" />
          {t('add_new')}
        </Button>
      </div>

      <Dialog isOpen={isAdding} onClose={() => setIsAdding(false)} title="Add New Subscriber" description="Enter the details of the new member.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Full Name *</label>
              <Input 
                {...register('fullName')} 
                error={errors.fullName?.message} 
                icon={<User className="w-4 h-4" />}
                placeholder="Ahmed Ali"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Phone *</label>
              <Input 
                {...register('phone')} 
                error={errors.phone?.message} 
                icon={<Phone className="w-4 h-4" />}
                placeholder="+20 100 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Email</label>
              <Input 
                {...register('email')} 
                error={errors.email?.message} 
                icon={<Mail className="w-4 h-4" />}
                placeholder="ahmed@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">National ID</label>
              <Input 
                {...register('nationalId')} 
                error={errors.nationalId?.message} 
                icon={<FileText className="w-4 h-4" />}
                placeholder="29001011234567"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-700 mb-1">Notes</label>
              <Input 
                {...register('notes')} 
                error={errors.notes?.message} 
                placeholder="Any special requirements..."
              />
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
          <div className="w-full max-w-sm">
            <Input
              type="text"
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="bg-white"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-end">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-mono text-surface-500">#{sub.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                      {sub.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-surface-900">{sub.full_name}</div>
                      {sub.national_id && <div className="text-xs text-surface-500">ID: {sub.national_id}</div>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-surface-900">{sub.phone}</div>
                  {sub.email && <div className="text-xs text-surface-500">{sub.email}</div>}
                </TableCell>
                <TableCell className="text-surface-500">
                  {new Date(sub.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Timeline">
                      <Activity className="h-4 w-4 text-surface-500" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(sub.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {subscribers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-surface-500">
                  No subscribers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
