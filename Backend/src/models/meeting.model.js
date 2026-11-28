import mongoose from "mongoose";
import { Schema } from "mongoose";

const meetingSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },

  // Meeting code numbers aur letters dono ho sakte hai
  meeting_code: {
    type: String,
    required: true,
    trim: true,
  },

  // Automatically current date aur time store hoga
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },

  // Date already time store karti hai, isliye ye optional hai
  time: {
    type: String,
  },

  // Initially participants ki list empty hogi
  participants: {
    type: [String],
    default: [],
  },

  // Meeting create karne wale user ki ID
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Meeting = mongoose.model("Meeting", meetingSchema);
export { Meeting };

// {Meeting} : ye hum tab use karenge jab hume ek file se bahot saari cheezein export karni ho, jaise ki {User, Meeting} ek hi file se export karna ho.

// default se hum ek hi cheez ko export karte hai, jaise ki export default User; ya export default Meeting;
