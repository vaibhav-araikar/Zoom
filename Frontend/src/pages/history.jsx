import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function History() {
  const { getUserHistory } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const route = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getUserHistory();
        setMeetings(history || []);
      } catch (error) {
        console.error("Error fetching user history:", error);
      }
    };

    fetchHistory();
  }, [getUserHistory]);

  const bull = (
    <Box
      component="span"
      sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
    >
      •
    </Box>
  );

  const card = (
    <React.Fragment>
      <CardContent>
        <Typography gutterBottom sx={{ color: "text.secondary", fontSize: 14 }}>
          Word of the Day
        </Typography>
        <Typography variant="h5" component="div">
          be{bull}nev{bull}o{bull}lent
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
          adjective
        </Typography>
        <Typography variant="body2">
          well meaning and kindly.
          <br />
          {'"a benevolent smile"'}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Learn More</Button>
      </CardActions>
    </React.Fragment>
  );

  return (
    <div>
      <h1>History Page</h1>
      <p>Welcome to the History Page</p>
      {Array.isArray(meetings) &&
        meetings.map((meeting) => (
          <Card key={meeting._id} variant="outlined">
            <CardContent>
              <p>Meeting Code: {meeting.meeting_code}</p>
              <p>Date: {new Date(meeting.date).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
