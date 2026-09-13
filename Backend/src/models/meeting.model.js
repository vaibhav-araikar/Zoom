import mongoose from "mongoose";

const meetingSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  meeting_code: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    defult: Date.now,
  },
  time: {
    type: String,
    required: true,
  },
  participants: {
    type: [String],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Meeting = mongoose.model("Meeting", meetingSchema);
export { Meeting };

// {Meeting} : ye hum tab use karenge jab hume ek file se bahot saari cheezein export karni ho, jaise ki {User, Meeting} ek hi file se export karna ho.
