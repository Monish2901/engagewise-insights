import { cn } from "@/lib/utils";

export interface EngagementGaugeProps {
  score: number | null;
  level?: "high" | "medium" | "low" | null;
  size?: "sm" | "md" | "lg";
}

export function EngagementGauge({
  score,
  level,
  size = "md",
}: EngagementGaugeProps) {
  // Determine level from score if not provided
  const computedLevel = level ?? (score !== null 
    ? score >= 70 ? "high" : score >= 40 ? "medium" : "low"
    : null);
  
  const displayScore = score ?? 0;
   const sizeConfig = {
     sm: { width: 120, strokeWidth: 8, fontSize: "text-xl" },
     md: { width: 180, strokeWidth: 12, fontSize: "text-3xl" },
     lg: { width: 240, strokeWidth: 16, fontSize: "text-4xl" },
   };
 
  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const progress = (displayScore / 100) * circumference;
 
   const colors = {
     high: "stroke-engagement-high",
     medium: "stroke-engagement-medium",
     low: "stroke-engagement-low",
   };
 
   const bgColors = {
     high: "text-engagement-high",
     medium: "text-engagement-medium",
     low: "text-engagement-low",
   };
 
  if (score === null || computedLevel === null) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={config.width}
          height={config.width / 2 + 20}
          viewBox={`0 0 ${config.width} ${config.width / 2 + 20}`}
          className="transform"
        >
          <path
            d={`M ${config.strokeWidth / 2}, ${config.width / 2} 
                A ${radius}, ${radius} 0 0 1 ${config.width - config.strokeWidth / 2}, ${config.width / 2}`}
            fill="none"
            className="stroke-muted"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className={cn("font-display font-bold text-muted-foreground", config.fontSize)}>
            —
          </span>
          <span className="text-sm text-muted-foreground">
            No Data
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={config.width}
        height={config.width / 2 + 20}
        viewBox={`0 0 ${config.width} ${config.width / 2 + 20}`}
        className="transform"
      >
        {/* Background arc */}
        <path
          d={`M ${config.strokeWidth / 2}, ${config.width / 2} 
              A ${radius}, ${radius} 0 0 1 ${config.width - config.strokeWidth / 2}, ${config.width / 2}`}
          fill="none"
          className="stroke-muted"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M ${config.strokeWidth / 2}, ${config.width / 2} 
              A ${radius}, ${radius} 0 0 1 ${config.width - config.strokeWidth / 2}, ${config.width / 2}`}
          fill="none"
          className={cn(colors[computedLevel], "transition-all duration-700 ease-out")}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{
            transition: "stroke-dashoffset 0.7s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <span className={cn("font-display font-bold", config.fontSize, bgColors[computedLevel])}>
          {displayScore.toFixed(1)}%
        </span>
        <span className="text-sm text-muted-foreground capitalize">
          {computedLevel} Engagement
        </span>
      </div>
    </div>
  );
}