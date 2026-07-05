"use client";

import React from "react";
import { Provider as StyletronProvider } from "styletron-react";
import { Client as StyletronClient, Server as StyletronServer } from "styletron-engine-atomic";
import { useServerInsertedHTML } from "next/navigation";
import { BaseProvider, createTheme } from "baseui";

let styletronEngine: any;

function getStyletronEngine() {
  if (typeof window === "undefined") {
    return new StyletronServer();
  }
  if (!styletronEngine) {
    styletronEngine = new StyletronClient();
  }
  return styletronEngine;
}

// Create custom theme following .agents/degin.md specifications
export const cursorTheme = createTheme({
  colors: {
    // Base canvas: warm cream (#f7f7f4)
    backgroundPrimary: "#f7f7f4",
    // Canvas soft: #fafaf7
    backgroundSecondary: "#fafaf7",
    // Surface Card: #ffffff
    backgroundTertiary: "#ffffff",
    
    // Text Colors
    contentPrimary: "#26251e", // Warm near-black ink
    contentSecondary: "#5a5852", // Default running-text body
    contentTertiary: "#807d72", // Muted
    
    // Primary Buttons (Cursor Orange)
    buttonPrimaryFill: "#f54e00",
    buttonPrimaryHover: "#d04200",
    buttonPrimaryActive: "#d04200",
    buttonPrimaryText: "#ffffff",

    // Secondary Buttons (White card pill on cream canvas)
    buttonSecondaryFill: "#ffffff",
    buttonSecondaryHover: "#fafaf7",
    buttonSecondaryActive: "#e6e5e0",
    buttonSecondaryText: "#26251e",
    buttonSecondaryBorder: "#cfcdc4",
    
    // Inputs
    inputFill: "#ffffff",
    inputFillActive: "#ffffff",
    inputBorder: "#e6e5e0",
    inputBorderActive: "#cfcdc4",

    // Dialogs / Modals
    backgroundModal: "#ffffff",
    
    // Borders
    borderOpaque: "#e6e5e0", // Hairline
    borderSelected: "#cfcdc4", // Hairline strong
  },
  typography: {
    primaryFontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    monoFontFamily: "JetBrains Mono, monospace",
  },
  borders: {
    buttonBorderRadius: "8px",
    inputBorderRadius: "8px",
    cardBorderRadius: "12px",
  }
});

export function StyletronProviderWrapper({ children }: { children: React.ReactNode }) {
  // Always obtain a new server engine on server, or reuse the client instance
  const [engine] = React.useState(() => getStyletronEngine());

  // Collect and insert styles into head on the server
  useServerInsertedHTML(() => {
    if (typeof window === "undefined" && engine instanceof StyletronServer) {
      const stylesheets = engine.getStylesheets();
      return (
        <>
          {stylesheets.map((sheet: any, index: number) => (
            <style
              className="_styletron_hydrate_"
              key={index}
              media={sheet.media || undefined}
              dangerouslySetInnerHTML={{ __html: sheet.css }}
            />
          ))}
        </>
      );
    }
    return null;
  });

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={cursorTheme}>
        {children}
      </BaseProvider>
    </StyletronProvider>
  );
}
