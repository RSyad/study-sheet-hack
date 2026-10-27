"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidChartProps {
  chart: string;
  fallbackSteps: string[];
}

export default function MermaidChart({ chart, fallbackSteps }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    mermaid.initialize({
      startOnLoad: false,
      theme: "neutral",
      securityLevel: "loose",
      fontFamily: "inherit",
    });

    const renderChart = async () => {
      if (!containerRef.current || !chart) return;
      try {
        // Clean out any accidental markdown backticks from the LLM
        const cleanChart = chart
          .replace(/```mermaid/gi, "")
          .replace(/```/g, "")
          .trim();

        const uniqueId = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, cleanChart);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.warn("Mermaid syntax fallback triggered:", err);
        setHasError(true);
      }
    };

    renderChart();
  }, [chart]);

  // Judge-Proof Fallback: If Mermaid syntax ever fails, show a clean marker arrow flow!
  if (hasError) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 py-3">
        {fallbackSteps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="border-2 border-neutral-900 bg-white px-3 py-1.5 rounded-md text-neutral-900 font-bold text-sm">
              {step}
            </div>
            {idx < fallbackSteps.length - 1 && (
              <span className="text-red-600 font-bold text-xl">➔</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto flex justify-center py-2"
    />
  );
}
