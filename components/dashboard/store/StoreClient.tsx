"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Check, X, Shield, ArrowRight, Tag, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { validatePromoCode } from "@/lib/actions/promo-actions";
import { submitCheckout } from "@/lib/actions/transaction-actions";
import { uploadPaymentScreenshot } from "@/lib/actions/uploads";

interface StoreClientProps {
  packages: any[];
  user: any;
}

export default function StoreClient({ packages, user }: StoreClientProps) {
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Checkout State
  const [promoCode, setPromoCode] = useState("");
  const [promoData, setPromoData] = useState<any | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  const [gateway, setGateway] = useState<"bkash" | "nagad" | "rocket" | "">("");
  const [senderNumber, setSenderNumber] = useState("");
  const [gatewayTrxId, setGatewayTrxId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setPromoCode("");
    setPromoData(null);
    setPromoError("");
    setGateway("");
    setSenderNumber("");
    setGatewayTrxId("");
    setScreenshotFile(null);
    setIsModalOpen(true);
  };

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setIsApplyingPromo(true);
    setPromoError("");
    setPromoData(null);

    const res = await validatePromoCode(promoCode, user.id, Number(selectedPackage.price));
    if (res.success) {
      setPromoData(res.data);
      toast.success("Promo code applied!");
    } else {
      setPromoError(res.error || "Invalid promo code");
      toast.error(res.error || "Invalid promo code");
    }
    setIsApplyingPromo(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateway) return toast.error("Please select a payment method");
    if (!senderNumber) return toast.error("Please enter sender wallet number");
    if (!gatewayTrxId) return toast.error("Please enter transaction ID");

    setIsSubmitting(true);

    let screenshotUrl = "";
    if (screenshotFile) {
      const formData = new FormData();
      formData.append("screenshot", screenshotFile);
      const uploadRes = await uploadPaymentScreenshot(formData);
      if (!uploadRes.success) {
        setIsSubmitting(false);
        return toast.error("Failed to upload screenshot");
      }
      screenshotUrl = uploadRes.url || "";
    }

    const res = await submitCheckout({
      packageId: selectedPackage.id,
      promoCodeId: promoData?.promoId,
      gateway,
      gatewayTrxId,
      senderNumber,
      paymentScreenshot: screenshotUrl,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success(`Payment submitted! Invoice: ${res.invoiceNumber}`);
      setIsModalOpen(false);
      // Optional: Redirect to a success page or transactions history
    } else {
      toast.error(res.error || "Failed to submit payment");
    }
  };

  const getFinalPrice = () => {
    if (promoData) return promoData.finalPrice;
    return Number(selectedPackage?.price || 0);
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Coins className="w-8 h-8 text-blue-500" />
          Get Points
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-2xl">
          Purchase points to unlock exclusive property contact details. Choose a package below that suits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={pkg.id}
            className={`relative rounded-3xl overflow-hidden bg-white dark:bg-slate-800/50 border transition-all duration-300 flex flex-col ${pkg.isPopular
              ? "border-blue-500 shadow-xl shadow-blue-500/10 dark:shadow-blue-900/20 scale-100 lg:scale-105 z-10"
              : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-lg"
              }`}
          >
            {pkg.isPopular && (
              <div className="absolute top-0 left-0 w-full bg-blue-500 text-white text-[10px] uppercase tracking-widest font-bold py-1.5 text-center">
                Most Popular
              </div>
            )}

            <div className={`p-8 pb-6 flex-1 flex flex-col ${pkg.isPopular ? "pt-12" : ""}`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h3>
              {pkg.name_bn && <p className="text-sm text-gray-500 dark:text-gray-400 font-bengali mb-4">{pkg.name_bn}</p>}

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-heading font-black text-gray-900 dark:text-white">
                  ৳{Number(pkg.price).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-8 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-blue-700 dark:text-blue-300">{pkg.points} Points</span>
              </div>

              {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 && (
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.features.map((f: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex flex-shrink-0 items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{f.text}</span>
                        {f.text_bn && <span className="text-xs text-gray-500 dark:text-gray-500 font-bengali">{f.text_bn}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                onClick={() => handleSelectPackage(pkg)}
                className={`w-full py-6 text-base font-bold rounded-xl mt-auto ${pkg.isPopular
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                  : "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
              >
                Purchase Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {/* WIDTH ADJUSTED HERE: changed to w-[90vw] max-w-5xl */}
        <DialogContent className="w-[95vw] max-w-[1400px] bg-white dark:bg-[#0B1121] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white p-0 overflow-y-auto md:overflow-hidden max-h-[95vh] md:max-h-[90vh] custom-scrollbar">
          {selectedPackage && (
            <div className="flex flex-col md:flex-row h-auto md:h-full md:max-h-[90vh]">
              {/* Left Side - Summary */}
              <div className="w-full md:w-1/3 bg-gray-50 dark:bg-white/5 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10">
                <div>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Order Summary
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Package</p>
                      <p className="font-bold text-lg">{selectedPackage.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Points to Credit</p>
                      <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <Coins className="w-4 h-4" /> {selectedPackage.points}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-white/10 pt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium">৳{Number(selectedPackage.price).toFixed(2)}</span>
                    </div>
                    {promoData && (
                      <div className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400">
                        <span>Discount ({promoData.discountType === 'percentage' ? `${promoData.discountValue}%` : `৳${promoData.discountValue}`})</span>
                        <span>- ৳{promoData.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200 dark:border-white/10">
                      <span className="font-bold text-base">Total Due</span>
                      <span className="font-heading font-black text-xl text-blue-600 dark:text-blue-400">৳{getFinalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Label className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2 block">Promo Code</Label>
                  <div className="flex md:flex-col gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        disabled={!!promoData || isApplyingPromo}
                        className="pl-9 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 uppercase"
                      />
                    </div>
                    {promoData ? (
                      <Button variant="outline" onClick={() => { setPromoData(null); setPromoCode(""); }} className="px-3 border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20">
                        <X className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button onClick={handleApplyPromo} disabled={!promoCode || isApplyingPromo} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200">
                        {isApplyingPromo ? "..." : "Apply"}
                      </Button>
                    )}
                  </div>
                  {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                </div>
              </div>

              {/* Right Side - Payment Form */}
              <div className="w-full md:w-2/3 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-xl font-bold">Manual Payment</DialogTitle>
                  <DialogDescription className="text-gray-500 dark:text-gray-400">
                    Follow the instructions below to complete your purchase securely.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Gateway Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-300">Select Payment Method</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'bkash', name: 'bKash', color: 'bg-[#E2136E] text-white', logo: '/bkash.svg' },
                        { id: 'nagad', name: 'Nagad', color: 'bg-[#ED1C24] text-white', logo: '/nagad.svg' },
                        { id: 'rocket', name: 'Rocket', color: 'bg-[#8C3494] text-white', logo: '/rocket.svg' }
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setGateway(method.id as any)}
                          className={`relative py-3 px-2 rounded-xl flex items-center justify-center font-bold text-sm transition-all border-2 ${gateway === method.id
                            ? `border-[#3B82F6] ${method.color} shadow-md`
                            : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20"
                            }`}
                        >
                          {method.name}
                          {gateway === method.id && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0B1121]">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <AnimatePresence mode="wait">
                    {gateway && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-4 rounded-xl space-y-3 text-sm text-blue-900 dark:text-blue-100">
                          <p className="font-bold flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Instructions for {gateway.toUpperCase()}
                          </p>
                          <ol className="list-decimal list-inside space-y-1.5 ml-1">
                            <li>Go to your {gateway.toUpperCase()} App or dial USSD.</li>
                            <li>Select <strong>Send Money</strong> or <strong>Make Payment</strong>.</li>
                            <li>Enter this number: <strong className="text-lg tracking-wider ml-1">017XXXXXXXX</strong></li>
                            <li>Enter the amount: <strong>৳{getFinalPrice().toFixed(2)}</strong></li>
                            <li>Enter Reference: <strong>JH-POINTS</strong></li>
                            <li>Complete the transaction and save the <strong>TrxID</strong>.</li>
                          </ol>
                          {gateway === 'bkash' && (
                            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-500/30">
                              <p className="text-xs mb-2">Or use our direct payment link:</p>
                              <a href="https://shop.bkash.com/jilani-home-a-rental-platform0/paymentlink" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E2136E] text-white font-bold rounded-lg hover:bg-[#c40e5d] transition-colors text-xs">
                                bKash Payment Link <ArrowRight className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="senderNumber">Sender Wallet Number *</Label>
                      <Input
                        id="senderNumber"
                        placeholder="e.g. 01700000000"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="bg-white dark:bg-black/20"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="gatewayTrxId">Transaction ID (TrxID) *</Label>
                      <Input
                        id="gatewayTrxId"
                        placeholder="e.g. 8G2QXP1V"
                        value={gatewayTrxId}
                        onChange={(e) => setGatewayTrxId(e.target.value)}
                        className="bg-white dark:bg-black/20 uppercase"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="screenshot">Payment Screenshot (Optional)</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="screenshot"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setScreenshotFile(e.target.files[0]);
                            } else {
                              setScreenshotFile(null);
                            }
                          }}
                          className="bg-white dark:bg-black/20 flex-1 file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:mr-3 file:px-3 file:py-1 dark:file:bg-blue-500/20 dark:file:text-blue-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !gateway || !senderNumber || !gatewayTrxId}
                      className="w-full py-6 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Confirm Payment"}
                    </Button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                      Your points will be credited shortly after confirmation.
                    </p>
                  </div>

                </form>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}