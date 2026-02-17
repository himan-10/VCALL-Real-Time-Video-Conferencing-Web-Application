import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Landingpage() {
  const navigate = useNavigate();
  const { userData, addToUserHistory } = useContext(AuthContext); // Access user data

  // State for Join Meeting
  const [meetingCode, setMeetingCode] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  // State for Create Meeting Modal
  const [showModal, setShowModal] = useState(false);
  const [createdCode, setCreatedCode] = useState("");
  const [createPassword, setCreatePassword] = useState("");

  const handleJoinGuest = () => {
    const randomCode = Math.random().toString(36).substring(2, 7);
    setCreatedCode(randomCode);
    setShowModal(true);
  };

  const handleStartMeeting = async () => {
    if (userData) {
      await addToUserHistory(createdCode);
    }
    navigate(`/${createdCode}`, { state: { password: createPassword } });
  };

  const handleJoinMeeting = async () => {
    if (meetingCode.trim()) {
      if (userData) {
        await addToUserHistory(meetingCode);
      }
      navigate(`/${meetingCode}`, { state: { password: joinPassword } });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // --- DASHBOARD VIEW (Authenticated) ---
  if (userData) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-orange-500 selection:text-white pb-20 relative">
        {/* Background decoration */}
        <div className="fixed inset-0 -z-10 h-full w-full bg-gray-950 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#ea580c_100%)] opacity-20"></div>

        {/* --- CREATION MODAL --- */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl"
              >
                ✕
              </button>

              <h3 className="text-2xl font-bold mb-2">Meeting Created! 🚀</h3>
              <p className="text-gray-400 mb-6">Share this code with others to invite them.</p>

              <div className="bg-black/50 rounded-xl p-4 mb-6 border border-gray-800 flex justify-between items-center">
                <span className="text-3xl font-mono tracking-wider text-orange-400">{createdCode}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(createdCode)}
                  className="text-gray-400 hover:text-white"
                  title="Copy Code"
                >
                  📋
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Set Password (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. 1234"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none text-white placeholder-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/${createdCode}`;
                    const pwdText = createPassword ? ` Password: ${createPassword}` : "";
                    const text = `Join my video meeting: ${url}${pwdText}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  <span>💬</span> WhatsApp
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/${createdCode}`;
                    const pwdText = createPassword ? ` Password: ${createPassword}` : "";
                    const subject = "Join my Video Meeting";
                    const body = `Hey, join my meeting here: ${url}${pwdText}`;
                    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                  }}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  <span>📧</span> Email
                </button>
              </div>

              <button
                onClick={handleStartMeeting}
                className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:shadow-orange-500/30 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Start Meeting Now
              </button>
            </div>
          </div>
        )}

        <nav className="w-full px-6 py-6 flex items-center justify-between max-w-7xl mx-auto border-b border-gray-800/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg">V</div>
            <h1 className="text-2xl font-bold tracking-tight">VCall</h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:block text-gray-400">Welcome, <span className="text-white font-semibold">{userData.name}</span></span>
            <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors">Logout</button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT: ACTIONS */}
            <div className="flex flex-col gap-6">
              {/* Start Meeting Card */}
              <div
                onClick={handleJoinGuest}
                className="group relative overflow-hidden bg-gradient-to-br from-orange-600 to-orange-700 rounded-3xl p-8 cursor-pointer shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                    <span className="text-3xl">📹</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">New Meeting</h3>
                  <p className="text-orange-100/80">Start an instant meeting and invite others.</p>
                </div>
              </div>

              {/* Join Meeting Card */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-sm hover:border-gray-700 transition-all">
                <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 text-2xl">🔗</div>
                <h3 className="text-2xl font-bold mb-4">Join Meeting</h3>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Enter meeting code"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Password (Optional)"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                      className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                    <button
                      onClick={handleJoinMeeting}
                      className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: HISTORY */}
            <div className="bg-gray-900/30 border border-gray-800/50 rounded-3xl p-8 backdrop-blur-md flex flex-col h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span>📅</span> Recent Activity
                </h3>
                <span className="text-xs font-bold bg-gray-800 px-3 py-1 rounded-full text-gray-400">HISTORY</span>
              </div>

              {userData.activity && userData.activity.length > 0 ? (
                <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                  {userData.activity.slice().reverse().map((item, i) => (
                    <div key={i} className="group flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800/50 hover:border-orange-500/30 transition-all">
                      <div>
                        <p className="font-mono text-orange-400 text-lg tracking-wide">{item.meetingCode}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString()}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.meetingCode);
                        }}
                        className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700 hover:text-white"
                        title="Copy Code"
                      >
                        📋
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-60">
                  <span className="text-4xl mb-4">🕸️</span>
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- GUEST VIEW (Original) ---
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-orange-500 selection:text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-gray-950 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#ea580c_100%)] opacity-20"></div>

      {/* --- CREATION MODAL (for Guest View) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-2">Meeting Created! 🚀</h3>
            <p className="text-gray-400 mb-6">Share this code with others to invite them.</p>

            <div className="bg-black/50 rounded-xl p-4 mb-6 border border-gray-800 flex justify-between items-center">
              <span className="text-3xl font-mono tracking-wider text-orange-400">{createdCode}</span>
              <button
                onClick={() => navigator.clipboard.writeText(createdCode)}
                className="text-gray-400 hover:text-white"
                title="Copy Code"
              >
                📋
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Set Password (Optional):</label>
              <input
                type="text"
                placeholder="e.g. 1234"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none text-white placeholder-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/${createdCode}`;
                  const pwdText = createPassword ? ` Password: ${createPassword}` : "";
                  const text = `Join my video meeting: ${url}${pwdText}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors"
              >
                <span>💬</span> WhatsApp
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/${createdCode}`;
                  const pwdText = createPassword ? ` Password: ${createPassword}` : "";
                  const subject = "Join my Video Meeting";
                  const body = `Hey, join my meeting here: ${url}${pwdText}`;
                  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                }}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
              >
                <span>📧</span> Email
              </button>
            </div>

            <button
              onClick={handleStartMeeting}
              className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:shadow-orange-500/30 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Start Meeting Now
            </button>
          </div>
        </div>
      )}

      <nav className="w-full px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg">V</div>
          <h1 className="text-2xl font-bold tracking-tight">VCall</h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center font-medium">
          <button onClick={handleJoinGuest} className="hover:text-orange-400 transition-colors">Start Meeting</button>
          <Link to="/auth" className="hover:text-orange-400 transition-colors">Register</Link>
          <Link to="/auth">
            <button className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-full font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300">
              Login
            </button>
          </Link>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden cursor-pointer p-2 hover:bg-gray-800 rounded-lg">
          <span className="text-2xl">☰</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-center px-6 md:px-20 max-w-7xl mx-auto h-[calc(100vh-100px)] gap-12">
        {/* Left Text */}
        <div className="flex flex-col gap-6 text-center md:text-left max-w-2xl">
          <h1 className="font-bold text-5xl md:text-7xl leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Connect</span> with<br />
            your loved ones
          </h1>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
            Experience crystal clear video calls with low latency. <br />
            Secure, reliable, and made for India.
          </p>

          <div className="flex flex-col gap-4 mt-8">
            {/* Guest Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleJoinGuest} className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl text-lg shadow-xl hover:bg-gray-100 transform hover:-translate-y-1 transition-all">
                Start New Meeting
              </button>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                  className="w-24 bg-gray-900 border border-gray-700 rounded-xl px-4 outline-none focus:border-orange-500 transition-colors"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className="w-24 bg-gray-900 border border-gray-700 rounded-xl px-4 outline-none focus:border-orange-500 transition-colors"
                />
                <button onClick={handleJoinMeeting} className="px-6 py-4 border border-gray-700 hover:border-orange-500 rounded-xl font-bold transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8 justify-center md:justify-start mt-8 opacity-70">
            <div>
              <p className="text-2xl font-bold text-white">10M+</p>
              <p className="text-sm text-gray-500">Users</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4.8</p>
              <p className="text-sm text-gray-500">Rating</p>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 flex justify-center relative">
          <div className="absolute inset-0 bg-orange-500 blur-[100px] opacity-20 rounded-full pointer-events-none"></div>
          <img
            src="/mobile.png"
            alt="Video Call App Interface"
            className="relative w-full max-w-[350px] md:max-w-md drop-shadow-2xl animate-float"
          />
        </div>
      </div>

      {/* Footer / Background Elements */}
      <style>{`
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
