import React, { useState } from "react";

function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  let roomId = "123456"; // Replace with actual room ID

  let handleJoinVideoCall = async () => {
    await navigate(`${meetingCode}`);
  };

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
    </div>
  );
}

export default withAuth(Home);
