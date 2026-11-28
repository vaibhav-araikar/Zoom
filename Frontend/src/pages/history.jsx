import React from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const { getUserHistory } = React.useContext(AuthContext);
const [meetings, setMeetings] = React.useState([]);

const route = useNavigate();

useEffect(() => {
  const fetchHistory = async () => {
    try {
      const history = await getUserHistory();
      setMeetings(history);
    } catch (error) {
      console.error("Error fetching user history:", error);
    }
  };

  fetchHistory();
}, []);

export default function History() {
  return (
    <div>
      <h1>History Page</h1>
      <p>Welcome to the History Page</p>
      {meetings.map((meeting) => (
        <Card key={meeting._id} variant="outlined">
          <CardContent>
            <p>Meeting Code: {meeting.meeting_code}</p>
            <p>Date: {new Date(meeting.createdAt).toLocaleString()}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
