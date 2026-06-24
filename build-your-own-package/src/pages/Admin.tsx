import React, { useState, useEffect } from "react";
import { Lock, LogOut, Settings, Users, FileText, Check, Eye, X, Megaphone, Target, LineChart, Smartphone, PieChart } from "lucide-react";

export default function Admin() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("prices");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [prices, setPrices] = useState<Record<string, number>>({});
  const [leads, setLeads] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === "prices") {
        const res = await fetch("/api/prices", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setPrices(data);
        }
      } else if (activeTab === "leads") {
        const res = await fetch("/api/leads", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setLeads(Array.isArray(data) ? data : []);
        }
      } else if (activeTab === "enquiries") {
        const res = await fetch("/api/enquiries", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setEnquiries(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin_token", data.token);
        setToken(data.token);
      } else {
        alert("Invalid credentials or server error");
      }
    } catch (err) {
      alert("Login failed due to a network error.");
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
  };

  const savePrices = async () => {
    try {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(prices)
      });
      if (res.ok) alert("Prices updated successfully!");
      else alert("Failed to update prices.");
    } catch (err) {
      alert("Error saving prices");
    }
  };

  // Reusable Background Component
  const AmbientBackground = () => (
    <>
      <div className="fixed top-10 left-[5%] text-[#a23957]/10 float-slow pointer-events-none"><Megaphone className="w-32 h-32" /></div>
      <div className="fixed bottom-20 right-[10%] text-blue-500/10 float-medium pointer-events-none"><Target className="w-48 h-48" /></div>
      <div className="fixed top-1/4 right-[5%] text-purple-500/10 float-fast pointer-events-none"><LineChart className="w-24 h-24" /></div>
      <div className="fixed bottom-1/3 left-[8%] text-[#a23957]/5 float-medium pointer-events-none"><Smartphone className="w-40 h-40" /></div>
      <div className="fixed top-1/2 right-[20%] text-pink-400/10 float-slow pointer-events-none"><PieChart className="w-20 h-20" /></div>
    </>
  );

  if (!token) {
    return (
      <div className="min-h-screen relative flex flex-col font-sans text-[#1b1c1c] overflow-hidden">
        <AmbientBackground />
        <div className="flex-grow flex flex-col items-center justify-center px-4 py-8 relative z-10 w-full max-w-lg mx-auto">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Royal300 Logo" className="h-16 mx-auto mb-4 drop-shadow-sm" />
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1] drop-shadow-sm">
              Admin <br/><span className="text-[#a23957]">Portal</span>
            </h1>
          </div>
          <div className="w-full glass-container rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col relative overflow-hidden">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="glass-input rounded-2xl p-3 flex flex-col">
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="bg-transparent border-b-2 border-gray-300 focus:border-[#a23957] outline-none font-display text-xl py-1 text-gray-900" required />
              </div>
              <div className="glass-input rounded-2xl p-3 flex flex-col">
                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-transparent border-b-2 border-gray-300 focus:border-[#a23957] outline-none font-display text-xl py-1 text-gray-900" required />
              </div>
              <button type="submit" disabled={isLoggingIn} className="w-full mt-4 py-4 rounded-2xl glass-primary-button font-display font-extrabold text-base flex items-center justify-center space-x-2">
                <span>{isLoggingIn ? "Authenticating..." : "Login"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-[#1b1c1c] overflow-hidden">
      <AmbientBackground />
      <div className="flex-grow flex flex-col md:flex-row items-stretch justify-center px-4 py-8 relative z-10 w-full max-w-6xl mx-auto gap-6">
        
        {/* Left Sidebar (Desktop) */}
        <div className="w-full md:w-64 glass-container rounded-[2rem] sm:rounded-[2.5rem] p-6 flex flex-col shrink-0">
          <div className="mb-8 text-center md:text-left">
            <img src="/logo.png" alt="Logo" className="h-12 mb-4 mx-auto md:mx-0" />
            <h2 className="font-display font-extrabold text-gray-900 text-xl leading-tight">Control <br/><span className="text-[#a23957]">Center</span></h2>
          </div>
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-3 overflow-x-auto pb-2 md:pb-0 mb-6 md:mb-0">
            <button onClick={() => setActiveTab("prices")} className={`shrink-0 md:w-full text-left p-3.5 rounded-2xl flex items-center space-x-3 minimal-button ${activeTab === 'prices' ? 'active border-[#a23957] font-bold text-gray-900' : 'text-gray-600'}`}>
              <Settings className="w-5 h-5" /> <span className="hidden sm:inline">Prices</span>
            </button>
            <button onClick={() => setActiveTab("leads")} className={`shrink-0 md:w-full text-left p-3.5 rounded-2xl flex items-center space-x-3 minimal-button ${activeTab === 'leads' ? 'active border-[#a23957] font-bold text-gray-900' : 'text-gray-600'}`}>
              <Users className="w-5 h-5" /> <span className="hidden sm:inline">Leads</span>
            </button>
            <button onClick={() => setActiveTab("enquiries")} className={`shrink-0 md:w-full text-left p-3.5 rounded-2xl flex items-center space-x-3 minimal-button ${activeTab === 'enquiries' ? 'active border-[#a23957] font-bold text-gray-900' : 'text-gray-600'}`}>
              <FileText className="w-5 h-5" /> <span className="hidden sm:inline">Enquiries</span>
            </button>
          </nav>
          <button onClick={handleLogout} className="mt-auto w-full text-left p-3.5 rounded-2xl flex items-center space-x-3 minimal-button text-gray-600 hidden md:flex">
            <LogOut className="w-5 h-5" /> <span>Logout</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow glass-container rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col relative overflow-hidden min-h-[500px]">
          
          {activeTab === "prices" && (
            <div className="w-full h-full flex flex-col">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug mb-6">Package Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 overflow-y-auto max-h-[60vh] pr-2">
                {[
                  "reels", "creatives", "videos", "shootDays", 
                  "facebook", "instagram", "youtube", "google",
                  "influencer_t1", "influencer_t2", "influencer_t3"
                ].map(key => (
                  <div key={key} className="glass-input p-4 rounded-2xl flex flex-col">
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {key.replace("_", " ")} {key.startsWith("influencer") && "(e.g. 5000)"}
                    </label>
                    <div className="flex items-center text-xl font-display">
                      <span className="text-gray-400 mr-2">₹</span>
                      <input 
                        type="number" 
                        value={prices[key] ?? ""} 
                        onChange={e => setPrices({...prices, [key]: e.target.value === "" ? 0 : parseInt(e.target.value)})}
                        className="bg-transparent border-b-2 border-gray-300 focus:border-[#a23957] outline-none w-full py-1 text-gray-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={savePrices} className="w-full sm:w-auto py-4 px-8 rounded-2xl glass-primary-button font-display font-extrabold text-base flex items-center justify-center space-x-2 mt-auto">
                <Check className="w-5 h-5" /> <span>Save Prices</span>
              </button>
            </div>
          )}

          {activeTab === "leads" && (
            <div className="w-full flex flex-col h-full">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug mb-6">Captured Leads</h2>
              <div className="flex-grow overflow-auto glass-input rounded-3xl p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300/50">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id} className="border-b border-gray-200/50 hover:bg-white/30 transition-colors">
                        <td className="p-4 text-sm font-mono text-[#a23957]">#{lead.id}</td>
                        <td className="p-4 text-sm font-semibold text-gray-800">{lead.name}</td>
                        <td className="p-4 text-sm font-mono text-gray-600">{lead.phone}</td>
                        <td className="p-4 text-xs text-gray-500">{new Date(lead.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {leads.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-sm text-gray-500">No leads captured yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "enquiries" && (
            <div className="w-full flex flex-col h-full">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug mb-6">Completed Submissions</h2>
              <div className="flex-grow overflow-auto glass-input rounded-3xl p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300/50">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.map(enq => (
                      <tr key={enq.enquiry_id} className="border-b border-gray-200/50 hover:bg-white/30 transition-colors">
                        <td className="p-4 text-sm font-mono text-[#a23957]">#{enq.enquiry_id}</td>
                        <td className="p-4 text-sm font-semibold text-gray-800">{enq.name || "N/A"}</td>
                        <td className="p-4 text-xs text-gray-500">{new Date(enq.created_at).toLocaleString()}</td>
                        <td className="p-4">
                          <button onClick={() => setSelectedEnquiry(enq)} className="minimal-button px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 text-[#a23957]">
                            <Eye className="w-4 h-4" /> <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {enquiries.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-sm text-gray-500">No completed submissions yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mobile Logout */}
          <div className="md:hidden mt-6 pt-4 border-t border-gray-300/50">
            <button onClick={handleLogout} className="w-full text-center p-3 rounded-2xl minimal-button text-gray-600 flex justify-center items-center space-x-2">
              <LogOut className="w-4 h-4" /> <span>Logout</span>
            </button>
          </div>

        </div>
      </div>

      {/* Details Modal */}
      {selectedEnquiry && (() => {
        let parsed = selectedEnquiry.details;
        if (typeof parsed === "string") {
          try { parsed = JSON.parse(parsed); } catch(e){}
        }
        if (typeof parsed === "string") {
          try { parsed = JSON.parse(parsed); } catch(e){}
        }

        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="glass-container w-full max-w-2xl p-6 sm:p-8 rounded-[2rem] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            <button onClick={() => setSelectedEnquiry(null)} className="absolute top-5 right-5 p-2 bg-white/50 rounded-full hover:bg-white/80 transition-colors z-10">
              <X className="w-5 h-5 text-gray-800" />
            </button>
            
            <h2 className="font-display text-2xl font-extrabold text-gray-900 mb-6 border-b border-gray-200 pb-4">Package Request</h2>
            
            <div className="overflow-y-auto pr-2 pb-6 space-y-6 flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-input p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Customer Name</p>
                  <p className="font-display font-bold text-lg text-gray-900">{selectedEnquiry.name || "N/A"}</p>
                </div>
                <div className="glass-input p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="font-mono font-medium text-lg text-[#a23957]">{selectedEnquiry.phone || "N/A"}</p>
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Selections</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(parsed || {})
                    .filter(([k]) => k !== "name" && k !== "phone")
                    .map(([key, val]) => {
                      let displayVal = "";
                      if (key === "platforms" && typeof val === "object" && val !== null) {
                        const selected = Object.keys(val).filter(k => (val as any)[k]);
                        displayVal = selected.length > 0 ? selected.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(", ") : "None";
                      } else if (typeof val === "boolean") {
                        displayVal = val ? "Yes" : "No";
                      } else if (typeof val === "object" && val !== null) {
                        displayVal = JSON.stringify(val);
                      } else {
                        displayVal = String(val);
                      }

                      return (
                        <div key={key} className="glass-input p-3 rounded-xl flex flex-col justify-center">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{key}</span>
                          <span className="font-display text-sm font-semibold text-gray-900">
                            {displayVal}
                          </span>
                        </div>
                      );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

    </div>
  );
}
