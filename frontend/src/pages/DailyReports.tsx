import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  DollarSign, 
  Package, 
  Weight, 
  Layers
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
  productType: string;
  paymentMode: string;
  bookingMode: string;
}

interface DashboardData {
  todayBookingsCount: number;
  todayRevenue: number;
  totalShipments: number;
  totalWeight: number;
  monthlyRevenue: number;
  recentBookings: Booking[];
}

export const DailyReports: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ['reportStats'],
    queryFn: async () => {
      const res = await api.get('/reports/stats');
      return res.data;
    },
  });

  const handleExport = async (format: 'excel' | 'csv') => {
    const toastId = toast.loading(`Generating ${format === 'excel' ? 'Excel' : 'CSV'} report file...`);
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
      link.setAttribute('download', `AmodXpress_Report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report downloaded successfully.', { id: toastId });
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export daily report.', { id: toastId });
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-white border border-slate-100 rounded-xl p-6">
        <p className="text-red-500 font-semibold mb-3">Failed to load reports metrics.</p>
        <button onClick={() => refetch()} className="btn-primary">Retry loading</button>
      </div>
    );
  }

  // Filter only today's bookings for the report table
  const todayStr = (() => {
    const dateObj = new Date();
    const offset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(dateObj.getTime() + offset);
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const year = istDate.getUTCFullYear();
    return `${day}-${month}-${year}`;
  })();

  const todayBookings = data?.recentBookings.filter(b => b.date === todayStr) || [];
  const todayWeight = todayBookings.reduce((sum, b) => sum + b.chargeableWeight, 0);
  const todayParcelsCount = todayBookings.filter(b => b.productType === 'Parcel').length;

  return (
    <div className="space-y-6">
      {/* Printable Sheet Styles (hides sidebars and layouts during browser print) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          aside, header, nav, button, .hidden-print {
            display: none !important;
          }
          body, main, .print-container {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
          }
          .print-header {
            display: block !important;
          }
          .card-standard {
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }
        }
        .print-header {
          display: none;
        }
      `}} />

      {/* Top operational info bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-sm gap-4 hidden-print">
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Daily Manifest & Audit Sheet</h3>
          <p className="text-xs text-slate-400">Summarize current terminal volumes, run local print jobs or download formats.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button onClick={handleBrowserPrint} className="btn-secondary py-1.5 flex items-center gap-1.5 text-xs flex-1 sm:flex-none justify-center">
            <Printer size={14} />
            <span>Print Report</span>
          </button>
          <button onClick={() => handleExport('excel')} className="btn-primary py-1.5 flex items-center gap-1.5 text-xs flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 shadow-emerald-500/10 justify-center">
            <FileSpreadsheet size={14} />
            <span>Excel Export</span>
          </button>
          <button onClick={() => handleExport('csv')} className="btn-primary py-1.5 flex items-center gap-1.5 text-xs flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 hover:border-blue-700 shadow-blue-500/10 justify-center">
            <FileText size={14} />
            <span>CSV Export</span>
          </button>
        </div>
      </div>

      {/* Printable Header */}
      <div className="print-header space-y-2 border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-800">AMODXPRESS DAILY MANIFEST REPORT</h1>
        <div className="flex justify-between text-xs text-slate-500 font-bold uppercase">
          <span>Delhi Kashmir Gate Terminal</span>
          <span>Date: {todayStr}</span>
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-standard bg-white p-5 border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Today's Bookings</span>
            <h4 className="text-xl font-black text-slate-800">
              {isLoading ? <Skeleton className="h-6 w-12" /> : todayBookings.length}
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">Consignment count</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg hidden-print">
            <Package size={20} />
          </div>
        </div>

        <div className="card-standard bg-white p-5 border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Today's Revenue</span>
            <h4 className="text-xl font-black text-slate-800">
              {isLoading ? <Skeleton className="h-6 w-20" /> : `₹${(data?.todayRevenue || 0).toLocaleString('en-IN')}`}
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">Net terminal earnings</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg hidden-print">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="card-standard bg-white p-5 border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Today's Weight</span>
            <h4 className="text-xl font-black text-slate-800">
              {isLoading ? <Skeleton className="h-6 w-16" /> : `${todayWeight.toFixed(1)} kg`}
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">Total chargeable weight</span>
          </div>
          <div className="p-3 bg-violet-50 text-violet-600 rounded-lg hidden-print">
            <Weight size={20} />
          </div>
        </div>

        <div className="card-standard bg-white p-5 border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Today's Parcels</span>
            <h4 className="text-xl font-black text-slate-800">
              {isLoading ? <Skeleton className="h-6 w-12" /> : todayParcelsCount}
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">Parcel / box type count</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg hidden-print">
            <Layers size={20} />
          </div>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="card-standard border-slate-100">
        <div className="p-5 border-b border-slate-100">
          <h4 className="font-bold text-slate-800 text-sm tracking-tight">Consignments Manifest Table</h4>
          <p className="text-xs text-slate-400">List of bookings registered under date: {todayStr}</p>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-5 space-y-2">
              {[1, 2].map((n) => <Skeleton key={n} className="h-10 w-full" />)}
            </div>
          ) : todayBookings.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm font-medium">
              No consignments booked under date {todayStr} yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Consignment No</th>
                  <th className="px-5 py-3.5">Book No</th>
                  <th className="px-5 py-3.5">Time</th>
                  <th className="px-5 py-3.5">Sender</th>
                  <th className="px-5 py-3.5">Receiver</th>
                  <th className="px-5 py-3.5">Weight</th>
                  <th className="px-5 py-3.5">Mode</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5 text-right">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {todayBookings.map((bill) => (
                  <tr key={bill.consignmentNumber}>
                    <td className="px-5 py-3.5 font-bold text-primary-700">#{bill.consignmentNumber}</td>
                    <td className="px-5 py-3.5">#{bill.bookNumber}</td>
                    <td className="px-5 py-3.5">{bill.time}</td>
                    <td className="px-5 py-3.5 truncate max-w-[130px]">{bill.senderName}</td>
                    <td className="px-5 py-3.5 truncate max-w-[130px]">{bill.receiverName}</td>
                    <td className="px-5 py-3.5">{bill.chargeableWeight} kg</td>
                    <td className="px-5 py-3.5 uppercase">{bill.bookingMode}</td>
                    <td className="px-5 py-3.5">{bill.paymentMode}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 text-right">₹{bill.grandTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Manifest Signature block shown ONLY when printed */}
      <div className="hidden sm:hidden print:flex justify-between items-center mt-12 pt-8 border-t border-dashed border-slate-300 text-xs font-semibold text-slate-600">
        <div>
          <span>Operator ID: admin</span>
        </div>
        <div className="text-center">
          <div className="w-40 border-b border-slate-400 mb-1" />
          <span>Duty Manager Signature</span>
        </div>
      </div>
    </div>
  );
};
