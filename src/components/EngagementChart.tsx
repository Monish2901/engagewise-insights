 import { useMemo } from "react";
 import {
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   Area,
   AreaChart,
 } from "recharts";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Prediction } from "@/hooks/useStudents";
 import { TrendingUp } from "lucide-react";
 import { format } from "date-fns";
 
 interface EngagementChartProps {
   predictions: Prediction[];
   title?: string;
   description?: string;
 }
 
 export function EngagementChart({
   predictions,
   title = "Engagement Trend",
   description = "Track engagement score over time",
 }: EngagementChartProps) {
   const chartData = useMemo(() => {
     return predictions.map((p) => ({
       date: format(new Date(p.predicted_at), "MMM d"),
       fullDate: format(new Date(p.predicted_at), "MMM d, yyyy HH:mm"),
       score: p.engagement_score,
       level: p.engagement_level,
     }));
   }, [predictions]);
 
   if (predictions.length === 0) {
     return (
       <Card>
         <CardHeader>
           <CardTitle className="font-display flex items-center gap-2">
             <TrendingUp className="w-5 h-5 text-primary" />
             {title}
           </CardTitle>
           <CardDescription>{description}</CardDescription>
         </CardHeader>
         <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
           No prediction history yet. Submit metrics to generate predictions.
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="font-display flex items-center gap-2">
           <TrendingUp className="w-5 h-5 text-primary" />
           {title}
         </CardTitle>
         <CardDescription>{description}</CardDescription>
       </CardHeader>
       <CardContent>
         <div className="h-72">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={chartData}>
               <defs>
                 <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                   <stop
                     offset="5%"
                     stopColor="hsl(var(--primary))"
                     stopOpacity={0.3}
                   />
                   <stop
                     offset="95%"
                     stopColor="hsl(var(--primary))"
                     stopOpacity={0}
                   />
                 </linearGradient>
               </defs>
               <CartesianGrid
                 strokeDasharray="3 3"
                 className="stroke-border"
                 vertical={false}
               />
               <XAxis
                 dataKey="date"
                 tick={{ fontSize: 12 }}
                 className="text-muted-foreground"
                 axisLine={false}
                 tickLine={false}
               />
               <YAxis
                 domain={[0, 100]}
                 tick={{ fontSize: 12 }}
                 className="text-muted-foreground"
                 axisLine={false}
                 tickLine={false}
                 tickFormatter={(value) => `${value}%`}
               />
               <Tooltip
                 content={({ active, payload }) => {
                   if (!active || !payload?.length) return null;
                   const data = payload[0].payload;
                   return (
                     <div className="bg-popover border rounded-lg p-3 shadow-lg">
                       <p className="text-sm font-medium">{data.fullDate}</p>
                       <p className="text-lg font-bold text-primary">
                         {data.score.toFixed(1)}%
                       </p>
                       <p className="text-sm text-muted-foreground capitalize">
                         {data.level} Engagement
                       </p>
                     </div>
                   );
                 }}
               />
               <Area
                 type="monotone"
                 dataKey="score"
                 stroke="hsl(var(--primary))"
                 strokeWidth={2}
                 fill="url(#colorScore)"
               />
             </AreaChart>
           </ResponsiveContainer>
         </div>
       </CardContent>
     </Card>
   );
 }