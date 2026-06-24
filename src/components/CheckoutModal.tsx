import React, { useState } from "react";
import { BookingItem } from "../types";
import { CreditCard, ShieldCheck, Ticket, CheckCircle2, Loader2, X, Info, Tag } from "lucide-react";

interface CheckoutModalProps {
  cart: BookingItem[];
  isOpen: boolean;
  onClose: () => void;
  onClearCart: () => void;
}

export default function CheckoutModal({ cart, isOpen, onClose, onClearCart }: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: ""
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate Cart Totals
  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const taxes = Math.round(subtotal * 0.08); // 8% local airport tax & vat
  const total = subtotal + taxes;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    
    // Auto format card digits with spaces
    if (name === "cardNumber") {
      value = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) value = value.slice(0, 19);
    }
    // Limit CVV
    if (name === "cvv") {
      value = value.slice(0, 4);
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          paymentMethod: formData
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessData(data);
      } else {
        setError(data.error || "Payment failed. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to dynamic transaction servers. Check your environment.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setFormData({ cardNumber: "", cardHolder: "", expiry: "", cvv: "" });
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative" id="checkout-modal-container">
        
        {/* Close Button */}
        {!loading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-all"
            id="close-checkout-btn"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal body */}
        <div className="p-6 md:p-8 space-y-6">
          {successData ? (
            /* Success confirmation screen */
            <div className="text-center py-8 space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-slate-100">Booking Successfully Certified!</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your payments have been processed. Digital flight tickets and lodging access vouchers are listed below.
                </p>
              </div>

              {/* Reference detail */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl max-w-md mx-auto flex justify-between items-center text-xs font-mono px-5">
                <span className="text-slate-500">BOOKING REF:</span>
                <span className="font-bold text-sky-400 tracking-widest">{successData.bookingReference}</span>
              </div>

              {/* Issued Tickets */}
              <div className="space-y-3 max-w-md mx-auto text-left">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">My Boarding & Stay Passes</span>
                {successData.tickets.map((ticket: any) => {
                  const cartItem = cart.find(c => c.id === ticket.id);
                  return (
                    <div key={ticket.id} className="bg-slate-950 border-l-4 border-l-sky-500 border border-slate-850 p-3 rounded-r-xl flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-500">{ticket.type} PASS</span>
                        <h5 className="text-xs font-bold text-slate-200">{ticket.title}</h5>
                        {cartItem && cartItem.type === 'flight' && (
                          <div className="flex items-center gap-1.5 text-[9px] text-sky-400 font-mono mt-0.5">
                            <span>SEAT(S): <strong className="text-slate-200">{cartItem.seat}</strong></span>
                            <span>•</span>
                            <span>PAX: <strong className="text-slate-200">{cartItem.passengersCount}</strong></span>
                          </div>
                        )}
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-[10px] text-emerald-400 font-bold block">CONFIRMED</span>
                        <span className="text-[11px] text-slate-400 font-semibold">{ticket.ticketCode}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleReset}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                id="finish-booking-btn"
              >
                Done, Return Dashboard
              </button>
            </div>
          ) : (
            /* Checkout inputs screen */
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-sky-400" />
                  <span>Real-time Secure Checkout</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Review booked elements and fill card fields for direct routing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Summary list */}
                <div className="space-y-4">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Booked Elements ({cart.length})</span>
                  
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] uppercase bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-bold">
                              {item.type}
                            </span>
                            <span className="font-bold text-slate-200 truncate max-w-[130px]">{item.title}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">{item.subtitle}</p>
                        </div>
                        <span className="font-mono font-bold text-slate-200">${item.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Totals */}
                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-2 text-xs font-medium">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-mono text-slate-300">${subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Local Taxes & VAT (8%):</span>
                      <span className="font-mono text-slate-300">${taxes}</span>
                    </div>
                    <div className="flex justify-between text-slate-200 border-t border-slate-800 pt-2 font-bold text-sm">
                      <span>Certified Total:</span>
                      <span className="font-mono text-sky-400">${total}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Payment details form */}
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Authorized Card Details</span>

                  {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex gap-2 items-start">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Card number */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="4111 2222 3333 4444"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                      required
                    />
                  </div>

                  {/* Cardholder */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardHolder"
                      value={formData.cardHolder}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Expiry */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-semibold">Expiry Date</label>
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                        required
                      />
                    </div>

                    {/* CVV */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase font-semibold">CVV</label>
                      <input
                        type="password"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="•••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || cart.length === 0}
                    className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authorizing Funds...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize Payment of ${total}</span>
                      </>
                    )}
                  </button>
                  
                  <div className="flex justify-center items-center gap-1 text-[10px] text-slate-500 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>256-BIT HIGH GATEWAY ENCRYPTION SECURED</span>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
