import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { Users, CreditCard, Clock, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { invoke } from '../../lib/tauri';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

interface Stats {
  active_subscribers: number;
  current_month_revenue: number;
  expiring_soon: number;
  churn_rate: number;
}

interface ChartData {
  name: string;
  revenue: number;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const token = useAuthStore(state => state.token);
  
  const [stats, setStats] = useState<Stats>({
    active_subscribers: 0,
    current_month_revenue: 0,
    expiring_soon: 0,
    churn_rate: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data: Stats = await invoke('get_dashboard_stats');
        setStats(data);
        const cData: ChartData[] = await invoke('get_chart_data');
        setChartData(cData);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, [token]);

  const cards = [
    { 
      name: t('active_subscribers'), 
      value: stats.active_subscribers, 
      icon: Users, 
      trend: '+12%', 
      isUp: true 
    },
    { 
      name: t('monthly_revenue'), 
      value: `$${stats.current_month_revenue.toLocaleString()}`, 
      icon: CreditCard, 
      trend: '+8.1%', 
      isUp: true 
    },
    { 
      name: t('expiring_soon'), 
      value: stats.expiring_soon, 
      icon: Clock, 
      trend: '-2', 
      isUp: false 
    },
    { 
      name: 'Churn Rate', 
      value: `${stats.churn_rate.toFixed(1)}%`, 
      icon: Activity, 
      trend: '-0.5%', 
      isUp: true // lower churn is good
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <card.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className={`flex items-center text-sm font-medium ${card.isUp ? 'text-green-600' : 'text-red-600'}`}>
                  {card.trend}
                  {card.isUp ? <ArrowUpRight className="w-4 h-4 ml-1" /> : <ArrowDownRight className="w-4 h-4 ml-1" />}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-surface-500">{card.name}</p>
                <h3 className="text-2xl font-bold text-surface-900 mt-1">{card.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('monthly_revenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--color-surface-400)" fontSize={12} tickLine={false} axisLine={false} />
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
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('expiring_soon')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-surface-100 hover:bg-surface-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-surface-900">Ahmed Ali</p>
                    <p className="text-xs text-surface-500">Gold Plan</p>
                  </div>
                  <Badge variant="warning">2 days left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
