"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Check, X, Shield, ArrowRight, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { validatePromoCode } from "@/lib/actions/promo-actions";
import { submitCheckout } from "@/lib/actions/transaction-actions";
import { uploadPaymentScreenshot } from "@/lib/actions/uploads";

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: any;
  user: any;
}

export function CheckoutModal({ isOpen, onClose, selectedPackage, user }: CheckoutModalProps) {
  const [promoCode, setPromoCode] = useState("");
  const [promoData, setPromoData] = useState<any | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  const [gateway, setGateway] = useState<"bkash" | "nagad" | "rocket" | "">("");
  const [senderNumber, setSenderNumber] = useState("");
  const [gatewayTrxId, setGatewayTrxId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPromoCode("");
      setPromoData(null);
      setPromoError("");
      setGateway("");
      setSenderNumber("");
      setGatewayTrxId("");
      setScreenshotFile(null);
    }
  }, [isOpen, selectedPackage]);

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
    if (!senderNumber) return toast.error("Please enter your bKash number");
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
      onClose();
    } else {
      toast.error(res.error || "Failed to submit payment");
    }
  };

  const getFinalPrice = () => {
    if (promoData) return promoData.finalPrice;
    return Number(selectedPackage?.price || 0);
  };

  if (!selectedPackage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[900px] md:max-w-[1100px] bg-white dark:bg-[#0B1121] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white p-0 overflow-hidden max-h-[85vh] [&>button]:rounded-full [&>button]:bg-white/90 [&>button]:dark:bg-black/50 [&>button]:backdrop-blur-sm [&>button]:border [&>button]:border-gray-200 [&>button]:dark:border-white/15 [&>button]:w-8 [&>button]:h-8 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:top-3 [&>button]:right-3 [&>button]:shadow-md [&>button]:opacity-100 hover:[&>button]:bg-gray-100 hover:dark:[&>button]:bg-black/70">
        <div className="overflow-y-auto max-h-[85vh] custom-scrollbar w-full">
          <div className="flex flex-col md:flex-row h-auto min-h-0">
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
            <div className="w-full md:w-2/3 p-6 md:p-8 overflow-y-auto custom-scrollbar md:max-h-[85vh]">
              <DialogHeader className="mb-6 text-center flex flex-col items-center">
                <img src="/bkash.svg" alt="bKash Logo" className="w-28 h-28 mb-2 object-contain" />
                <DialogTitle className="text-xl font-bold text-[#E2136E]">পেমেন্ট করুন বিকাশ-এ</DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400 text-center">
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
                      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-4 rounded-xl space-y-3 text-sm text-blue-900 dark:text-blue-100 font-bengali">
                        <p className="font-bold flex items-center gap-2 font-sans">
                          <Shield className="w-4 h-4" /> {gateway.toUpperCase()} Payment Instructions
                        </p>
                        <div className="space-y-3">
                          <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-blue-200 dark:border-blue-500/20">
                            <p className="font-bold font-sans text-base text-gray-900 dark:text-white">Jilani Home Bkash Account: <span className="tracking-widest text-[#E2136E]">01560-034744</span></p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">এটি একটি মার্চেন্ট একাউন্ট।</p>
                          </div>

                          <ol className="list-decimal list-outside pl-4 space-y-2 text-sm leading-relaxed text-gray-800 dark:text-gray-200 font-bengali">
                            <li>রেফারেন্স হিসেবে আপনার ফোন নম্বর দিন।</li>
                            <li>আপনার পিন নম্বর কখনোই জিলানী হোম জানবে না। এটি বিকাশ নিয়ন্ত্রিত পপ-আপ। আপনার পিন কারো সাথে শেয়ার করবেন না।</li>
                            <li>পেমেন্ট সম্পন্ন করার পর ট্রানজ্যাকশন আইডি (<strong className="font-sans">TrxID</strong>) সংরক্ষণ করুন।</li>
                          </ol>

                          <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-500/30">
                            <p className="text-sm mb-2 font-medium">অথবা, সরাসরি লিংকের মাধ্যমে পেমেন্ট করতে ক্লিক করুন:</p>
                            <a href="https://shop.bkash.com/jilani-home-a-rental-platform0/paymentlink" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E2136E] !text-white font-bold rounded-lg hover:bg-[#c40e5d] transition-colors font-sans text-sm shadow-sm">
                              Payment Link <ArrowRight className="w-4 h-4" />
                            </a>
                          </div>

                          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 rounded-lg mt-3">
                            <p className="text-red-700 dark:text-red-400 font-bold text-xs flex items-start gap-1.5">
                              <span className="text-lg leading-none mt-0.5">*</span>
                              <span>পেমেন্ট করার পর অবশ্যই পেমেন্টের একটি স্ক্রিনশট নিচের ফর্মটিতে আপলোড করবেন অথবা <strong className="font-sans">WhatsApp</strong> বাটনে ক্লিক করে পাঠাবেন। Jilani Home.</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="senderNumber">Your Bkash Number *</Label>
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
                    <div className="flex flex-col gap-3">
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
                        className="bg-white dark:bg-black/20 file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:mr-3 file:px-3 file:py-1 dark:file:bg-blue-500/20 dark:file:text-blue-300"
                      />

                      <div className="mt-3 p-4 border border-green-200 dark:border-green-900/50 rounded-xl bg-green-50/50 dark:bg-green-500/10 flex flex-col gap-3">
                        <p className="text-sm font-bold text-green-800 dark:text-green-400 font-bengali">অথবা, আপনি WhatsApp-এর মাধ্যমে পেমেন্ট স্ক্রিনশট পাঠাতে পারেন:</p>
                        <a
                          href={`https://wa.me/8801400536002?text=${encodeURIComponent(`Payment Submission\nName: ${user?.name || ""}\nEmail: ${user?.email || ""}\nPackage: ${selectedPackage.name}\nAmount: ৳${getFinalPrice().toFixed(2)}\nYour Bkash Number: ${senderNumber || "[Enter your number]"}\nTrxID: ${gatewayTrxId || "[Enter TrxID]"}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] !text-white font-bold rounded-lg hover:bg-[#128C7E] transition-colors text-sm w-full sm:w-auto font-bengali"
                        >
                          WhatsApp-এ স্ক্রিনশট পাঠান
                        </a>
                      </div>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
