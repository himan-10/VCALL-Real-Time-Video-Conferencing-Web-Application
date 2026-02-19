// import axios from "axios";
// import httpStatus from "http-status";
// import { createContext, useContext, useState } from "react";
// import { useNavigate } from "react-router-dom";
// // import server from "../environment";


// export const AuthContext = createContext({});

// const client = axios.create({
//    baseURL: "http://localhost:8000",
//   withCredentials: true, // if using cookies / sessions
// })


// export const AuthProvider = ({ children }) => {

//     const authContext = useContext(AuthContext);


//     const [userData, setUserData] = useState(authContext);


//     const router = useNavigate();

//     const handleRegister = async (name, username, password) => {
//         try {
//             let request = await client.post("/register", {
//                 name: name,
//                 username: username,
//                 password: password
//             })


//             if (request.status === httpStatus.CREATED) {
//                 return request.data.message;
//             }
//         } catch (err) {
//             throw err;
//         }
//     }

//     const handleLogin = async (username, password) => {
//         try {
//             let request = await client.post("/login", {
//                 username: username,
//                 password: password
//             });

//             console.log(username, password)
//             console.log(request.data)

//             if (request.status === httpStatus.OK) {
//                 localStorage.setItem("token", request.data.token);
//                 router("/home")
//             }
//         } catch (err) {
//             throw err;
//         }
//     }

//     const getHistoryOfUser = async () => {
//         try {
//             let request = await client.get("/get_all_activity", {
//                 params: {
//                     token: localStorage.getItem("token")
//                 }
//             });
//             return request.data
//         } catch
//          (err) {
//             throw err;
//         }
//     } 

//     const addToUserHistory = async (meetingCode) => {
//         try {
//             let request = await client.post("/add_to_activity", {
//                 token: localStorage.getItem("token"),
//                 meeting_code: meetingCode
//             });
//             return request
//         } catch (e) {
//             throw e;
//         }
//     }


//     const data = {
//         userData, setUserData, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin
//     }

//     return (
//         <AuthContext.Provider value={data}>
//             {children}
//         </AuthContext.Provider>
//     )

// }
import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

// axios client
const client = axios.create({
  baseURL: "https://vcall-real-time-video-conferencing-web-ew4s.onrender.com/api/v1/users",
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {

  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // REGISTER
  const handleRegister = async (name, username, password) => {
    try {
      const res = await client.post("/register", {
        name,
        username,
        password,
      });

      if (res.status === httpStatus.CREATED) {
        return res.data.message;
      }
    } catch (err) {
      throw err;
    }
  };

  // LOGIN
  const handleLogin = async (username, password) => {
    try {
      const res = await client.post("/login", {
        username,
        password,
      });

      if (res.status === httpStatus.OK) {
        localStorage.setItem("token", res.data.token);
        setUserData(res.data.user);
        // navigate("/home");
      }
    } catch (err) {
      throw err;
    }
  };

  // GET HISTORY
  const getHistoryOfUser = async () => {
    try {
      const res = await client.get("/get_all_activity", {
        params: {
          token: localStorage.getItem("token"),
        },
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // ADD HISTORY
  const addToUserHistory = async (meetingCode) => {
    try {
      const res = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meeting_code: meetingCode,
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const history = await getHistoryOfUser();
          setUserData(history); // History endpoint returns {name, username, activity}
        } catch (err) {
          console.error("Failed to restore session:", err);
          // Optional: clear invalid token
          // localStorage.removeItem("token");
        }
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData,
        handleRegister,
        handleLogin,
        getHistoryOfUser,
        addToUserHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
