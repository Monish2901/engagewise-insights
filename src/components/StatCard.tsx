 import { cn } from "@/lib/utils";
 import { LucideIcon } from "lucide-react";
 
 interface StatCardProps {
   title: string;
   value: string | number;
   subtitle?: string;
   icon: LucideIcon;
   trend?: {
     value: number;
     isPositive: boolean;
   };
   variant?: "default" | "primary" | "success" | "warning" | "danger";
 }
 
 export function StatCard({
   title,
   value,
   subtitle,
   icon: Icon,
   trend,
   variant = "default",
 }: StatCardProps) {
   const iconVariants = {
     default: "bg-secondary text-secondary-foreground",
     primary: "bg-primary/10 text-primary",
     success: "bg-engagement-high/10 text-engagement-high",
     warning: "bg-engagement-medium/10 text-engagement-medium",
     danger: "bg-engagement-low/10 text-engagement-low",
   };
 
   return (
     <div className="stat-card animate-fade-in">
       <div className="flex items-start justify-between">
         <div className="space-y-1">
           <p className="text-sm font-medium text-muted-foreground">{title}</p>
           <p className="text-3xl font-bold font-display text-foreground">
             {value}
           </p>
           {subtitle && (
             <p className="text-sm text-muted-foreground">{subtitle}</p>
           )}
           {trend && (
             <p
               className={cn(
                 "text-sm font-medium",
                 trend.isPositive ? "text-engagement-high" : "text-engagement-low"
               )}
             >
               {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
             </p>
           )}
         </div>
         <div
           className={cn(
             "p-3 rounded-xl transition-transform hover:scale-105",
             iconVariants[variant]
           )}
         >
           <Icon className="w-6 h-6" />
         </div>
       </div>
     </div>
   );
 }