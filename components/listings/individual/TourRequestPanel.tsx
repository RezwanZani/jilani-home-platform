'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const TIME_SLOTS = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function TourRequestPanel({ listingTitle }: { listingTitle: string }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const router = useRouter();

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

    const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
    const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

    const isPast = (day: number) => { const d = new Date(viewYear, viewMonth, day); d.setHours(0, 0, 0, 0); const t = new Date(); t.setHours(0, 0, 0, 0); return d < t; };
    const isSelected = (day: number) => { if (!selectedDate) return false; return (selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day); };
    const isToday = (day: number) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

    const handleRequest = () => { if (!selectedDate || !selectedTime) return; router.push('/signup'); };

    const formattedDate = selectedDate ? selectedDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : null;

    return (
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.22 }} className="bg-[#111111] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 mb-0.5"><Calendar className="w-4 h-4 text-[#3B82F6]" /><h3 className="font-heading text-white font-semibold">Check Availability</h3></div>
                <p className="text-gray-500 text-xs">Pick a date & time slot to request a tour</p>
            </div>
            <div className="p-5 space-y-5">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-white/[0.07] flex items-center justify-center text-gray-400 hover:text-white transition-all"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-white text-sm font-medium">{MONTHS[viewMonth]} {viewYear}</span>
                        <button onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-white/[0.07] flex items-center justify-center text-gray-400 hover:text-white transition-all"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-7 mb-1">{DAYS.map(d => (<div key={d} className="text-center text-gray-600 text-[10px] font-medium py-1">{d}</div>))}</div>
                    <div className="grid grid-cols-7 gap-y-0.5">
                        {Array.from({ length: firstDayOfWeek }).map((_, i) => (<div key={`e-${i}`} />))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1; const past = isPast(day); const sel = isSelected(day); const tod = isToday(day);
                            return (
                                <button key={day} disabled={past} onClick={() => setSelectedDate(new Date(viewYear, viewMonth, day))} className={`relative mx-auto w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all ${past ? 'text-gray-700 cursor-not-allowed' : 'hover:bg-white/[0.07] cursor-pointer'} ${sel ? 'bg-[#3B82F6] text-white font-semibold shadow-[0_0_10px_rgba(59,130,246,0.4)] hover:bg-[#3B82F6]' : ''} ${!sel && !past ? 'text-gray-300' : ''}`}>
                                    {day}{tod && !sel && (<span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#3B82F6]" />)}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-widest">Time Slot</p>
                    <div className="grid grid-cols-3 gap-1.5">
                        {TIME_SLOTS.map(t => (
                            <button key={t} onClick={() => setSelectedTime(t)} className={`py-2 rounded-lg text-xs transition-all border ${selectedTime === t ? 'bg-[#3B82F6]/15 border-[#3B82F6]/40 text-[#3B82F6] font-medium' : 'border-white/[0.07] text-gray-400 hover:border-white/20 hover:text-white'}`}>{t}</button>
                        ))}
                    </div>
                </div>
                {(selectedDate || selectedTime) && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 space-y-1.5">
                        {selectedDate && <div className="flex items-center gap-2 text-xs text-gray-300"><Calendar className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" /><span>{formattedDate}</span></div>}
                        {selectedTime && <div className="flex items-center gap-2 text-xs text-gray-300"><Clock className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" /><span>{selectedTime}</span></div>}
                    </motion.div>
                )}
                <button onClick={handleRequest} disabled={true} className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl transition-all ${false ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_0_16px_rgba(59,130,246,0.35)] hover:shadow-[0_0_24px_rgba(59,130,246,0.55)]' : 'bg-white/[0.05] text-gray-600 cursor-not-allowed border border-white/[0.07]'}`}><Calendar className="w-4 h-4" /> Request a Tour</button>
                <p className="text-gray-700 text-xs text-center -mt-2">This service is not available for this property.</p>
            </div>
        </motion.div>
    );
}
