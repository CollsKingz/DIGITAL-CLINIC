import React, { useState, useEffect } from 'react';
import { Base45Logo } from '../brand/Base45Logo';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  WifiOff,
  Database,
  ShieldCheck,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  Monitor,
  Pill,
  Stethoscope,
  ClipboardList,
  Layers
} from 'lucide-react';

export interface SlideData {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  content: React.ReactNode;
}

export const ClinicPresentationSlides: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-play interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
      }, 6000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSlide]);

  if (!isOpen) return null;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col transition-all duration-300 w-full ${
          isFullscreen ? 'h-full max-w-none rounded-none border-none' : 'max-w-5xl h-[90vh] max-h-[720px]'
        }`}
      >

        {/* Presentation Top Control Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <Base45Logo variant="badge" size="sm" />
            <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
            <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
              Executive Orientation & System Overview Slides
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Slide Index Pill */}
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              Slide {currentSlide + 1} / {SLIDES.length}
            </span>

            {/* Auto Play Toggle */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center space-x-1 ${
                isPlaying
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isPlaying ? "Pause Auto-play" : "Start Auto-play Presentation"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Display Canvas */}
        <div className="grow overflow-y-auto p-6 sm:p-10 flex flex-col justify-between text-white relative">
          
          {/* Header metadata for active slide */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${SLIDES[currentSlide].color}`}>
                {SLIDES[currentSlide].tag}
              </span>
              <span className="text-xs text-slate-400 font-medium">BASE 45 Digital Health Ecosystem</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {SLIDES[currentSlide].title}
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {SLIDES[currentSlide].subtitle}
            </p>
          </div>

          {/* Body Content of active slide */}
          <div className="grow my-2">
            {SLIDES[currentSlide].content}
          </div>

        </div>

        {/* Slide Navigation Bottom Bar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          
          {/* Direct Slide Jump Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-teal-400' : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Jump to slide ${idx + 1}: ${slide.title}`}
              />
            ))}
          </div>

          {/* Prev/Next Controls */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={prevSlide}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Slide</span>
            </button>

            <button
              onClick={nextSlide}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <span>Next Slide</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Professional Slide Deck Data
const SLIDES: SlideData[] = [
  {
    id: 1,
    tag: "Platform Overview",
    title: "1. BASE 45 Digital Health Platform Architecture",
    subtitle: "Empowering primary healthcare facilities with real-time queueing, offline-first persistence, and seamless multi-role clinical governance.",
    icon: Activity,
    color: "bg-teal-500/20 text-teal-300 border border-teal-500/30",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Rapid Queue Triage</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Eliminates paper congestion by issuing digital intake tickets with real-time wait-time estimations and urgency tagging.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Firestore Offline Resilience</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Full IndexedDB local persistence ensures zero data loss during broadband outages or load-shedding network drops.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Multi-Role Governance</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Role-tailored dashboards for Patients, Intake Clerks, Medical Doctors, and Pharmacists with PC Terminal authorization.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 2,
    tag: "Offline Continuity",
    title: "2. Firestore Offline Persistence & Sync Engine",
    subtitle: "How IndexedDB multi-tab local caching maintains clinic queue management uninterrupted when internet connectivity drops.",
    icon: WifiOff,
    color: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
    content: (
      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Offline Local Engine Active</h4>
              <p className="text-xs text-indigo-200">
                Firebase IndexedDB local cache listens to queue changes and saves incoming edits locally while disconnected.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            Auto-Sync Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 1</span>
            <h5 className="text-xs font-bold text-white">Local Ticket Intake</h5>
            <p className="text-[11px] text-slate-400">Clerk creates patient ticket. Written instantly to IndexedDB cache.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 2</span>
            <h5 className="text-xs font-bold text-white">Uninterrupted Consults</h5>
            <p className="text-[11px] text-slate-400">Doctor updates stage to 'In Consult' locally without network latency.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 3</span>
            <h5 className="text-xs font-bold text-white">Cloud Sync Reconnect</h5>
            <p className="text-[11px] text-slate-400">When network resumes, Firestore automatically reconciles pending transactions.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    tag: "Clinical Workflows",
    title: "3. Multi-Role Clinical & Staff Personas",
    subtitle: "Tailored visual workspaces for every healthcare role in the facility.",
    icon: Users,
    color: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    content: (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
          <div className="flex items-center space-x-2 text-teal-400">
            <ClipboardList className="w-4 h-4" />
            <h4 className="text-xs font-bold text-white">Intake Clerk Desk</h4>
          </div>
          <p className="text-[11px] text-slate-300">
            Rapid patient check-in, ticket creation, paper-based manual fallback intake modal.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Stethoscope className="w-4 h-4" />
            <h4 className="text-xs font-bold text-white">Doctor / Nurse Queue</h4>
          </div>
          <p className="text-[11px] text-slate-300">
            Patient consultation queue, clinical notes, stage progression to pharmacy dispensing.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400">
            <Pill className="w-4 h-4" />
            <h4 className="text-xs font-bold text-white">Pharmacy Batch Dispensing</h4>
          </div>
          <p className="text-[11px] text-slate-300">
            Batch medication prep, chronic refill verification, collection status tracking.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
          <div className="flex items-center space-x-2 text-sky-400">
            <Users className="w-4 h-4" />
            <h4 className="text-xs font-bold text-white">Patient Household Hub</h4>
          </div>
          <p className="text-[11px] text-slate-300">
            Appointment booking, proxy family member management, live queue status tracking.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 4,
    tag: "Access & Security",
    title: "4. Security Governance & Terminal Authorization",
    subtitle: "Protecting sensitive health records with hardware PC authorization and member registration controls.",
    icon: ShieldCheck,
    color: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Authorized PC Workstations</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Restricts staff access strictly to authorized clinic hardware (e.g. `PC-INTAKE-01`, `PC-PHARMACY-02`). Unrecognized terminals are blocked automatically.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Member Registration Audit Queue</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Admin verification portal logs all staff sign-ups. Staff credentials must be approved by Clinic Administrators before gaining clinical write access.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 5,
    tag: "Tech Specifications",
    title: "5. Production Tech Stack & Deployment Specs",
    subtitle: "Built on battle-tested web standards for enterprise performance and reliability.",
    icon: Layers,
    color: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    content: (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Frontend Framework</span>
          <h5 className="text-xs font-bold text-white mt-1">React 18 & TypeScript</h5>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Styling & UI</span>
          <h5 className="text-xs font-bold text-white mt-1">Tailwind CSS & Lucide</h5>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Form Validation</span>
          <h5 className="text-xs font-bold text-white mt-1">Formik & Yup Schemas</h5>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Cloud Database</span>
          <h5 className="text-xs font-bold text-white mt-1">Firebase Firestore</h5>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Error Monitoring</span>
          <h5 className="text-xs font-bold text-white mt-1">Sentry React SDK</h5>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Hosting Infrastructure</span>
          <h5 className="text-xs font-bold text-white mt-1">Vercel & Cloud Run</h5>
        </div>
      </div>
    )
  }
];
