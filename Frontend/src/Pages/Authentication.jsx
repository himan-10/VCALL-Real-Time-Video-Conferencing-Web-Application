// import React, { useContext, useState, useMemo } from "react";
// import { FaUserLock } from "react-icons/fa";
// import { AuthContext } from "../contexts/AuthContext";

// export default function Authentication() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [formState, setFormState] = useState(0);
//   const [toast, setToast] = useState({ open: false, msg: "", type: "success" });
//   const [error, setError] = useState("");

//   const { handleLogin, handleRegister } = useContext(AuthContext);

//   // ✅ Random Unsplash image (changes on refresh)
//   // const bgImage = useMemo(
//   //   () =>
//   //     `https://source.unsplash.com/1600x900/?coding,dark,technology&sig=${Date.now()}`,
//   //   []
//   // );
//   const [bgImage, setBgImage] = useState("");

// useEffect(() => {
//   // Random image on mount
//   setBgImage(
//     `https://source.unsplash.com/1600x900/?coding,technology,dark&sig=${Date.now()}`
//   );
// }, [])

//   const showToast = (msg, type = "success") => {
//     setToast({ open: true, msg, type });
//     setTimeout(() => setToast({ open: false, msg: "", type }), 3000);
//   };

//   const handleAuth = async () => {
//     try {
//       if (formState === 0) {
//         await handleLogin(username, password);
//         showToast("Login successful");
//       } else {
//         await handleRegister(name, username, password);
//         showToast("Registration successful");
//         setFormState(0);
//         setName("");
//       }
//       setUsername("");
//       setPassword("");
//       setError("");
//     } catch (err) {
//       const msg = err?.response?.data?.message || "Something went wrong";
//       setError(msg);
//       showToast(msg, "error");
//     }
//   };

//   return (
//     <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white text-black">

//       {/* LEFT IMAGE */}
//       <div className="hidden md:block relative h-screen">
//         <img
//           src={bgImage || "https://source.unsplash.com/1600x900/?coding,technology,dark"}
//           alt="Authentication background"
//           className="absolute inset-0 w-full h-full object-cover bg-gray-200"
//         />
//         {/* <div className="absolute inset-0 bg-black/40" /> */}
//       </div>

//       {/* RIGHT FORM */}
//       <div className="flex items-center justify-center px-4">
//         <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">

//           {/* ICON */}
//           <div className="flex justify-center mb-4">
//             <div className="w-14 h-14 bg-blue-600 text-white flex items-center justify-center rounded-full">
//               <FaUserLock size={26} />
//             </div>
//           </div>

//           <h2 className="text-2xl font-bold text-center mb-6">
//             {formState === 0 ? "Sign In" : "Sign Up"}
//           </h2>

//           {/* TOGGLE */}
//           <div className="flex gap-3 mb-5">
//             {["Sign In", "Sign Up"].map((text, i) => (
//               <button
//                 key={i}
//                 onClick={() => setFormState(i)}
//                 className={`flex-1 py-2 rounded font-medium transition ${
//                   formState === i
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-200 text-black"
//                 }`}
//               >
//                 {text}
//               </button>
//             ))}
//           </div>

//           {/* FORM */}
//           {formState === 1 && (
//             <input
//               placeholder="Full Name"
//               className="input"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//           )}

//           <input
//             placeholder="Username"
//             className="input"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             className="input"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />

//           {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

//           <button
//             onClick={handleAuth}
//             className="w-full mt-5 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
//           >
//             {formState === 0 ? "Login" : "Register"}
//           </button>
//         </div>
//       </div>

//       {/* TOAST / SNACKBAR */}
//       {toast.open && (
//         <div
//           className={`fixed bottom-5 right-5 px-4 py-2 rounded shadow-lg text-white animate-slide ${
//             toast.type === "error" ? "bg-red-600" : "bg-blue-600"
//           }`}
//         >
//           {toast.msg}
//         </div>
//       )}

//       {/* EXTRA STYLES */}
//       <style>
//         {`
//         .input {
//           width: 100%;
//           margin-top: 0.75rem;
//           padding: 0.6rem 0.75rem;
//           border-radius: 0.375rem;
//           border: 1px solid #ccc;
//           outline: none;
//         }
//         .input:focus {
//           border-color: #2563eb;
//           box-shadow: 0 0 0 1px #2563eb;
//         }
//         @keyframes slide {
//           from { transform: translateX(100%); opacity: 0; }
//           to { transform: translateX(0); opacity: 1; }
//         }
//         .animate-slide {
//           animation: slide 0.4s ease-out;
//         }
//       `}
//       </style>
//     </div>
//   );






import React, { useContext, useState, useMemo } from "react";
import { AuthContext } from "../contexts/AuthContext";

const images = [
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
  "https://images.unsplash.com/photo-1518770660439-4636190af475",
  "https://images.unsplash.com/photo-1665602878676-219e01293b51?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
];

export default function Authentication() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [formState, setFormState] = useState(0);
  const [toast, setToast] = useState({ open: false, msg: "", type: "" });
  const [error, setError] = useState("");

  const { handleLogin, handleRegister } = useContext(AuthContext);

  // Random image (changes on refresh)
  const bgImage = useMemo(
    () => images[Math.floor(Math.random() * images.length)],
    []
  );

  const showToast = (msg, type = "success") => {
    setToast({ open: true, msg, type });
    setTimeout(() => setToast({ open: false, msg: "", type: "" }), 3000);
  };

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
        showToast("Login successful");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500)
      } else {
        await handleRegister(name, username, password);
        showToast("Registration successful");
        setFormState(0);
        setName("");
      }
      setUsername("");
      setPassword("");
      setError("");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      setError(msg);
      showToast(msg, "error");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-950 text-white">
      {/* LEFT IMAGE / TESTIMONIAL */}
      <div
        className="hidden md:flex flex-col justify-between p-12 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-orange-500 rounded-lg"></div>
            <h1 className="text-xl font-bold">VCall</h1>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <blockquote className="text-2xl font-medium leading-relaxed mb-6">
            "The most reliable video calling platform I've used. It feels just like being in the same room."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-500"></div>
            <div>
              <p className="font-bold">Happy User</p>
              <p className="text-sm text-gray-400">Product Designer</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-gray-950 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#ea580c_100%)] opacity-20 pointer-events-none"></div>

        <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-8 rounded-2xl shadow-2xl relative z-10">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">
              {formState === 0 ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-400">
              {formState === 0 ? "Enter your credentials to access your account" : "Sign up to start video calling"}
            </p>
          </div>

          {/* TOGGLE */}
          <div className="flex gap-2 p-1 bg-gray-800 rounded-lg mb-6">
            {["Sign In", "Sign Up"].map((text, i) => (
              <button
                key={i}
                onClick={() => setFormState(i)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${formState === i
                    ? "bg-gray-700 text-white shadow"
                    : "text-gray-400 hover:text-white"
                  }`}
              >
                {text}
              </button>
            ))}
          </div>

          {/* FORM */}
          <div className="space-y-4">
            {formState === 1 && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                <input
                  placeholder="John Doe"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Username</label>
              <input
                placeholder="username"
                className="input"
                value={username}
                autoFocus
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-4 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}

          <button
            onClick={handleAuth}
            className="w-full mt-8 bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all duration-300"
          >
            {formState === 0 ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>

      {/* TOAST */}
      {toast.open && (
        <div
          className={`fixed bottom-5 right-5 px-6 py-3 rounded-xl shadow-2xl text-white font-medium animate-slide flex items-center gap-2 border
            ${toast.type === "error" ? "bg-red-900/90 border-red-700 text-red-100" : "bg-green-900/90 border-green-700 text-green-100"}`}
        >
          {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}

      {/* EXTRA STYLES */}
      <style>
        {`
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background-color: #1f2937; /* gray-800 */
          border: 1px solid #374151; /* gray-700 */
          color: white;
          outline: none;
          transition: all 0.2s;
        }
        .input:focus {
          border-color: #f97316; /* orange-500 */
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
          background-color: #111827; /* gray-900 */
        }
        @keyframes slide {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide {
          animation: slide 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}
      </style>
    </div>
  );
}
