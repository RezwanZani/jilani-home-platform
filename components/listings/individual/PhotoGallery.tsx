'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

import { Play } from 'lucide-react';

function getYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export default function PhotoGallery({ images, title, videoUrl }: { images: string[]; title: string; videoUrl?: string | null }) {
    const [current, setCurrent] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [direction, setDirection] = useState(1);

    const ytId = videoUrl ? getYoutubeId(videoUrl) : null;
    const mediaItems: { type: string; url: string; thumbnail: string; videoId?: string }[] = images.map(url => ({ type: 'image', url, thumbnail: url }));
    if (ytId) {
        mediaItems.splice(1, 0, { type: 'video', url: videoUrl!, thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`, videoId: ytId });
    }

    const go = useCallback((idx: number, dir: number) => {
        setDirection(dir);
        setCurrent(idx);
    }, []);

    const prev = useCallback(() => {
        go(current === 0 ? mediaItems.length - 1 : current - 1, -1);
    }, [current, mediaItems.length, go]);

    const next = useCallback(() => {
        go(current === mediaItems.length - 1 ? 0 : current + 1, 1);
    }, [current, mediaItems.length, go]);

    useEffect(() => {
        if (!lightbox) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'Escape') setLightbox(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightbox, prev, next]);

    useEffect(() => {
        document.body.style.overflow = lightbox ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [lightbox]);

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? '6%' : '-6%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? '-6%' : '6%', opacity: 0 }),
    };

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }} className="bg-[#111111] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="relative h-[420px] overflow-hidden bg-[#0a0a0a] group">
                    <AnimatePresence custom={direction} mode="wait">
                        {mediaItems[current].type === 'video' ? (
                            <motion.div key={`video-${current}`} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: 'easeInOut' }} className="absolute inset-0 w-full h-full z-10 bg-black">
                                <iframe src={`https://www.youtube.com/embed/${mediaItems[current].videoId}?autoplay=1`} className="w-full h-full" allow="autoplay; fullscreen" />
                            </motion.div>
                        ) : (
                            <motion.img key={`img-${current}`} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: 'easeInOut' }} src={mediaItems[current].url} alt={`${title} – photo ${current + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                        )}
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/60 via-transparent to-transparent pointer-events-none" />
                    {mediaItems.length > 1 && (
                        <>
                            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 z-20 rounded-full bg-[#0D0D0D]/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[#0D0D0D]/90 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 z-20 rounded-full bg-[#0D0D0D]/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-[#0D0D0D]/90 hover:border-white/20 transition-all opacity-0 group-hover:opacity-100"><ChevronRight className="w-4 h-4" /></button>
                        </>
                    )}
                    <div className="absolute bottom-3 left-4 flex z-20 items-center gap-1.5 bg-[#0D0D0D]/70 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs text-gray-300 border border-white/10">
                        <span className="text-white font-medium">{current + 1}</span><span className="text-gray-600">/</span><span>{mediaItems.length}</span>
                    </div>
                    <button onClick={() => setLightbox(true)} className="absolute z-20 bottom-3 right-4 flex items-center gap-1.5 bg-[#0D0D0D]/70 backdrop-blur-md border border-white/10 text-gray-300 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-all hover:border-white/20 opacity-0 group-hover:opacity-100"><ZoomIn className="w-3.5 h-3.5" /> View all</button>
                    {mediaItems.length > 1 && (
                        <div className="absolute bottom-3 z-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                            {mediaItems.map((_, i) => (
                                <button key={i} onClick={() => go(i, i > current ? 1 : -1)} className={`rounded-full transition-all duration-300 ${i === current ? 'w-4 h-1.5 bg-[#3B82F6]' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'}`} />
                            ))}
                        </div>
                    )}
                </div>
                {mediaItems.length > 1 && (
                    <div className="flex gap-2 p-3 bg-[#0e0e0e] overflow-x-auto scrollbar-hide">
                        {mediaItems.map((item, i) => (
                            <button key={i} onClick={() => go(i, i > current ? 1 : -1)} className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all duration-200 ${i === current ? 'ring-2 ring-[#3B82F6] ring-offset-1 ring-offset-[#0e0e0e]' : 'opacity-50 hover:opacity-80'}`}>
                                <img src={item.thumbnail} className="w-full h-full object-cover" />
                                {item.type === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center"><Play className="w-3 h-3 text-white ml-0.5" /></div></div>}
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {lightbox && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col" onClick={() => setLightbox(false)}>
                        <div className="flex items-center justify-between px-6 py-4 shrink-0" onClick={e => e.stopPropagation()}>
                            <span className="text-gray-400 text-sm"><span className="text-white font-medium">{current + 1}</span> / {mediaItems.length}</span>
                            <button onClick={() => setLightbox(false)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex-1 flex items-center justify-center px-16 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                            <button onClick={prev} className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10"><ChevronLeft className="w-5 h-5" /></button>
                            <AnimatePresence custom={direction} mode="wait">
                                {mediaItems[current].type === 'video' ? (
                                    <motion.div key={`lb-video-${current}`} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeInOut' }} className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-black relative">
                                        <iframe src={`https://www.youtube.com/embed/${mediaItems[current].videoId}?autoplay=1`} className="w-full h-full" allow="autoplay; fullscreen" />
                                    </motion.div>
                                ) : (
                                    <motion.img key={`lb-img-${current}`} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeInOut' }} src={mediaItems[current].url} className="max-w-full max-h-full object-contain rounded-xl" style={{ maxHeight: 'calc(100vh - 180px)' }} />
                                )}
                            </AnimatePresence>
                            <button onClick={next} className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                        <div className="flex gap-2 justify-center px-6 py-4 overflow-x-auto shrink-0" onClick={e => e.stopPropagation()}>
                            {mediaItems.map((item, i) => (
                                <button key={i} onClick={() => go(i, i > current ? 1 : -1)} className={`shrink-0 relative w-14 h-10 rounded-lg overflow-hidden transition-all ${i === current ? 'ring-2 ring-[#3B82F6]' : 'opacity-40 hover:opacity-70'}`}>
                                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                                    {item.type === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center"><Play className="w-2.5 h-2.5 text-white ml-0.5" /></div></div>}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
