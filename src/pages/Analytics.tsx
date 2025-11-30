import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { getAnalyticsData, mockClients, mockDocuments, mockAdmins } from '@/data/mockData';
import { Users, FileText, DollarSign, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const COLORS = ['hsl(200, 98%, 39%)', 'hsl(213, 93%, 67%)', 'hsl(120, 40%, 50%)', 'hsl(40, 90%, 50%)', 'hsl(0, 70%, 50%)'];

export default function Analytics() {
  const analytics = getAnalyticsData();

  const filingsByYear = [
    { year: '2022', count: 45 },
    { year: '2023', count: 62 },
    { year: '2024', count: mockClients.filter((c) => c.filingYear === 2024).length },
  ];

  const documentStats = [
    { type: 'T4 Slips', count: mockDocuments.filter((d) => d.name.includes('T4')).length },
    { type: 'T5 Slips', count: mockDocuments.filter((d) => d.name.includes('T5')).length },
    { type: 'RRSP', count: mockDocuments.filter((d) => d.name.includes('RRSP')).length },
    { type: 'Medical', count: mockDocuments.filter((d) => d.name.includes('Medical')).length },
    { type: 'Other', count: 3 },
  ];

  const monthlyTrend = [
    { month: 'Jan', clients: 12, revenue: 4800 },
    { month: 'Feb', clients: 15, revenue: 6200 },
    { month: 'Mar', clients: 22, revenue: 9100 },
    { month: 'Apr', clients: 28, revenue: 11500 },
    { month: 'May', clients: 18, revenue: 7200 },
    { month: 'Jun', clients: 10, revenue: 4100 },
  ];

  const adminPerformance = mockAdmins.filter((a) => a.isActive).map((admin) => {
    const clients = mockClients.filter((c) => c.assignedAdminId === admin.id);
    const completed = clients.filter((c) => c.status === 'completed' || c.status === 'filed').length;
    return {
      name: admin.name,
      totalClients: clients.length,
      completed,
      pending: clients.length - completed,
    };
  });

  return (
    <DashboardLayout
      title="Analytics & Reports"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
    >
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Clients"
            value={analytics.totalClients}
            icon={Users}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Total Revenue"
            value={`$${analytics.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Completed Filings"
            value={analytics.completedFilings}
            icon={CheckCircle}
          />
          <StatCard
            title="Documents Processed"
            value={mockDocuments.filter((d) => d.status === 'complete').length}
            icon={FileText}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="clients"
                      stroke="hsl(200, 98%, 39%)"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(200, 98%, 39%)' }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(120, 40%, 50%)"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(120, 40%, 50%)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Clients by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clients by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.clientsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="status"
                    >
                      {analytics.clientsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Year-wise Filings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Year-wise Filings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filingsByYear}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(200, 98%, 39%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Document Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={documentStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="type" type="category" className="text-xs" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(213, 93%, 67%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adminPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="hsl(120, 40%, 50%)" name="Completed" />
                  <Bar dataKey="pending" stackId="a" fill="hsl(40, 90%, 50%)" name="Pending" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
