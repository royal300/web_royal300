import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, ArrowLeft, Check, Video, Image as ImageIcon, Film, 
  Calendar, Share2, Users, Target, Sparkles, User, Phone, 
  Megaphone, LineChart, Smartphone, PieChart
} from "lucide-react";

type PlatformState = {
  facebook: boolean;
  instagram: boolean;
  youtube: boolean;
  google: boolean;
};

interface PackageData {
  name: string;
  phone: string;
  reels: number;
  creatives: number;
  videos: number;
  shootDays: number;
  platforms: PlatformState;
  influencerBudget: string;
  adsManagement: boolean | null;
  weeklyAdBudget: string;
}

const TOTAL_STEPS = 8;

export default function Builder() {
  const [currentStep, setCurrentStep] = useState(0); 
  const [direction, setDirection] = useState(1);
  const [customInputVisible, setCustomInputVisible] = useState<Record<number, boolean>>({});
  const [leadId, setLeadId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Prices
  const [prices, setPrices] = useState({
    reels: 300, creatives: 80, videos: 1000, shootDays: 3000,
    facebook: 1500, instagram: 1500, youtube: 2000, google: 1000
  });

  const [data, setData] = useState<PackageData>({
    name: "", phone: "", reels: 0, creatives: 0, videos: 0, shootDays: 0,
    platforms: { facebook: false, instagram: false, youtube: false, google: false },
    influencerBudget: "", adsManagement: null, weeklyAdBudget: ""
  });

  useEffect(() => {
    fetch('/api/prices')
      .then(res => res.json())
      .then(data => {
        if (data && data.reels) setPrices(data);
      })
      .catch(err => console.error("Failed to load prices", err));
  }, []);

  const calculateTotal = () => {
    let total = 0;
    total += data.reels * prices.reels;
    total += data.creatives * prices.creatives;
    total += data.videos * prices.videos;
    total += data.shootDays * prices.shootDays;
    if (data.platforms.facebook) total += prices.facebook;
    if (data.platforms.instagram) total += prices.instagram;
    if (data.platforms.youtube) total += prices.youtube;
    if (data.platforms.google) total += prices.google;
    return total;
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, phone: data.phone })
        });
        const result = await res.json();
        if (result.success) setLeadId(result.lead_id);
      } catch (err) {
        console.error("Failed to save lead", err);
      }
      setIsSubmitting(false);
    }
    
    if (currentStep < 8) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitFinal = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, details: data })
      });
      alert("Proposal requested! We will contact you soon.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
    setIsSubmitting(false);
  };

  const updateData = (key: keyof PackageData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    if (currentStep === 0) return data.name.trim() !== "" && data.phone.trim().length >= 10;
    if (currentStep === 1) return data.reels >= 0;
    if (currentStep === 2) return data.creatives >= 0;
    if (currentStep === 3) return data.videos >= 0;
    if (currentStep === 4) return data.shootDays >= 0;
    if (currentStep === 5) return true; 
    if (currentStep === 6) return data.influencerBudget !== "";
    if (currentStep === 7) return data.adsManagement === false || (data.adsManagement === true && data.weeklyAdBudget !== "");
    return true;
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 60 : -60, opacity: 0 })
  };

  const SelectOption = ({ label, value, currentValue, onClick, icon: Icon }: any) => {
    const isSelected = currentValue === value;
    return (
      <button
        onClick={onClick}
        className={`w-full text-left p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 minimal-button ${
          isSelected ? "active border-[#a23957] bg-white/40" : "border-white/50 bg-white/20"
        }`}
      >
        <div className="flex items-center justify-between w-full sm:w-auto">
          {Icon && (
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isSelected ? "bg-[#a23957] text-white" : "bg-white/40 text-gray-700"
            }`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          )}
          {isSelected && (
            <div className="w-5 h-5 rounded-full bg-[#a23957] flex sm:hidden items-center justify-center text-white shadow-sm shrink-0">
              <Check className="w-3 h-3 stroke-[3px]" />
            </div>
          )}
        </div>
        <div className="flex-grow w-full">
          <h3 className="font-display font-semibold text-xs sm:text-sm text-gray-900">{label}</h3>
        </div>
        {isSelected && (
          <div className="hidden sm:flex w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#a23957] items-center justify-center text-white shadow-sm shrink-0">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3px]" />
          </div>
        )}
      </button>
    );
  };

  const MultiSelectOption = ({ label, priceLabel, isSelected, onClick, icon: Icon }: any) => (
    <button
      onClick={onClick}
      className={`w-full text-left p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 minimal-button ${
        isSelected ? "active border-[#a23957] bg-white/40" : "border-white/50 bg-white/20"
      }`}
    >
      <div className="flex items-center justify-between w-full sm:w-auto">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          isSelected ? "bg-[#a23957] text-white" : "bg-white/40 text-gray-700"
        }`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className={`w-5 h-5 rounded-md border-2 flex sm:hidden items-center justify-center transition-all shrink-0 ${
          isSelected ? "border-[#a23957] bg-[#a23957] text-white" : "border-gray-300 bg-white/20"
        }`}>
          {isSelected && <Check className="w-3 h-3 stroke-[3px]" />}
        </div>
      </div>
      <div className="flex-grow w-full">
        <h3 className="font-display font-semibold text-xs sm:text-sm text-gray-900 leading-tight">{label}</h3>
        <p className="text-[9px] sm:text-[10px] font-mono text-[#a23957] mt-0.5">+₹{priceLabel}</p>
      </div>
      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 hidden sm:flex items-center justify-center transition-all shrink-0 ${
        isSelected ? "border-[#a23957] bg-[#a23957] text-white" : "border-gray-300 bg-white/20"
      }`}>
        {isSelected && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3px]" />}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-[#1b1c1c] overflow-hidden">
      
      {/* Decorative Floating Ambient Icons */}
      <div className="absolute top-10 left-[5%] text-[#a23957]/10 float-slow"><Megaphone className="w-32 h-32" /></div>
      <div className="absolute bottom-20 right-[10%] text-blue-500/10 float-medium"><Target className="w-48 h-48" /></div>
      <div className="absolute top-1/4 right-[5%] text-purple-500/10 float-fast"><LineChart className="w-24 h-24" /></div>
      <div className="absolute bottom-1/3 left-[8%] text-[#a23957]/5 float-medium"><Smartphone className="w-40 h-40" /></div>
      <div className="absolute top-1/2 right-[20%] text-pink-400/10 float-slow"><PieChart className="w-20 h-20" /></div>

      {/* Main Centered Layout */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-8 relative z-10 w-full max-w-2xl mx-auto">
        
        {/* Title Header */}
        <div className="text-center mb-4 sm:mb-6 mt-[-10px] sm:mt-0">
          <img src="/logo.png" alt="Royal300 Logo" className="h-10 sm:h-16 mx-auto mb-2 sm:mb-3 drop-shadow-sm" />
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1] drop-shadow-sm">
            Build Your <br/>
            <span className="text-[#a23957]">Own Package</span>
          </h1>
        </div>

        {/* The Glass Container for the Form */}
        <div className="w-full glass-container rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col relative overflow-hidden min-h-[460px] sm:min-h-[500px]">
          
          {/* Progress Bar inside the glass container */}
          {currentStep < 8 && (
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-mono font-bold text-[#a23957] uppercase tracking-widest">
                  Step {currentStep + 1}
                </span>
                <span className="text-[10px] font-mono text-gray-500 uppercase">
                  {Math.round(((currentStep + 1) / TOTAL_STEPS) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
                  className="h-full bg-[#a23957] rounded-full"
                />
              </div>
            </div>
          )}

          {/* Form Content Area */}
          <div className="flex-grow relative">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              
              {/* SCREEN 1: LEAD CAPTURE */}
              {currentStep === 0 && (
                <motion.div
                  key="step0" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
                  className="absolute inset-0 overflow-y-auto overflow-x-hidden pr-1 pb-4"
                >
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug mb-4">
                    Let's start with your details
                  </h2>
                  <div className="space-y-3">
                    <div className="glass-input rounded-2xl p-2.5 sm:p-3 flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <input 
                        type="text" placeholder="Your Full Name" value={data.name} onChange={(e) => updateData("name", e.target.value)}
                        className="flex-grow bg-transparent border-none outline-none font-display text-sm sm:text-base px-2 text-gray-800 placeholder-gray-400"
                      />
                    </div>
                    <div className="glass-input rounded-2xl p-2.5 sm:p-3 flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <input 
                        type="tel" placeholder="Mobile Number" value={data.phone} onChange={(e) => updateData("phone", e.target.value)}
                        className="flex-grow bg-transparent border-none outline-none font-display text-sm sm:text-base px-2 text-gray-800 placeholder-gray-400"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SCREEN 2: REELS */}
              {currentStep === 1 && (
                <motion.div
                  key="step1" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
                  className="absolute inset-0 overflow-y-auto overflow-x-hidden pr-1 pb-4"
                >
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
                    How many Reels do you need?
                  </h2>
                  <p className="text-[10px] sm:text-xs text-[#a23957] font-mono mt-1 mb-4 bg-white/50 inline-block px-2 py-1 rounded-md">₹{prices.reels} per reel</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[4, 8, 12].map(num => (
                      <SelectOption 
                        key={num} label={`${num} Reels`} value={num} currentValue={!customInputVisible[1] ? data.reels : -1} 
                        onClick={() => { setCustomInputVisible({...customInputVisible, 1: false}); updateData("reels", num); }} icon={Video}
                      />
                    ))}
                    <SelectOption 
                      label="Custom" value={true} currentValue={customInputVisible[1]} 
                      onClick={() => { setCustomInputVisible({...customInputVisible, 1: true}); updateData("reels", 0); }} icon={Sparkles}
                    />
                  </div>
                  {customInputVisible[1] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-3">
                      <div className="glass-input rounded-2xl p-3 flex flex-col">
                        <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Enter Number of Reels</label>
                        <input 
                          type="number" min="0" value={data.reels || ""} onChange={(e) => updateData("reels", parseInt(e.target.value) || 0)}
                          className="bg-transparent border-b-2 border-gray-300 focus:border-[#a23957] outline-none font-display text-base py-1 text-gray-900"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* SCREEN 3: CREATIVES */}
              {currentStep === 2 && (
                <motion.div
                  key="step2" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
                  className="absolute inset-0 overflow-y-auto overflow-x-hidden pr-1 pb-4"
                >
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
                    How many Creatives do you need?
                  </h2>
                  <p className="text-[10px] sm:text-xs text-[#a23957] font-mono mt-1 mb-4 bg-white/50 inline-block px-2 py-1 rounded-md">₹{prices.creatives} per creative</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[4, 8, 12, 16].map(num => (
                      <SelectOption 
                        key={num} label={`${num} Creatives`} value={num} currentValue={!customInputVisible[2] ? data.creatives : -1} 
                        onClick={() => { setCustomInputVisible({...customInputVisible, 2: false}); updateData("creatives", num); }} icon={ImageIcon}
                      />
                    ))}
                    <div className="col-span-2">
                      <SelectOption 
                        label="Custom" value={true} currentValue={customInputVisible[2]} 
                        onClick={() => { setCustomInputVisible({...customInputVisible, 2: true}); updateData("creatives", 0); }} icon={Sparkles}
                      />
                    </div>
                  </div>
                  {customInputVisible[2] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-3">
                      <div className="glass-input rounded-2xl p-3 flex flex-col">
                        <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Enter Number of Creatives</label>
                        <input 
                          type="number" min="0" value={data.creatives || ""} onChange={(e) => updateData("creatives", parseInt(e.target.value) || 0)}
                          className="bg-transparent border-b-2 border-gray-300 focus:border-[#a23957] outline-none font-display text-base py-1 text-gray-900"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* SCREEN 4: LONG VIDEOS */}
              {currentStep === 3 && (
                <motion.div
                  key="step3" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
                  className="absolute inset-0 overflow-y-auto overflow-x-hidden pr-1 pb-4"
                >
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
                    How many Long Videos?
                  </h2>
                  <p className="text-[10px] sm:text-xs text-[#a23957] font-mono mt-1 mb-4 bg-white/50 inline-block px-2 py-1 rounded-md">₹{prices.videos} each</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[1, 2, 3].map(num => (
                      <SelectOption 
                        key={num} label={`${num} Video${num > 1 ? 's' : ''}`} value={num} currentValue={!customInputVisible[3] ? data.videos : -1} 
                        onClick={() => { setCustomInputVisible({...customInputVisible, 3: false}); updateData("videos", num); }} icon={Film}
                      />
                    ))}
                    <SelectOption 
                      label="Custom" value={true} currentValue={customInputVisible[3]} 
                      onClick={() => { setCustomInputVisible({...customInputVisible, 3: true}); updateData("videos", 0); }} icon={Sparkles}
                    />
                  </div>
                  {customInputVisible[3] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-3">
                      <div className="glass-input rounded-2xl p-3 flex flex-col">
                        <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Enter Number of Videos</label>
                        <input 
                          type="number" min="0" value={data.videos || ""} onChange={(e) => updateData("videos", parseInt(e.target.value) || 0)}
                          className="bg-transparent border-b-2 border-gray-300 focus:border-[#a23957] outline-none font-display text-base py-1 text-gray-900"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* SCREEN 5: SHOOT DAYS */}
              {currentStep === 4 && (
                <motion.div
                  key="step4" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
                  className="absolute inset-0 overflow-y-auto overflow-x-hidden pr-1 pb-4"
                >
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
                    How many Shoot Days?
                  </h2>
                  <p className="text-[10px] sm:text-xs text-[#a23957] font-mono mt-1 mb-4 bg-white/50 inline-block px-2 py-1 rounded-md">₹{prices.shootDays} per day</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[1, 2, 3].map(num => (
                      <SelectOption 
                        key={num} label={`${num} Day${num > 1 ? 's' : ''}`} value={num} currentValue={!customInputVisible[4] ? data.shootDays : -1} 
                        onClick={() => { setCustomInputVisible({...customInputVisible, 4: false}); updateData("shootDays", num); }} icon={Calendar}
                      />
                    ))}
                    <SelectOption 
                      label="Custom" value={true} currentValue={customInputVisible[4]} 
                      onClick={() => { setCustomInputVisible({...customInputVisible, 4: true}); updateData("shootDays", 0); }} icon={Sparkles}
                    />
                  </div>
                  {customInputVisible[4] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-3">
                      <div className="glass-input rounded-2xl p-3 flex flex-col">
                        <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Enter Number of Days</label>
                        <input 
                          type="number" min="0" value={data.shootDays || ""} onChange={(e) => updateData("shootDays", parseInt(e.target.value) || 0)}
                          className="bg-transparent border-b-2 border-gray-300 focus:border-[#a23957] outline-none font-display text-base py-1 text-gray-900"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* SCREEN 6: PLATFORMS */}
              {currentStep === 5 && (
                <motion.div
                  key="step5" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
                  className="absolute inset-0 overflow-y-auto overflow-x-hidden pr-1 pb-4"
                >
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
                    Which platforms?
                  </h2>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1 mb-4">Select all that apply.</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <MultiSelectOption 
                      label="Facebook" priceLabel={prices.facebook} isSelected={data.platforms.facebook} icon={Share2}
                      onClick={() => updateData("platforms", {...data.platforms, facebook: !data.platforms.facebook})}
                    />
                    <MultiSelectOption 
                      label="Instagram" priceLabel={prices.instagram} isSelected={data.platforms.instagram} icon={Share2}
                      onClick={() => updateData("platforms", {...data.platforms, instagram: !data.platforms.instagram})}
                    />
                    <MultiSelectOption 
                      label="YouTube" priceLabel={prices.youtube} isSelected={data.platforms.youtube} icon={Share2}
                      onClick={() => updateData("platforms", {...data.platforms, youtube: !data.platforms.youtube})}
                    />
                    <MultiSelectOption 
                      label="Google" priceLabel={prices.google} isSelected={data.platforms.google} icon={Share2}
                      onClick={() => updateData("platforms", {...data.platforms, google: !data.platforms.google})}
                    />
                  </div>
                </motion.div>
              )}

              {/* SCREEN 7: INFLUENCER MARKETING */}
              {currentStep === 6 && (() => {
                const infT1 = prices.influencer_t1 || 5000;
                const infT2 = prices.influencer_t2 || 8000;
                const infT3 = prices.influencer_t3 || 10000;
                const format = (v: number) => `₹${v/1000}k`;
                const options = ["No", `${format(infT1)}–${format(infT2)}`, `${format(infT2)}–${format(infT3)}`, `${format(infT3)}+`];

                return (
                  <motion.div
                    key="step6" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
                    className="absolute inset-0 overflow-y-auto overflow-x-hidden pr-1 pb-4"
                  >
                    <h2 className="font-display text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
                      Influencer Marketing?
                    </h2>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1 mb-4">Does not add to base package price.</p>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {options.map(opt => (
                        <SelectOption 
                          key={opt} label={opt} value={opt} currentValue={data.influencerBudget} 
                          onClick={() => updateData("influencerBudget", opt)} icon={Users}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })()}

              {/* SCREEN 8: ADS MANAGEMENT */}
              {currentStep === 7 && (
                <motion.div
                  key="step7" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
                  className="absolute inset-0 overflow-y-auto overflow-x-hidden pr-1 pb-4"
                >
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
                    Social Media Ads Management?
                  </h2>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1 mb-4">Drive targeted leads directly to your business.</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <SelectOption 
                      label="Yes" value={true} currentValue={data.adsManagement} 
                      onClick={() => updateData("adsManagement", true)} icon={Target}
                    />
                    <SelectOption 
                      label="No" value={false} currentValue={data.adsManagement} 
                      onClick={() => updateData("adsManagement", false)} icon={Target}
                    />
                  </div>
                  {data.adsManagement === true && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-3">
                      <div className="glass-input rounded-2xl p-3 flex flex-col">
                        <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Weekly Ad Budget (₹)</label>
                        <div className="flex items-center text-xl font-display">
                          <span className="text-gray-400 mr-2">₹</span>
                          <input 
                            type="number" min="0" placeholder="5000" value={data.weeklyAdBudget} onChange={(e) => updateData("weeklyAdBudget", e.target.value)}
                            className="bg-transparent border-b-2 border-gray-300 focus:border-[#a23957] outline-none w-full py-1 text-gray-900"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* FINAL SCREEN: SUMMARY */}
              {currentStep === 8 && (
                <motion.div
                  key="step8" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}
                  className="absolute inset-0 overflow-y-auto pb-4 pr-1"
                >
                  <div className="flex flex-col items-center justify-center mb-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center text-[#a23957] mb-2 shadow-sm border border-white/50">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
                      Your Custom Package
                    </h2>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Hey {data.name}, here is your tailored blueprint.</p>
                  </div>
                  
                  <div className="glass-input p-4 rounded-2xl mb-4">
                    <h3 className="font-mono text-[10px] font-bold text-[#a23957] uppercase tracking-wider mb-2 border-b border-gray-300/50 pb-1.5">Estimated Monthly Cost</h3>
                    <div className="flex items-baseline space-x-1.5 text-gray-900 mb-3 border-b border-gray-300/50 pb-3">
                      <span className="text-lg font-bold">₹</span>
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 100 }}
                        className="text-3xl sm:text-4xl font-black font-display tracking-tight"
                      >
                        {calculateTotal().toLocaleString()}
                      </motion.span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] sm:text-xs text-gray-700 font-medium">
                      {data.reels > 0 && <div className="flex flex-col"><span className="text-gray-500">{data.reels} Reels</span><span className="font-bold text-[#a23957]">₹{data.reels * prices.reels}</span></div>}
                      {data.creatives > 0 && <div className="flex flex-col"><span className="text-gray-500">{data.creatives} Creatives</span><span className="font-bold text-[#a23957]">₹{data.creatives * prices.creatives}</span></div>}
                      {data.videos > 0 && <div className="flex flex-col"><span className="text-gray-500">{data.videos} Long Videos</span><span className="font-bold text-[#a23957]">₹{data.videos * prices.videos}</span></div>}
                      {data.shootDays > 0 && <div className="flex flex-col"><span className="text-gray-500">{data.shootDays} Shoot Days</span><span className="font-bold text-[#a23957]">₹{data.shootDays * prices.shootDays}</span></div>}
                      
                      {data.platforms.facebook && <div className="flex flex-col"><span className="text-gray-500">FB Mgmt</span><span className="font-bold text-[#a23957]">₹{prices.facebook}</span></div>}
                      {data.platforms.instagram && <div className="flex flex-col"><span className="text-gray-500">IG Mgmt</span><span className="font-bold text-[#a23957]">₹{prices.instagram}</span></div>}
                      {data.platforms.youtube && <div className="flex flex-col"><span className="text-gray-500">YT Mgmt</span><span className="font-bold text-[#a23957]">₹{prices.youtube}</span></div>}
                      {data.platforms.google && <div className="flex flex-col"><span className="text-gray-500">Google Profile</span><span className="font-bold text-[#a23957]">₹{prices.google}</span></div>}
                    </div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    onClick={submitFinal}
                    className="w-full py-3.5 rounded-2xl glass-primary-button font-display font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2"
                  >
                    <span>{isSubmitting ? "Submitting..." : "🚀 Request Custom Proposal"}</span>
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Navigation Controls inside the Glass Container */}
          {currentStep < 8 && (
            <div className="pt-6 border-t border-white/40 flex items-center justify-between space-x-4 mt-auto">
              <button
                onClick={handleBack}
                disabled={currentStep === 0 || isSubmitting}
                className={`px-4 sm:px-5 py-3 rounded-2xl font-display font-semibold text-xs sm:text-sm flex items-center space-x-1.5 transition-all ${
                  currentStep === 0 ? "opacity-0 pointer-events-none" : "minimal-button text-gray-700"
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> <span>Back</span>
              </button>
              
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="flex-grow py-3 rounded-2xl glass-primary-button font-display font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? "Loading..." : currentStep === 0 ? "Start Building" : "Next Step"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
