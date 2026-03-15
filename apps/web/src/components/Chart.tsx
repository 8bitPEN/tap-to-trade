import { useEffect, useRef } from "react";
import { createChart, type IChartApi, type ISeriesApi } from "lightweight-charts";
import { useGameStore } from "../store/gameStore";
import { GridOverlay } from "./GridOverlay";

export function Chart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // Create chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        background: { color: "#0a0a0f" },
        textColor: "#666",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(0, 240, 255, 0.04)" },
        horzLines: { color: "rgba(0, 240, 255, 0.04)" },
      },
      crosshair: {
        vertLine: { color: "rgba(0, 240, 255, 0.3)", width: 1, style: 2 },
        horzLine: { color: "rgba(0, 240, 255, 0.3)", width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: "rgba(0, 240, 255, 0.15)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(0, 240, 255, 0.15)",
        timeVisible: true,
        secondsVisible: true,
      },
    });

    const lineSeries = chart.addLineSeries({
      color: "#00f0ff",
      lineWidth: 2,
      priceLineVisible: true,
      priceLineColor: "rgba(0, 240, 255, 0.5)",
      lastValueVisible: true,
    });

    chartRef.current = chart;
    seriesRef.current = lineSeries;

    // Handle resize
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.resize(width, height);
      }
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Update series on price ticks
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      if (state.priceHistory.length === 0) return;
      if (state.priceHistory === prevState.priceHistory) return;

      const latest = state.priceHistory[state.priceHistory.length - 1];
      if (!latest || !seriesRef.current) return;

      seriesRef.current.update({
        time: (latest.time / 1000) as import("lightweight-charts").UTCTimestamp,
        value: latest.value,
      });

      chartRef.current?.timeScale().scrollToRealTime();
    });

    return unsubscribe;
  }, []);

  return (
    <div style={styles.wrapper}>
      <div ref={containerRef} style={styles.chartContainer} />
      <GridOverlay chartRef={chartRef} containerRef={containerRef} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  chartContainer: {
    width: "100%",
    height: "100%",
  },
};
