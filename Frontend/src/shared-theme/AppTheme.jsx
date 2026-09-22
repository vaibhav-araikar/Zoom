import * as React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

function AppTheme({ children, ...props }) {
  const theme = React.useMemo(
    () =>
      createTheme({
        colorSchemes: { light: true, dark: true },
        cssVariables: {
          colorSchemeSelector: "data-mui-color-scheme",
          cssVarPrefix: "template",
        },
      }),
    [],
  );

  return (
    <ThemeProvider theme={theme} {...props} disableTransitionOnChange>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}

export default AppTheme;
