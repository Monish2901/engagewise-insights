 import { useMemo } from "react";
 import { cn } from "@/lib/utils";
 
 interface EngagementGaugeProps {
   score: number;
   level: "high" | "medium" | "low";
   size?: "sm" | "md" | "lg";
 }
 
 export function EngagementGauge({
   score,
   level,
   size = "md",
 }: EngagementGaugeProps) {
   const sizeConfig = {
     sm: { width: 120, strokeWidth: 8, fontSize: "text-xl" },
     md: { width: 180, strokeWidth: 12, fontSize: "text-3xl" },
     lg: { width: 240, strokeWidth: 16, fontSize: "text-4xl" },
   };
 
   const config = sizeConfig[size];
   const radius = (config.width - config.strokeWidth) / 2;
   const circumference = radius * Math.PI;
   const progress = (score / 100) * circumference;
 
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
           className={cn(colors[level], "transition-all duration-700 ease-out")}
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
         <span className={cn("font-display font-bold", config.fontSize, bgColors[level])}>
           {score.toFixed(1)}%
         </span>
         <span className="text-sm text-muted-foreground capitalize">
           {level} Engagement
         </span>
       </div>
     </div>
   );
 }