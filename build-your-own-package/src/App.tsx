import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Video, 
  Image as ImageIcon, 
  Film, 
  Calendar, 
  Share2, 
  Users, 
  Target, 
  Sparkles,
  User,
  Phone
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

const TOTAL_STEPS = 8; // Steps 1 to 8 (index 0 to 7)

export default function App() {
  const [currentStep, setCurrentStep] = useState(0); // 0 to 8 (8 is final screen)
  const [direction, setDirection] = useState(1); // 1 for next, -1 for back
  const [customInputVisible, setCustomInputVisible] = useState<Record<number, boolean>>({});

  const [data, setData] = useState<PackageData>({
    name: "",
    phone: "",
    reels: 0,
    creatives: 0,
    videos: 0,
    shootDays: 0,
    platforms: { facebook: false, instagram: false, youtube: false, google: false },
    influencerBudget: "",
    adsManagement: null,
    weeklyAdBudget: ""
  });

  // Derived price logic
  const PRICING = {
    reels: 300,
    creatives: 80,
    videos: 1000,
    shootDays: 3000,
    platforms: {
      facebook: 1500,
      instagram: 1500,
      youtube: 2000,
      google: 1000,
    }
  };

  const calculateTotal = () => {
    let total = 0;
    total += data.reels * PRICING.reels;
    total += data.creatives * PRICING.creatives;
    total += data.videos * PRICING.videos;
    total += data.shootDays * PRICING.shootDays;
    
    if (data.platforms.facebook) total += PRICING.platforms.facebook;
    if (data.platforms.instagram) total += PRICING.platforms.instagram;
    if (data.platforms.youtube) total += PRICING.platforms.youtube;
    if (data.platforms.google) total += PRICING.platforms.google;
    
    return total;
  };

  const handleNext = () => {
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

  const updateData = (key: keyof PackageData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  // Validation
  const canProceed = () => {
    if (currentStep === 0) return data.name.trim() !== "" && data.phone.trim().length >= 10;
    if (currentStep === 1) return data.reels >= 0;
    if (currentStep === 2) return data.creatives >= 0;
    if (currentStep === 3) return data.videos >= 0;
    if (currentStep === 4) return data.shootDays >= 0;
    if (currentStep === 5) return true; // Platforms can be empty
    if (currentStep === 6) return data.influencerBudget !== "";
    if (currentStep === 7) return data.adsManagement === false || (data.adsManagement === true && data.weeklyAdBudget !== "");
    return true;
  };

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  // Selection Button Component
  const SelectOption = ({ 
    label, 
    value, 
    currentValue, 
    onClick, 
    icon: Icon 
  }: { 
    label: string, 
    value: any, 
    currentValue: any, 
    onClick: () => void, 
    icon?: any 
  }) => {
    const isSelected = currentValue === value;
    return (
      <button
        onClick={onClick}
        className={`w-full text-left p-4 rounded-2xl neu-card border-2 flex items-center space-x-4 transition-all duration-200 ${
          isSelected ? "border-[#a23957] bg-pink-50/10" : "border-transparent"
        }`}
      >
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isSelected ? "bg-[#a23957] text-white" : "neu-icon-container text-gray-700"
          }`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="flex-grow">
          <h3 className="font-display font-bold text-base text-gray-900">{label}</h3>
        </div>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-[#a23957] flex items-center justify-center text-white shadow">
            <Check className="w-4 h-4 stroke-[3px]" />
          </div>
        )}
      </button>
    );
  };

  // Multi-Select Option
  const MultiSelectOption = ({
    label,
    priceLabel,
    isSelected,
    onClick,
    icon: Icon
  }: {
    label: string,
    priceLabel: string,
    isSelected: boolean,
    onClick: () => void,
    icon: any
  }) => (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl neu-card border-2 flex items-center space-x-4 transition-all duration-200 ${
        isSelected ? "border-[#a23957] bg-pink-50/10" : "border-transparent"
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isSelected ? "bg-[#a23957] text-white" : "neu-icon-container text-gray-700"
      }`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-grow">
        <h3 className="font-display font-bold text-sm text-gray-900">{label}</h3>
        <p className="text-[11px] font-mono text-[#a23957] mt-0.5">+₹{priceLabel}</p>
      </div>
      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
        isSelected ? "border-[#a23957] bg-[#a23957] text-white" : "border-gray-300"
      }`}>
        {isSelected && <Check className="w-4 h-4 stroke-[3px]" />}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#fbf9f8] flex flex-col font-sans text-[#1b1c1c] overflow-hidden select-none">
      
      {/* Top Bar with Logo & Progress */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fbf9f8]/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src="/logo.png" alt="Royal300 Logo" className="h-8" />
          
          {currentStep < 8 && (
            <div className="flex flex-col items-end w-1/2">
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase mb-1.5">
                Question {currentStep + 1} of {TOTAL_STEPS}
              </span>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
                  className="h-full bg-[#a23957] rounded-full"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area with Sliding Animations */}
      <main className="flex-grow w-full max-w-xl mx-auto px-6 pt-24 pb-32 relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          
          {/* SCREEN 1: LEAD CAPTURE */}
          {currentStep === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-x-6 top-24"
            >
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#1b1c1c] mb-8">
                Let's Build Your <br/>
                <span className="text-[#a23957]">Marketing Package 🚀</span>
              </h1>
              
              <div className="space-y-5">
                <div className="neu-inset rounded-2xl p-2 flex items-center bg-white">
                  <div className="w-12 h-12 flex items-center justify-center text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Your Full Name"
                    value={data.name}
                    onChange={(e) => updateData("name", e.target.value)}
                    className="flex-grow bg-transparent border-none outline-none font-display text-base px-2"
                  />
                </div>

                <div className="neu-inset rounded-2xl p-2 flex items-center bg-white">
                  <div className="w-12 h-12 flex items-center justify-center text-gray-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input 
                    type="tel" 
                    placeholder="Mobile Number"
                    value={data.phone}
                    onChange={(e) => updateData("phone", e.target.value)}
                    className="flex-grow bg-transparent border-none outline-none font-display text-base px-2"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN 2: REELS */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-x-6 top-24"
            >
              <h2 className="font-display text-2xl font-extrabold text-gray-900 leading-snug">
                How many Reels do you need every month?
              </h2>
              <p className="text-xs text-[#a23957] font-mono mt-1.5 mb-6">₹300 per reel</p>

              <div className="space-y-3">
                {[4, 8, 12, 16].map(num => (
                  <SelectOption 
                    key={num} 
                    label={`${num} Reels`} 
                    value={num} 
                    currentValue={!customInputVisible[1] ? data.reels : -1} 
                    onClick={() => { setCustomInputVisible({...customInputVisible, 1: false}); updateData("reels", num); }} 
                    icon={Video}
                  />
                ))}
                
                <SelectOption 
                  label="Custom" 
                  value={true} 
                  currentValue={customInputVisible[1]} 
                  onClick={() => { setCustomInputVisible({...customInputVisible, 1: true}); updateData("reels", 0); }} 
                  icon={Sparkles}
                />

                {customInputVisible[1] && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                    <div className="neu-inset rounded-2xl p-4 bg-white flex flex-col">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Enter Number of Reels</label>
                      <input 
                        type="number" 
                        min="0"
                        value={data.reels || ""}
                        onChange={(e) => updateData("reels", parseInt(e.target.value) || 0)}
                        className="bg-transparent border-b-2 border-gray-200 focus:border-[#a23957] outline-none font-display text-xl py-1"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* SCREEN 3: CREATIVES */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-x-6 top-24"
            >
              <h2 className="font-display text-2xl font-extrabold text-gray-900 leading-snug">
                How many Creatives do you need every month?
              </h2>
              <p className="text-xs text-[#a23957] font-mono mt-1.5 mb-6">₹80 per creative</p>

              <div className="space-y-3">
                {[4, 8, 12, 16].map(num => (
                  <SelectOption 
                    key={num} 
                    label={`${num} Creatives`} 
                    value={num} 
                    currentValue={!customInputVisible[2] ? data.creatives : -1} 
                    onClick={() => { setCustomInputVisible({...customInputVisible, 2: false}); updateData("creatives", num); }} 
                    icon={ImageIcon}
                  />
                ))}
                <SelectOption 
                  label="Custom" 
                  value={true} 
                  currentValue={customInputVisible[2]} 
                  onClick={() => { setCustomInputVisible({...customInputVisible, 2: true}); updateData("creatives", 0); }} 
                  icon={Sparkles}
                />
                {customInputVisible[2] && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                    <div className="neu-inset rounded-2xl p-4 bg-white flex flex-col">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Enter Number of Creatives</label>
                      <input 
                        type="number" 
                        min="0"
                        value={data.creatives || ""}
                        onChange={(e) => updateData("creatives", parseInt(e.target.value) || 0)}
                        className="bg-transparent border-b-2 border-gray-200 focus:border-[#a23957] outline-none font-display text-xl py-1"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* SCREEN 4: LONG VIDEOS */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-x-6 top-24"
            >
              <h2 className="font-display text-2xl font-extrabold text-gray-900 leading-snug">
                How many Long Videos do you need?
              </h2>
              <p className="text-xs text-[#a23957] font-mono mt-1.5 mb-6">₹1000 each</p>

              <div className="space-y-3">
                {[1, 2, 3, 4].map(num => (
                  <SelectOption 
                    key={num} 
                    label={`${num} Video${num > 1 ? 's' : ''}`} 
                    value={num} 
                    currentValue={!customInputVisible[3] ? data.videos : -1} 
                    onClick={() => { setCustomInputVisible({...customInputVisible, 3: false}); updateData("videos", num); }} 
                    icon={Film}
                  />
                ))}
                <SelectOption 
                  label="Custom" 
                  value={true} 
                  currentValue={customInputVisible[3]} 
                  onClick={() => { setCustomInputVisible({...customInputVisible, 3: true}); updateData("videos", 0); }} 
                  icon={Sparkles}
                />
                {customInputVisible[3] && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                    <div className="neu-inset rounded-2xl p-4 bg-white flex flex-col">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Enter Number of Videos</label>
                      <input 
                        type="number" 
                        min="0"
                        value={data.videos || ""}
                        onChange={(e) => updateData("videos", parseInt(e.target.value) || 0)}
                        className="bg-transparent border-b-2 border-gray-200 focus:border-[#a23957] outline-none font-display text-xl py-1"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* SCREEN 5: SHOOT DAYS */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-x-6 top-24"
            >
              <h2 className="font-display text-2xl font-extrabold text-gray-900 leading-snug">
                How many Video Shoot Days do you need?
              </h2>
              <p className="text-xs text-[#a23957] font-mono mt-1.5 mb-6">₹3000 per day</p>

              <div className="space-y-3">
                {[1, 2, 3, 4].map(num => (
                  <SelectOption 
                    key={num} 
                    label={`${num} Day${num > 1 ? 's' : ''}`} 
                    value={num} 
                    currentValue={!customInputVisible[4] ? data.shootDays : -1} 
                    onClick={() => { setCustomInputVisible({...customInputVisible, 4: false}); updateData("shootDays", num); }} 
                    icon={Calendar}
                  />
                ))}
                <SelectOption 
                  label="Custom" 
                  value={true} 
                  currentValue={customInputVisible[4]} 
                  onClick={() => { setCustomInputVisible({...customInputVisible, 4: true}); updateData("shootDays", 0); }} 
                  icon={Sparkles}
                />
                {customInputVisible[4] && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                    <div className="neu-inset rounded-2xl p-4 bg-white flex flex-col">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Enter Number of Days</label>
                      <input 
                        type="number" 
                        min="0"
                        value={data.shootDays || ""}
                        onChange={(e) => updateData("shootDays", parseInt(e.target.value) || 0)}
                        className="bg-transparent border-b-2 border-gray-200 focus:border-[#a23957] outline-none font-display text-xl py-1"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* SCREEN 6: PLATFORMS */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-x-6 top-24"
            >
              <h2 className="font-display text-2xl font-extrabold text-gray-900 leading-snug">
                Which social platforms should Royal300 manage?
              </h2>
              <p className="text-xs text-gray-500 mt-1.5 mb-6">Select all that apply.</p>

              <div className="space-y-3">
                <MultiSelectOption 
                  label="Facebook Management" priceLabel="1500" isSelected={data.platforms.facebook} icon={Share2}
                  onClick={() => updateData("platforms", {...data.platforms, facebook: !data.platforms.facebook})}
                />
                <MultiSelectOption 
                  label="Instagram Management" priceLabel="1500" isSelected={data.platforms.instagram} icon={Share2}
                  onClick={() => updateData("platforms", {...data.platforms, instagram: !data.platforms.instagram})}
                />
                <MultiSelectOption 
                  label="YouTube Management" priceLabel="2000" isSelected={data.platforms.youtube} icon={Share2}
                  onClick={() => updateData("platforms", {...data.platforms, youtube: !data.platforms.youtube})}
                />
                <MultiSelectOption 
                  label="Google Business Profile" priceLabel="1000" isSelected={data.platforms.google} icon={Share2}
                  onClick={() => updateData("platforms", {...data.platforms, google: !data.platforms.google})}
                />
              </div>
            </motion.div>
          )}

          {/* SCREEN 7: INFLUENCER MARKETING */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-x-6 top-24"
            >
              <h2 className="font-display text-2xl font-extrabold text-gray-900 leading-snug">
                Do you want Influencer Marketing?
              </h2>
              <p className="text-xs text-gray-500 mt-1.5 mb-6">This helps us understand your budget needs. Not added to base package price.</p>

              <div className="space-y-3">
                {["No", "₹5,000–₹7,000 Budget", "₹8,000–₹10,000 Budget", "₹10,000+"].map(opt => (
                  <SelectOption 
                    key={opt} 
                    label={opt} 
                    value={opt} 
                    currentValue={data.influencerBudget} 
                    onClick={() => updateData("influencerBudget", opt)} 
                    icon={Users}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* SCREEN 8: ADS MANAGEMENT */}
          {currentStep === 7 && (
            <motion.div
              key="step7"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-x-6 top-24"
            >
              <h2 className="font-display text-2xl font-extrabold text-gray-900 leading-snug">
                Do you want Social Media Ads Management?
              </h2>
              <p className="text-xs text-gray-500 mt-1.5 mb-6">Drive targeted leads to your business.</p>

              <div className="space-y-3">
                <SelectOption 
                  label="Yes" 
                  value={true} 
                  currentValue={data.adsManagement} 
                  onClick={() => updateData("adsManagement", true)} 
                  icon={Target}
                />
                <SelectOption 
                  label="No" 
                  value={false} 
                  currentValue={data.adsManagement} 
                  onClick={() => updateData("adsManagement", false)} 
                  icon={Target}
                />

                {data.adsManagement === true && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                    <div className="neu-inset rounded-2xl p-4 bg-white flex flex-col">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Enter Weekly Ad Budget (₹)</label>
                      <div className="flex items-center text-xl font-display">
                        <span className="text-gray-400 mr-2">₹</span>
                        <input 
                          type="number" 
                          min="0"
                          placeholder="e.g. 5000"
                          value={data.weeklyAdBudget}
                          onChange={(e) => updateData("weeklyAdBudget", e.target.value)}
                          className="bg-transparent border-b-2 border-gray-200 focus:border-[#a23957] outline-none w-full py-1"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 italic">* Ad spend paid directly to Meta/Google.</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* FINAL SCREEN: SUMMARY */}
          {currentStep === 8 && (
            <motion.div
              key="step8"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-x-6 top-24 pb-32"
            >
              <div className="flex items-center justify-center mb-6">
                 <div className="w-16 h-16 rounded-full neu-icon-container flex items-center justify-center text-[#a23957]">
                   <Sparkles className="w-8 h-8" />
                 </div>
              </div>
              
              <h2 className="font-display text-3xl font-extrabold text-center text-gray-900 leading-snug mb-2">
                Your Custom Package
              </h2>
              <p className="text-center text-sm font-medium text-gray-500 mb-8">
                Hey {data.name}, here is your tailored blueprint.
              </p>

              <div className="neu-flat p-6 rounded-3xl mb-6 border border-white">
                <h3 className="font-mono text-xs font-bold text-[#a23957] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Estimated Monthly Cost</h3>
                
                <div className="flex items-baseline space-x-2 text-gray-900 mb-4">
                  <span className="text-2xl font-bold">₹</span>
                  {/* Fake counter animation */}
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 10 }}
                    className="text-5xl font-black font-display tracking-tight"
                  >
                    {calculateTotal().toLocaleString()}
                  </motion.span>
                </div>

                <div className="space-y-2 mt-4 text-sm text-gray-600 font-medium">
                  {data.reels > 0 && <div className="flex justify-between"><span>{data.reels} Reels</span><span>₹{data.reels * PRICING.reels}</span></div>}
                  {data.creatives > 0 && <div className="flex justify-between"><span>{data.creatives} Creatives</span><span>₹{data.creatives * PRICING.creatives}</span></div>}
                  {data.videos > 0 && <div className="flex justify-between"><span>{data.videos} Long Videos</span><span>₹{data.videos * PRICING.videos}</span></div>}
                  {data.shootDays > 0 && <div className="flex justify-between"><span>{data.shootDays} Shoot Days</span><span>₹{data.shootDays * PRICING.shootDays}</span></div>}
                  
                  <div className="pt-2 border-t border-gray-100 mt-2">
                    {data.platforms.facebook && <div className="flex justify-between text-xs"><span>FB Management</span><span>₹{PRICING.platforms.facebook}</span></div>}
                    {data.platforms.instagram && <div className="flex justify-between text-xs"><span>IG Management</span><span>₹{PRICING.platforms.instagram}</span></div>}
                    {data.platforms.youtube && <div className="flex justify-between text-xs"><span>YT Management</span><span>₹{PRICING.platforms.youtube}</span></div>}
                    {data.platforms.google && <div className="flex justify-between text-xs"><span>Google Profile</span><span>₹{PRICING.platforms.google}</span></div>}
                  </div>
                </div>
              </div>

              <div className="neu-inset p-5 rounded-2xl bg-white mb-8 text-xs text-gray-600 space-y-2">
                <div className="flex justify-between"><span className="font-bold">Lead Details:</span> <span>{data.phone}</span></div>
                <div className="flex justify-between"><span className="font-bold">Influencer Mkt:</span> <span>{data.influencerBudget !== "No" ? data.influencerBudget : "Not required"}</span></div>
                <div className="flex justify-between"><span className="font-bold">Ads Management:</span> <span>{data.adsManagement ? `Yes (Budget: ₹${data.weeklyAdBudget}/wk)` : "No"}</span></div>
              </div>

              <button
                onClick={() => {
                  console.log("Submitting Payload to DB:", { ...data, total: calculateTotal(), created_at: new Date().toISOString() });
                  alert("Proposal requested! We will contact you soon.");
                }}
                className="w-full py-4 rounded-2xl neu-primary-button font-display font-extrabold text-lg flex items-center justify-center space-x-2"
              >
                <span>🚀 Get My Custom Proposal</span>
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      {currentStep < 8 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#fbf9f8] via-[#fbf9f8]/90 to-transparent z-50">
          <div className="max-w-xl mx-auto flex items-center justify-between space-x-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`px-5 py-4 rounded-2xl font-display font-semibold text-sm flex items-center space-x-1.5 transition-all ${
                currentStep === 0 ? "opacity-0 pointer-events-none" : "neu-button"
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> <span>Back</span>
            </button>
            
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-grow py-4 rounded-2xl neu-primary-button font-display font-extrabold text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{currentStep === 0 ? "Start Building" : "Next Step"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
