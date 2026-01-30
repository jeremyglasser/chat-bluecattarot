import { createTheme } from "@aws-amplify/ui-react";
import { palette } from "./palette";

export const theme = createTheme({
  name: "custom-theme",
  tokens: {
    colors: {
      brand: {
        primary: {
          10: { value: palette.accent.softTealSage },
          80: { value: palette.secondary.steelBlue },
          90: { value: palette.primary.midnightNavy },
          100: { value: palette.primary.midnightNavy },
        },
      },
    },
  },
});
