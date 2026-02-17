import { Schema } from "mongoose";
const meetingSchema = new Schema({
  user_id: { type: string },
  meetingCode: { type: string, required: true },
  date: { type: Date, default: Date.now, required: true },
});
const Meeting = mongoose.model("Meeting", meetingSchema);
export {Meeting}; ///JAB EK HI FILE SE MULTIPLE FILES EXPORT KAENA  HO TAB KE LIYE
