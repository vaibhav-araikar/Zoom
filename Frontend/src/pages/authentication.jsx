import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import SignInCard from "./components/SignIn";
import Content from "./components/Content";
import AppTheme from "../shared-theme/AppTheme";

export default function Authentication(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Stack
        direction="column"
        component="main"
        sx={{
          justifyContent: "center",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            display: "block",
            position: "absolute",
            zIndex: -1,
            inset: 0,
            backgroundImage:
              "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
            backgroundRepeat: "no-repeat",
          },
        }}
      >
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            gap: { xs: 6, sm: 12 },
            p: { xs: 2, sm: 4 },
            m: "auto",
            width: "100%",
            maxWidth: "1200px",
          }}
        >
          <Content />
          <SignInCard />
        </Stack>
      </Stack>
    </AppTheme>
  );
}
