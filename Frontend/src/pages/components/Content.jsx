import * as React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import { SitemarkIcon } from "./CustomIcons";

const items = [
  {
    icon: <SecurityRoundedIcon sx={{ color: "text.secondary" }} />,
    title: "Secure by design",
    description:
      "Your data is protected with industry-standard encryption and best practices.",
  },
  {
    icon: <ThumbUpAltRoundedIcon sx={{ color: "text.secondary" }} />,
    title: "Reliable performance",
    description:
      "Enjoy a smooth, dependable experience every time you sign in.",
  },
  {
    icon: <LoginRoundedIcon sx={{ color: "text.secondary" }} />,
    title: "Quick access",
    description:
      "Get back into your account in seconds with a simple, familiar flow.",
  },
];

export default function Content() {
  return (
    <Stack
      sx={{
        flexDirection: "column",
        alignSelf: "center",
        gap: 4,
        maxWidth: 450,
      }}
    >
      <Stack direction="row" sx={{ justifyContent: "flex-start" }}>
        <SitemarkIcon />
      </Stack>
      {items.map((item, index) => (
        <Stack key={index} direction="row" sx={{ gap: 2 }}>
          {item.icon}
          <div>
            <Typography gutterBottom sx={{ fontWeight: "medium" }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {item.description}
            </Typography>
          </div>
        </Stack>
      ))}
    </Stack>
  );
}
