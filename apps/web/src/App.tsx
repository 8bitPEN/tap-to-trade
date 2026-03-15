import { Component, type ReactNode } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { PrivyConfig } from "./providers/PrivyConfig";
import { GameScreen } from "./components/GameScreen";
import { LoginScreen } from "./components/LoginScreen";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: "#fff", background: "#1a1a2e", minHeight: "100vh" }}>
          <h1>Something went wrong</h1>
          <pre style={{ color: "#ff6b6b", whiteSpace: "pre-wrap" }}>
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer" }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { authenticated } = usePrivy();

  return authenticated ? <GameScreen /> : <LoginScreen />;
}

export function App() {
  return (
    <ErrorBoundary>
      <PrivyConfig>
        <AppContent />
      </PrivyConfig>
    </ErrorBoundary>
  );
}
