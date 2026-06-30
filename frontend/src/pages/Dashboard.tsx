import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  FileSpreadsheet, 
  FileText, 
  PlusCircle, 
  Search, 
  BarChart3, 
  DollarSign, 
  Package, 
  Weight, 
  Activity, 
  Download,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Skeleton } from '../components/Loader';
import toast from 'react-hot-toast';

interface Booking {
  bookNumber: number;
  consignmentNumber: number;
  date: string;
  time: string;
  senderName: string;
  receiverName: string;
  grandTotal: number;
  chargeableWeight: number;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  time: string;
  date: string;
}

interface DashboardData {
  todayBookingsCount: number;
  todayRevenue: number;
  totalShipments: number;
  totalWeight: number;
  monthlyRevenue: number;
  recentBookings: Booking[];
  recentActivity: ActivityItem[];
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/reports/stats');
      return res.data;
    },
  });

  const handleExport = async (format: 'excel' | 'csv') => {
    const toastId = toast.loading(`Generating ${format === 'excel' ? 'Excel' : 'CSV'} export...`);
    try {
      const url = `/reports/export/${format}`;
      const response = await api.get(url, { responseType: 'blob' });
      
      const blob = new Blob([response.data], {
        type: format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv',
      });
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `AmodXpress_Export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export completed and download started.', { id: toastId });
    } catch (err: any) {
      console.error('Export error:', err);
      toast.error('Failed to export data.', { id: toastId });
    }
  };

  const handleDownloadPdf = async (consignmentNo: number) => {
    const toastId = toast.loading(`Downloading Bill PDF...`);
    try {
      const response = await api.get(`/bills/${consignmentNo}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `AmodXpress_Bill_${consignmentNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`PDF Bill #${consignmentNo} downloaded successfully.`, { id: toastId });
    } catch (err) {
      console.error('Download PDF error:', err);
      toast.error(`Failed to download PDF Bill #${consignmentNo}.`, { id: toastId });
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white border border-slate-100 rounded-xl p-8 shadow-sm">
        <p className="text-red-500 font-semibold mb-4 text-center">Failed to fetch server metrics. Check backend connection.</p>
        <button onClick={() => refetch()} className="btn-primary">Retry Connecting</button>
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Bookings",
      value: isLoading ? <Skeleton className="h-8 w-16" /> : data?.todayBookingsCount ?? 0,
      sub: "Consignments today",
      color: "bg-blue-50 border-blue-100 text-blue-600",
      icon: Package,
    },
    {
      title: "Today's Revenue",
      value: isLoading ? <Skeleton className="h-8 w-24" /> : `₹${data?.todayRevenue.toLocaleString('en-IN') ?? 0}`,
      sub: "Total earnings today",
      color: "bg-emerald-50 border-emerald-100 text-emerald-600",
      icon: DollarSign,
    },
    {
      title: "Total Shipments",
      value: isLoading ? <Skeleton className="h-8 w-20" /> : data?.totalShipments ?? 0,
      sub: "Cumulative bookings",
      color: "bg-violet-50 border-violet-100 text-violet-600",
      icon: Activity,
    },
    {
      title: "Total Weight",
      value: isLoading ? <Skeleton className="h-8 w-20" /> : `${data?.totalWeight.toLocaleString('en-IN') ?? 0} kg`,
      sub: "Chargeable weight",
      color: "bg-amber-50 border-amber-100 text-amber-600",
      icon: Weight,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-xl p-4 sm:p-6 shadow-sm gap-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Kashmiri Gate Terminal Dashboard</h3>
          <p className="text-xs text-slate-400">Perform quick bookings, print labels, and analyze cargo distributions.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
          <Calendar size={16} className="text-slate-400" />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Main Grid statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="card-standard bg-white p-5 flex items-center justify-between border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.title}</span>
                <h4 className="text-2xl font-black text-slate-800">{c.value}</h4>
                <p className="text-xs text-slate-400 font-medium">{c.sub}</p>
              </div>
              <div className={`p-3.5 rounded-xl border ${c.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid of Quick Actions & Recent Timeline Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="card-standard p-6 border-slate-100 lg:col-span-2 space-y-4">
          <h4 className="font-bold text-slate-800 text-md tracking-tight">Quick Terminal Operations</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/create')}
              className="flex flex-col items-center justify-center p-5 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 hover:border-blue-200 rounded-xl text-primary-700 transition-all duration-200 group active:scale-95"
            >
              <PlusCircle size={28} className="mb-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-bold text-sm">Create Bill</span>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Auto numbering</span>
            </button>

            <button
              onClick={() => navigate('/search')}
              className="flex flex-col items-center justify-center p-5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 rounded-xl text-slate-700 transition-all duration-200 group active:scale-95"
            >
              <Search size={28} className="mb-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-bold text-sm">Search Bills</span>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Reprint & update</span>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="flex flex-col items-center justify-center p-5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 rounded-xl text-slate-700 transition-all duration-200 group active:scale-95"
            >
              <BarChart3 size={28} className="mb-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-bold text-sm">Daily Report</span>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Metrics breakdowns</span>
            </button>

            <button
              onClick={() => handleExport('excel')}
              className="flex flex-col items-center justify-center p-5 bg-emerald-50/30 hover:bg-emerald-50/60 border border-emerald-100/60 hover:border-emerald-200 rounded-xl text-emerald-700 transition-all duration-200 group active:scale-95"
            >
              <FileSpreadsheet size={28} className="mb-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-bold text-sm">Export Excel</span>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Download spreadsheet</span>
            </button>

            <button
              onClick={() => handleExport('csv')}
              className="flex flex-col items-center justify-center p-5 bg-emerald-50/30 hover:bg-emerald-50/60 border border-emerald-100/60 hover:border-emerald-200 rounded-xl text-emerald-700 transition-all duration-200 group active:scale-95"
            >
              <FileText size={28} className="mb-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-bold text-sm">Export CSV</span>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">Clean flat files</span>
            </button>
            
            <div className="p-5 border border-dashed border-slate-200 rounded-xl flex flex-col justify-center items-center text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Month Revenue</span>
              <span className="text-lg font-black text-slate-700 mt-1">
                {isLoading ? <Skeleton className="h-5 w-20 mx-auto" /> : `₹${data?.monthlyRevenue.toLocaleString('en-IN') ?? 0}`}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="card-standard p-6 border-slate-100 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800 text-md tracking-tight">Recent Activity Log</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold uppercase tracking-wider">Live</span>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[190px] pr-2">
            {isLoading ? (
              [1, 2, 3].map((n) => <Skeleton key={n} className="h-10 w-full" />)
            ) : !data?.recentActivity || data.recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No activities recorded today.</p>
            ) : (
              data.recentActivity.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-700">{act.message}</p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {act.date} at {act.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card-standard border-slate-100">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-md tracking-tight">Recent Booking Queue</h4>
            <p className="text-xs text-slate-400">Overview of the last 10 consignments booked at this station.</p>
          </div>
          <button 
            onClick={() => navigate('/search')}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1.5"
          >
            <span>View All Registers</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((n) => <Skeleton key={n} className="h-12 w-full" />)}
            </div>
          ) : !data?.recentBookings || data.recentBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No bookings recorded yet. Select <span className="font-semibold text-primary-600">Create Bill</span> to book your first consignment.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Consignment No</th>
                  <th className="px-6 py-4">Book No</th>
                  <th className="px-6 py-4">Date / Time</th>
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">Receiver</th>
                  <th className="px-6 py-4">Weight</th>
                  <th className="px-6 py-4">Grand Total</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {data.recentBookings.map((bill) => (
                  <tr key={bill.consignmentNumber} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary-700">#{bill.consignmentNumber}</td>
                    <td className="px-6 py-4">#{bill.bookNumber}</td>
                    <td className="px-6 py-4">
                      <div>{bill.date}</div>
                      <div className="text-[10px] text-slate-400">{bill.time}</div>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[150px]">{bill.senderName}</td>
                    <td className="px-6 py-4 truncate max-w-[150px]">{bill.receiverName}</td>
                    <td className="px-6 py-4">{bill.chargeableWeight} kg</td>
                    <td className="px-6 py-4 font-bold text-slate-800">₹{bill.grandTotal.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadPdf(bill.consignmentNumber)}
                        className="p-2 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-100 transition-all active:scale-95 inline-flex items-center gap-1.5"
                        title="Download PDF Invoice"
                      >
                        <Download size={15} />
                        <span className="text-xs font-semibold">PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
