# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

SNACKBAR USE:- snackbar ek chhota sa message hota hai jo screen ke bottom par ata hai aur kuch seconds me authomatically disapprear ho jata hai.
Snackbar ka use user ko short aur temporary message dikhane ke liye hota hai, bina uska kaam interrupt kiye.
✅ Snackbar use karne ke reasons (Memorize)

1️⃣ Instant feedback
User ke action ka result batata hai
👉 Login success / Error / Data saved

2️⃣ Non-blocking
User ko disturb nahi karta
👉 Popup nahi, alert jaisa annoying nahi

3️⃣ Better UX
👉 Clean, modern aur professional feel deta hai

4️⃣ Action-based message
👉 Form submit, button click, delete/update ke baad
👉 Example: Message deleted → Undo

5️⃣ Less space
👉 Screen ke bottom me aata hai, zyada space cover nahi karta


🤝 corsAxios client = a reusable, pre-configured axios object that makes API calls clean, consistent, and professional.


{/*1️⃣ var socketRef = useRef();


❓ Why use this?

Socket connection ek hi baar banana hota hai

Re-render hone par socket reset nahi hona chahiye

❌ Agar useState use karo

Re-render me socket object change ho jayega

Connection break ho sakta hai

✅ useRef ka fayda

Value persist rehti hai

Re-render par change nahi hoti  

2️⃣ let socketIdRef = useRef(); // my socket id
❓ Why use this?

Har user ka unique socket ID hota hai

Ye ID calls / signaling me use hoti hai

Use cases:

Call request bhejna

Answer receive karna

Disconnect handle karna


| Variable         | Kya kaam                  |
| ---------------- | ------------------------- |
| `socketRef`      | Socket connection store   |
| `socketIdRef`    | User ka unique socket ID  |
| `localvideoRef`  | Video HTML element access |
| `videoAvailable` | Camera hai ya nahi        |
| `audioAvailable` | Mic hai ya nahi           |
| `video`          | Video ON / OFF            |

*/
}
