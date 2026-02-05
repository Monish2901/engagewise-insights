 import { cn } from "@/lib/utils";
 
 interface EngagementBadgeProps {
   level: "high" | "medium" | "low";
   score?: number;
   size?: "sm" | "md" | "lg";
   showScore?: boolean;
 }
 
 export function EngagementBadge({
   level,
   score,
   size = "md",
   showScore = false,
 }: EngagementBadgeProps) {
   const sizeClasses = {
     sm: "px-2 py-0.5 text-xs",
     md: "px-3 py-1 text-sm",
     lg: "px-4 py-2 text-base",
   };
 
   const levelClasses = {
     high: "bg-engagement-high text-engagement-high-foreground",
     medium: "bg-engagement-medium text-engagement-medium-foreground",
     low: "bg-engagement-low text-engagement-low-foreground",
   };
 
   const levelLabels = {
     high: "High",
     medium: "Medium",
     low: "Low",
   };
 
   return (
     <span
       className={cn(
         "inline-flex items-center gap-1.5 font-medium rounded-full capitalize transition-all",
         sizeClasses[size],
         levelClasses[level]
       )}
     >
       <span
         className={cn(
           "w-2 h-2 rounded-full bg-current opacity-80",
           size === "sm" && "w-1.5 h-1.5"
         )}
       />
       {levelLabels[level]}
       {showScore && score !== undefined && (
         <span className="opacity-80">({score.toFixed(1)}%)</span>
       )}
     </span>
   );
 }