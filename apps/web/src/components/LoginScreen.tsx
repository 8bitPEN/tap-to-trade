import { usePrivy } from "@privy-io/react-auth";

export function LoginScreen() {
  const { login } = usePrivy();

  return (
    <div style={styles.container}>
      {/* CRT scanline overlay */}
      <div className="scanline-overlay" />

      <div style={styles.content}>
        <h1 style={styles.title} className="glitch-text">
          TAP TO TRADE
        </h1>

        <p style={styles.subtitle}>SOL-USD Perpetuals &bull; Testnet</p>

        <div style={styles.divider} />

        <button
          style={styles.loginButton}
          onClick={() => login({ loginMethods: ["twitter"] })}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--pink)";
            e.currentTarget.style.color = "#000";
            e.currentTarget.style.boxShadow = "0 0 30px var(--pink), 0 0 60px rgba(255, 45, 120, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--pink)";
            e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 45, 120, 0.3)";
          }}
        >
          Login with X
        </button>

        <p style={styles.footer}>
          Powered by{" "}
          <span style={{ color: "var(--cyan)" }}>bulk.trade</span>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(ellipse at center, #111118 0%, #0a0a0f 70%)",
    position: "relative",
    overflow: "hidden",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    zIndex: 2,
  },
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "clamp(2.5rem, 8vw, 5rem)",
    fontWeight: 900,
    letterSpacing: "0.15em",
    background: "linear-gradient(135deg, var(--cyan), var(--pink))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "none",
    userSelect: "none",
  },
  subtitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "1rem",
    color: "var(--text-dim)",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
  },
  divider: {
    width: "120px",
    height: "1px",
    background: "linear-gradient(90deg, transparent, var(--cyan), transparent)",
    margin: "8px 0",
  },
  loginButton: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "1.1rem",
    fontWeight: 700,
    padding: "16px 48px",
    border: "2px solid var(--pink)",
    borderRadius: "4px",
    background: "transparent",
    color: "var(--pink)",
    cursor: "pointer",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    transition: "all 0.2s ease",
    boxShadow: "0 0 15px rgba(255, 45, 120, 0.3)",
  },
  footer: {
    marginTop: "32px",
    fontSize: "0.75rem",
    color: "var(--text-dim)",
    letterSpacing: "0.1em",
  },
};
