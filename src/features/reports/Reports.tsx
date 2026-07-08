import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

const dummyData = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Jun', revenue: 5500 },
];

export default function Reports() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('6m');
  const [plan, setPlan] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">{t('reports')}</h1>
          <p className="text-sm text-surface-500 mt-1">Analyze financial performance and member activity.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50">
            <FileSpreadsheet className="w-4 h-4 rtl:ml-2 ltr:mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" className="text-red-700 border-red-200 hover:bg-red-50">
            <FileText className="w-4 h-4 rtl:ml-2 ltr:mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-surface-200 bg-surface-50/50 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-surface-600 font-medium text-sm">
            <Filter className="w-4 h-4" />
            Filters:
          </div>
          <select 
            value={period} 
            onChange={e => setPeriod(e.target.value)}
            className="h-9 px-3 py-1 rounded-md border border-surface-300 text-sm focus:ring-primary-500"
          >
            <option value="1m">Last 30 Days</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <select 
            value={plan} 
            onChange={e => setPlan(e.target.value)}
            className="h-9 px-3 py-1 rounded-md border border-surface-300 text-sm focus:ring-primary-500"
          >
            <option value="all">All Plans</option>
            <option value="gold">Gold Membership</option>
            <option value="silver">Silver Membership</option>
          </select>
        </div>
        <CardContent className="pt-6">
          <div className="h-72 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dummyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="var(--color-surface-400)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-surface-400)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-100)" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-surface-200)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: 'var(--color-surface-900)', fontWeight: 500 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-primary-600)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#reportRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <h3 className="text-lg font-semibold text-surface-900 mb-4">Detailed Results</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>New Subscribers</TableHead>
                <TableHead>Renewals</TableHead>
                <TableHead>Cancellations</TableHead>
                <TableHead className="text-end">Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyData.map((data, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-surface-900">{data.month} 2026</TableCell>
                  <TableCell className="text-surface-600">{Math.floor(data.revenue / 150)}</TableCell>
                  <TableCell className="text-surface-600">{Math.floor(data.revenue / 200)}</TableCell>
                  <TableCell className="text-red-600 font-medium">{Math.floor(data.revenue / 1000)}</TableCell>
                  <TableCell className="text-end font-semibold text-surface-900">${data.revenue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
