import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../services/api';
import { billFormSchema } from '../utils/validation';
import type { BillFormInput } from '../utils/validation';
import { numberToWords } from '../utils/numberToWords';
import { 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Download, 
  RefreshCw, 
  X, 
  Scale, 
  IndianRupee, 
  User, 
  MapPin, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Spinner, Skeleton } from '../components/Loader';
import toast from 'react-hot-toast';

interface Bill {
  bookNumber: number;
  consignmentNumber: number;
  date: string;
  time: string;
  bookingType: 'Domestic' | 'International';
  bookingMode: 'Air' | 'Surface';
  productType: 'Document' | 'Parcel' | 'Fragile' | 'Others';
  destination: string;
  senderName: string;
  senderAddress: string;
  senderCity: string;
  senderState: string;
  senderPincode: string;
  senderMobile: string;
  receiverName: string;
  receiverAddress: string;
  receiverCity: string;
  receiverState: string;
  receiverPincode: string;
  receiverMobile: string;
  articles: number;
  actualWeight: number;
  length: number;
  width: number;
  height: number;
  volumetricWeight: number;
  chargeableWeight: number;
  description: string;
  freightCharges: number;
  handlingCharges: number;
  otherCharges: number;
  insuranceAmount: number;
  grandTotal: number;
  amountInWords: string;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'To-Pay' | 'COD';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export const SearchBills: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals status
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null);

  // Fetch list of bills
  const { data: bills = [], isLoading, isError, refetch } = useQuery<Bill[]>({
    queryKey: ['billsList', searchTerm],
    queryFn: async () => {
      const res = await api.get('/bills', { params: { search: searchTerm } });
      return res.data;
    },
  });

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

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (consignmentNo: number) => {
      await api.delete(`/bills/${consignmentNo}`);
    },
    onSuccess: () => {
      toast.success('Consignment deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['billsList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setDeletingBill(null);
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to delete consignment.');
    }
  });

  return (
    <div className="space-y-6">
      {/* Search Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search by Consignment, Book, Names, Mobile, Date..."
            className="form-input pl-10 pr-4 py-2.5"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
        </div>
        <button
          onClick={() => refetch()}
          className="btn-secondary flex items-center gap-2 self-stretch md:self-auto justify-center"
        >
          <RefreshCw size={14} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Main Results Table */}
      <div className="card-standard border-slate-100">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-12 w-full" />)}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500 font-semibold">
              Failed to query bills database. Please verify connections.
            </div>
          ) : bills.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              No bills found matching search filters.
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
                  <th className="px-6 py-4">Chargeable Wt</th>
                  <th className="px-6 py-4">Grand Total</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {bills.map((bill) => (
                  <tr key={bill.consignmentNumber} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary-700">#{bill.consignmentNumber}</td>
                    <td className="px-6 py-4">#{bill.bookNumber}</td>
                    <td className="px-6 py-4">
                      <div>{bill.date}</div>
                      <div className="text-[10px] text-slate-400">{bill.time}</div>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[140px]">{bill.senderName}</td>
                    <td className="px-6 py-4 truncate max-w-[140px]">{bill.receiverName}</td>
                    <td className="px-6 py-4">{bill.chargeableWeight} kg</td>
                    <td className="px-6 py-4 font-bold text-slate-800">₹{bill.grandTotal.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => setViewingBill(bill)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditingBill(bill)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Bill"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(bill.consignmentNumber)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingBill(bill)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Bill"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* VIEW MODAL DRAW-OVER */}
      {viewingBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-3xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Consignment Bill Details</h3>
                <p className="text-xs text-slate-400">Consignment Number: #{viewingBill.consignmentNumber} | Book Number: #{viewingBill.bookNumber}</p>
              </div>
              <button onClick={() => setViewingBill(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Row 1: Booking Details */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-xs font-semibold text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Booking Date</span>
                  <span className="text-sm font-bold text-slate-800">{viewingBill.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Booking Time</span>
                  <span className="text-sm font-bold text-slate-800">{viewingBill.time}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Mode & Type</span>
                  <span className="text-sm font-bold text-slate-800">{viewingBill.bookingType} ({viewingBill.bookingMode})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Product Type</span>
                  <span className="text-sm font-bold text-slate-800">{viewingBill.productType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Destination</span>
                  <span className="text-sm font-bold text-slate-800">{viewingBill.destination || 'N/A'}</span>
                </div>
              </div>

              {/* Row 2: Sender vs Receiver Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="border border-slate-100 rounded-xl p-4 space-y-2 bg-slate-50/30">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <User size={12} />
                    Sender Details
                  </span>
                  <h4 className="font-bold text-slate-800">{viewingBill.senderName}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{viewingBill.senderAddress}</p>
                  <p className="text-xs text-slate-700 font-semibold">{viewingBill.senderCity}, {viewingBill.senderState} - {viewingBill.senderPincode}</p>
                  <p className="text-xs font-bold text-primary-700">Mob: {viewingBill.senderMobile}</p>
                </div>

                <div className="border border-slate-100 rounded-xl p-4 space-y-2 bg-slate-50/30">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={12} />
                    Receiver Details
                  </span>
                  <h4 className="font-bold text-slate-800">{viewingBill.receiverName}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{viewingBill.receiverAddress}</p>
                  <p className="text-xs text-slate-700 font-semibold">{viewingBill.receiverCity}, {viewingBill.receiverState} - {viewingBill.receiverPincode}</p>
                  <p className="text-xs font-bold text-primary-700">Mob: {viewingBill.receiverMobile}</p>
                </div>
              </div>

              {/* Row 3: Shipment Details */}
              <div className="border border-slate-100 rounded-xl p-4 space-y-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Scale size={12} />
                  Cargo Dimensions & Weight
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Articles Count</span>
                    <span className="text-slate-800 text-sm font-bold">{viewingBill.articles} Unit(s)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Actual Weight</span>
                    <span className="text-slate-800 text-sm font-bold">{viewingBill.actualWeight} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Volumetric Weight</span>
                    <span className="text-slate-800 text-sm font-bold">{viewingBill.volumetricWeight} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-primary-500 font-bold block">Chargeable Weight</span>
                    <span className="text-primary-700 text-sm font-extrabold">{viewingBill.chargeableWeight} kg</span>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-3 text-xs">
                  <span className="text-[10px] text-slate-400 block mb-1">Description of Cargo</span>
                  <p className="text-slate-700 font-semibold">{viewingBill.description}</p>
                </div>
              </div>

              {/* Row 4: Charges Details */}
              <div className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <IndianRupee size={12} />
                  Freight charges grid
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Freight Charges</span>
                    <span className="text-slate-800 text-sm">₹{viewingBill.freightCharges.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Handling Charges</span>
                    <span className="text-slate-800 text-sm">₹{viewingBill.handlingCharges.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Other Charges</span>
                    <span className="text-slate-800 text-sm">₹{viewingBill.otherCharges.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Insurance Amount</span>
                    <span className="text-slate-800 text-sm">₹{viewingBill.insuranceAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center bg-white p-3 border border-slate-100 rounded-lg pt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Grand Total</span>
                    <span className="text-[10px] text-slate-400 font-medium leading-none">Excludes GST (Zero Tax Policy)</span>
                  </div>
                  <span className="text-lg font-black text-slate-800">₹{viewingBill.grandTotal.toFixed(2)}</span>
                </div>
                <div className="bg-white p-2.5 border border-slate-100 rounded-lg text-xs font-semibold">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Grand Total in Words</span>
                  <p className="text-slate-700 capitalize">{viewingBill.amountInWords}</p>
                </div>
              </div>

              {/* Remarks & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/20">
                  <span className="text-[10px] text-slate-400 block">Payment Mode</span>
                  <span className="text-sm font-bold text-slate-800">{viewingBill.paymentMode}</span>
                </div>
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/20">
                  <span className="text-[10px] text-slate-400 block">Remarks</span>
                  <span className="text-sm font-bold text-slate-800">{viewingBill.remarks || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-between bg-slate-50">
              <span className="text-[9px] text-slate-400 font-semibold uppercase self-center">
                Last modified: {new Date(viewingBill.updatedAt).toLocaleString('en-IN')}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setViewingBill(null);
                    setEditingBill(viewingBill);
                  }}
                  className="btn-secondary py-1.5 flex items-center gap-1 text-xs"
                >
                  <Edit3 size={12} />
                  <span>Modify</span>
                </button>
                <button
                  onClick={() => handleDownloadPdf(viewingBill.consignmentNumber)}
                  className="btn-primary py-1.5 flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10"
                >
                  <Download size={12} />
                  <span>Reprint invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL DRAW-OVER */}
      {editingBill && (
        <EditBillModal
          bill={editingBill}
          onClose={() => setEditingBill(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['billsList'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            setEditingBill(null);
          }}
          handleDownloadPdf={handleDownloadPdf}
        />
      )}

      {/* DELETE MODAL DRAW-OVER */}
      {deletingBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-50 border border-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-md tracking-tight">Delete Consignment Booking?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to delete Consignment <span className="font-bold text-slate-700">#{deletingBill.consignmentNumber}</span>?
                This action is irreversible and will delete the row permanently from the Google Sheet records.
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setDeletingBill(null)}
                className="btn-secondary py-2 flex-1 text-xs"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingBill.consignmentNumber)}
                className="btn-danger py-2 flex-1 text-xs"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting row...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- EDIT BILL COMPONENT MODAL ---
interface EditBillModalProps {
  bill: Bill;
  onClose: () => void;
  onSuccess: () => void;
  handleDownloadPdf: (consignmentNo: number) => Promise<void>;
}

const EditBillModal: React.FC<EditBillModalProps> = ({ bill, onClose, onSuccess, handleDownloadPdf }) => {
  const [isSaving, setIsSaving] = useState(false);

  // Address line splitter
  const splitAddress = (addr: string): [string, string] => {
    if (addr.length <= 35) return [addr, ''];
    let mid = Math.floor(addr.length / 2);
    let splitIdx = addr.lastIndexOf(' ', mid);
    if (splitIdx === -1) splitIdx = addr.lastIndexOf(',', mid);
    if (splitIdx === -1) splitIdx = mid;
    return [addr.substring(0, splitIdx).trim(), addr.substring(splitIdx).trim()];
  };

  const [senderAddr1, senderAddr2] = splitAddress(bill.senderAddress);
  const [receiverAddr1, receiverAddr2] = splitAddress(bill.receiverAddress);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BillFormInput>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      bookingType: bill.bookingType,
      bookingMode: bill.bookingMode,
      productType: bill.productType,
      destination: bill.destination || '',
      senderName: bill.senderName,
      senderAddress1: senderAddr1,
      senderAddress2: senderAddr2,
      senderCity: bill.senderCity,
      senderState: bill.senderState,
      senderPincode: bill.senderPincode,
      senderMobile: bill.senderMobile,
      receiverName: bill.receiverName,
      receiverAddress1: receiverAddr1,
      receiverAddress2: receiverAddr2,
      receiverCity: bill.receiverCity,
      receiverState: bill.receiverState,
      receiverPincode: bill.receiverPincode,
      receiverMobile: bill.receiverMobile,
      articles: bill.articles,
      actualWeight: bill.actualWeight,
      length: bill.length,
      width: bill.width,
      height: bill.height,
      freightCharges: bill.freightCharges,
      handlingCharges: bill.handlingCharges,
      otherCharges: bill.otherCharges,
      insuranceAmount: bill.insuranceAmount,
      paymentMode: bill.paymentMode,
      remarks: bill.remarks || '',
      date: bill.date,
      time: bill.time,
    },
  });

  const length = useWatch({ control, name: 'length' }) || 0;
  const width = useWatch({ control, name: 'width' }) || 0;
  const height = useWatch({ control, name: 'height' }) || 0;
  const actualWeight = useWatch({ control, name: 'actualWeight' }) || 0;

  const freightCharges = useWatch({ control, name: 'freightCharges' }) || 0;
  const handlingCharges = useWatch({ control, name: 'handlingCharges' }) || 0;
  const otherCharges = useWatch({ control, name: 'otherCharges' }) || 0;
  const insuranceAmount = useWatch({ control, name: 'insuranceAmount' }) || 0;

  const volumetricWeight = Math.round(((Number(length) * Number(width) * Number(height)) / 5000) * 100) / 100;
  const chargeableWeight = Math.max(Number(actualWeight), volumetricWeight);
  const grandTotal = Math.round((Number(freightCharges) + Number(handlingCharges) + Number(otherCharges) + Number(insuranceAmount)) * 100) / 100;
  const amountInWords = numberToWords(grandTotal);

  const onSubmit = async (data: BillFormInput) => {
    setIsSaving(true);
    const toastId = toast.loading(`Updating consignment #${bill.consignmentNumber} database row...`);
    try {
      await api.put(`/bills/${bill.consignmentNumber}`, data);
      toast.success(`Consignment #${bill.consignmentNumber} updated.`, { id: toastId });
      
      // Auto-trigger PDF invoice download for the updated receipt
      await handleDownloadPdf(bill.consignmentNumber);
      
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update consignment booking.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[92vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Modify Booking Information</h3>
            <p className="text-xs text-slate-400">Consignment Number: #{bill.consignmentNumber} | Book Number: #{bill.bookNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Section 1: Booking Details */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Booking details</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Book Number</label>
                <input type="text" className="form-input bg-slate-50 font-bold" value={`#${bill.bookNumber}`} disabled />
              </div>
              <div>
                <label className="form-label">Consignment Number</label>
                <input type="text" className="form-input bg-slate-50 font-bold" value={`#${bill.consignmentNumber}`} disabled />
              </div>
              <div>
                <label className="form-label">Booking Date</label>
                <input type="text" className="form-input" {...register('date')} />
                {errors.date && <p className="text-xs text-red-500 mt-1 font-medium">{errors.date.message}</p>}
              </div>
              <div>
                <label className="form-label">Booking Time</label>
                <input type="text" className="form-input" {...register('time')} />
                {errors.time && <p className="text-xs text-red-500 mt-1 font-medium">{errors.time.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="form-label">Booking Type</label>
                <select className="form-input" {...register('bookingType')}>
                  <option value="Domestic">Domestic</option>
                  <option value="International">International</option>
                </select>
              </div>
              <div>
                <label className="form-label">Booking Mode</label>
                <select className="form-input" {...register('bookingMode')}>
                  <option value="Air">Air</option>
                  <option value="Surface">Surface</option>
                </select>
              </div>
              <div>
                <label className="form-label">Product Type</label>
                <select className="form-input" {...register('productType')}>
                  <option value="Document">Document</option>
                  <option value="Parcel">Parcel</option>
                  <option value="Fragile">Fragile</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div>
                <label className="form-label">Destination</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mumbai"
                  {...register('destination')}
                />
              </div>
            </div>
          </div>

          {/* Section 2 & 3: Sender vs Receiver */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Sender Information</h4>
              <div>
                <label className="form-label">Sender Name</label>
                <input type="text" className="form-input" {...register('senderName')} />
                {errors.senderName && <p className="text-xs text-red-500 mt-1">{errors.senderName.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="form-label">Address 1</label>
                  <input type="text" className="form-input" {...register('senderAddress1')} />
                  {errors.senderAddress1 && <p className="text-xs text-red-500 mt-1">{errors.senderAddress1.message}</p>}
                </div>
                <div>
                  <label className="form-label">Address 2</label>
                  <input type="text" className="form-input" {...register('senderAddress2')} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" {...register('senderCity')} />
                </div>
                <div>
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" {...register('senderState')} />
                </div>
                <div>
                  <label className="form-label">Pincode</label>
                  <input type="text" className="form-input font-mono" {...register('senderPincode')} />
                  {errors.senderPincode && <p className="text-xs text-red-500 mt-1">{errors.senderPincode.message}</p>}
                </div>
              </div>
              <div>
                <label className="form-label">Mobile Number</label>
                <input type="text" className="form-input font-mono" {...register('senderMobile')} />
                {errors.senderMobile && <p className="text-xs text-red-500 mt-1">{errors.senderMobile.message}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Receiver Information</h4>
              <div>
                <label className="form-label">Receiver Name</label>
                <input type="text" className="form-input" {...register('receiverName')} />
                {errors.receiverName && <p className="text-xs text-red-500 mt-1">{errors.receiverName.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="form-label">Address 1</label>
                  <input type="text" className="form-input" {...register('receiverAddress1')} />
                  {errors.receiverAddress1 && <p className="text-xs text-red-500 mt-1">{errors.receiverAddress1.message}</p>}
                </div>
                <div>
                  <label className="form-label">Address 2</label>
                  <input type="text" className="form-input" {...register('receiverAddress2')} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" {...register('receiverCity')} />
                </div>
                <div>
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" {...register('receiverState')} />
                </div>
                <div>
                  <label className="form-label">Pincode</label>
                  <input type="text" className="form-input font-mono" {...register('receiverPincode')} />
                  {errors.receiverPincode && <p className="text-xs text-red-500 mt-1">{errors.receiverPincode.message}</p>}
                </div>
              </div>
              <div>
                <label className="form-label">Mobile Number</label>
                <input type="text" className="form-input font-mono" {...register('receiverMobile')} />
                {errors.receiverMobile && <p className="text-xs text-red-500 mt-1">{errors.receiverMobile.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 4: Dimension weights */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Dimension and Weight Details</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="form-label">Articles</label>
                <input type="number" className="form-input font-semibold" {...register('articles')} />
              </div>
              <div>
                <label className="form-label">Actual Wt (kg)</label>
                <input type="number" step="0.01" className="form-input font-semibold" {...register('actualWeight')} />
              </div>
              <div>
                <label className="form-label">Length (cm)</label>
                <input type="number" step="0.1" className="form-input" {...register('length')} />
              </div>
              <div>
                <label className="form-label">Width (cm)</label>
                <input type="number" step="0.1" className="form-input" {...register('width')} />
              </div>
              <div>
                <label className="form-label">Height (cm)</label>
                <input type="number" step="0.1" className="form-input" {...register('height')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs font-semibold">
              <div className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded-lg">
                <span className="text-slate-400">Volumetric Weight:</span>
                <span className="text-slate-700">{volumetricWeight} kg</span>
              </div>
              <div className="flex justify-between items-center bg-primary-50/50 p-2 border border-primary-100 rounded-lg">
                <span className="text-primary-500">Chargeable Weight:</span>
                <span className="text-primary-700 text-sm font-bold">{chargeableWeight} kg</span>
              </div>
            </div>
            
            <div>
              <label className="form-label">Description of goods</label>
              <input type="text" className="form-input" {...register('description')} />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>
          </div>

          {/* Section 5: Charges */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Billing Charges</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Freight (₹)</label>
                <input type="number" step="0.01" className="form-input font-semibold" {...register('freightCharges')} />
              </div>
              <div>
                <label className="form-label">Handling (₹)</label>
                <input type="number" step="0.01" className="form-input font-semibold" {...register('handlingCharges')} />
              </div>
              <div>
                <label className="form-label">Others (₹)</label>
                <input type="number" step="0.01" className="form-input font-semibold" {...register('otherCharges')} />
              </div>
              <div>
                <label className="form-label">Insurance (₹)</label>
                <input type="number" step="0.01" className="form-input font-semibold" {...register('insuranceAmount')} />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex justify-between items-center bg-white p-3 border border-slate-100 rounded-lg">
                <span className="font-bold text-slate-400">Grand Total (Excl. Tax):</span>
                <span className="text-base font-black text-slate-800">₹{grandTotal.toFixed(2)}</span>
              </div>
              <div className="bg-white p-2 border border-slate-100 rounded-lg">
                <span className="text-[10px] text-slate-400 block mb-0.5">Grand Total in Words</span>
                <p className="text-slate-700 capitalize font-bold">{amountInWords}</p>
              </div>
            </div>
          </div>

          {/* Payment & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Payment Mode</label>
              <select className="form-input" {...register('paymentMode')}>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="To-Pay">To-Pay / COD</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Remarks</label>
              <input type="text" className="form-input" placeholder="e.g. Fragile contents" {...register('remarks')} />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 -m-6 rounded-b-2xl mt-4">
            <button type="button" onClick={onClose} className="btn-secondary text-xs" disabled={isSaving}>
              Cancel Modification
            </button>
            <button type="submit" className="btn-primary text-xs flex items-center gap-1 bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner size="sm" className="border-white" />
                  <span>Saving details...</span>
                </>
              ) : (
                <>
                  <FileText size={14} />
                  <span>Update and Download PDF</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
