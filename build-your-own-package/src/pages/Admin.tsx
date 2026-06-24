import React, { useState, useEffect } from "react";
import { Lock, LogOut, Settings, Users, FileText, Check, Eye, X } from "lucide-react";

export default function Admin() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("prices");

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
        const res = await fetch("/api/prices");
        setPrices(await res.json());
      } else if (activeTab === "leads") {
        const res = await fetch("/api/leads", { headers: { Authorization: `Bearer ${token}` } });
        setLeads(await res.json());
      } else if (activeTab === "enquiries") {
        const res = await fetch("/api/enquiries", { headers: { Authorization: `Bearer ${token}` } });
        setEnquiries(await res.json());
      }
    } catch (err) {
      console.error(err);
      if (err instanceof TypeError) {
         // unauthorized possibly
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
        alert("Invalid credentials");
      }
    } catch (err) {
      alert("Login failed");
    }
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

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-50 to-blue-200">
        <div className="glass-container p-8 rounded-3xl w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#a23957] text-white flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold text-center mb-6">Admin Panel</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full glass-input p-3 rounded-xl outline-none" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full glass-input p-3 rounded-xl outline-none" required />
            <button type="submit" className="w-full glass-primary-button p-3 rounded-xl font-bold">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-pink-100 via-blue-50 to-pink-50 p-4 sm:p-6 font-sans">
      
      {/* Left Sidebar */}
      <div className="w-64 glass-container rounded-3xl p-6 flex flex-col mr-6 hidden md:flex">
        <div className="mb-8">
          <img src="/logo.png" alt="Logo" className="h-8 mb-4" />
          <h2 className="font-display font-bold text-gray-800 text-lg">Admin Dashboard</h2>
        </div>
        
        <nav className="flex-grow space-y-2">
          <button onClick={() => setActiveTab("prices")} className={`w-full text-left p-3 rounded-xl flex items-center space-x-3 transition-colors ${activeTab === 'prices' ? 'bg-white/60 font-bold text-[#a23957]' : 'hover:bg-white/30'}`}>
            <Settings className="w-5 h-5" /> <span>Prices</span>
          </button>
          <button onClick={() => setActiveTab("leads")} className={`w-full text-left p-3 rounded-xl flex items-center space-x-3 transition-colors ${activeTab === 'leads' ? 'bg-white/60 font-bold text-[#a23957]' : 'hover:bg-white/30'}`}>
            <Users className="w-5 h-5" /> <span>Leads</span>
          </button>
          <button onClick={() => setActiveTab("enquiries")} className={`w-full text-left p-3 rounded-xl flex items-center space-x-3 transition-colors ${activeTab === 'enquiries' ? 'bg-white/60 font-bold text-[#a23957]' : 'hover:bg-white/30'}`}>
            <FileText className="w-5 h-5" /> <span>Enquiries</span>
          </button>
        </nav>
        
        <button onClick={handleLogout} className="mt-auto w-full text-left p-3 rounded-xl flex items-center space-x-3 hover:bg-white/30 text-gray-600">
          <LogOut className="w-5 h-5" /> <span>Logout</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow glass-container rounded-3xl p-6 sm:p-8 overflow-y-auto">
        
        {/* Mobile Nav */}
        <div className="md:hidden flex space-x-2 mb-6 overflow-x-auto pb-2">
          {["prices", "leads", "enquiries"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl capitalize text-sm whitespace-nowrap ${activeTab === tab ? 'bg-white/60 font-bold text-[#a23957]' : 'bg-white/30'}`}>
              {tab}
            </button>
          ))}
          <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-white/30 text-sm">Logout</button>
        </div>

        {activeTab === "prices" && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-display font-bold mb-6 text-gray-800">Set Package Prices (₹)</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {Object.keys(prices).map(key => (
                <div key={key} className="glass-input p-4 rounded-2xl flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{key}</label>
                  <input 
                    type="number" 
                    value={prices[key]} 
                    onChange={e => setPrices({...prices, [key]: parseInt(e.target.value) || 0})}
                    className="bg-transparent border-b-2 border-gray-300 focus:border-[#a23957] outline-none text-xl py-1"
                  />
                </div>
              ))}
            </div>
            <button onClick={savePrices} className="glass-primary-button px-6 py-3 rounded-xl font-bold flex items-center space-x-2">
              <Check className="w-5 h-5" /> <span>Save Prices</span>
            </button>
          </div>
        )}

        {activeTab === "leads" && (
          <div>
            <h1 className="text-2xl font-display font-bold mb-6 text-gray-800">Recent Leads (Step 1 Completed)</h1>
            <div className="bg-white/40 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/50 border-b border-white">
                    <th className="p-4 text-sm font-bold text-gray-600">ID</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Name</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Phone</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id} className="border-b border-white/40 hover:bg-white/30">
                      <td className="p-4 text-sm text-gray-500">#{lead.id}</td>
                      <td className="p-4 font-semibold">{lead.name}</td>
                      <td className="p-4 font-mono">{lead.phone}</td>
                      <td className="p-4 text-sm text-gray-500">{new Date(lead.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {leads.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">No leads found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "enquiries" && (
          <div>
            <h1 className="text-2xl font-display font-bold mb-6 text-gray-800">Completed Enquiries</h1>
            <div className="bg-white/40 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/50 border-b border-white">
                    <th className="p-4 text-sm font-bold text-gray-600">ID</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Name</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Phone</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Date</th>
                    <th className="p-4 text-sm font-bold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map(enq => (
                    <tr key={enq.enquiry_id} className="border-b border-white/40 hover:bg-white/30">
                      <td className="p-4 text-sm text-gray-500">#{enq.enquiry_id}</td>
                      <td className="p-4 font-semibold">{enq.name || "N/A"}</td>
                      <td className="p-4 font-mono">{enq.phone || "N/A"}</td>
                      <td className="p-4 text-sm text-gray-500">{new Date(enq.created_at).toLocaleString()}</td>
                      <td className="p-4">
                        <button onClick={() => setSelectedEnquiry(enq)} className="minimal-button px-3 py-1.5 rounded-lg text-sm flex items-center space-x-1">
                          <Eye className="w-4 h-4" /> <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {enquiries.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No completed enquiries found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="glass-container w-full max-w-2xl bg-white/90 p-6 rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold">Enquiry Details</h2>
              <button onClick={() => setSelectedEnquiry(null)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-100 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold">Name</p>
                <p className="font-semibold text-lg">{selectedEnquiry.name}</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold">Phone</p>
                <p className="font-semibold text-lg">{selectedEnquiry.phone}</p>
              </div>
            </div>

            <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Package Selections</h3>
            <div className="space-y-2 text-sm">
              <pre className="bg-gray-100 p-4 rounded-xl overflow-x-auto text-xs text-gray-800">
                {JSON.stringify(selectedEnquiry.details, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
