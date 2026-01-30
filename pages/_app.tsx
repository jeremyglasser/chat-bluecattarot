import "@/styles/globals.css";
import "@/styles/app.css";
import type { AppProps } from "next/app";
import { Amplify } from "aws-amplify";
import { ThemeProvider } from "@aws-amplify/ui-react";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { theme } from "@/styles/theme";

Amplify.configure(outputs);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
