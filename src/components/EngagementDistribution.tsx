 import { useMemo } from "react";
 import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { PieChartIcon } from "lucide-react";
 
 interface EngagementDistributionProps {
   summary: {
     high: number;
     medium: number;
     low: number;
     total: number;
   } | null;
 }
 
 const COLORS = {
   high: "hsl(145, 65%, 42%)",
   medium: "hsl(38, 92%, 50%)",
   low: "hsl(0, 75%, 55%)",
 };
 
 export function EngagementDistribution({ summary }: EngagementDistributionProps) {
   const chartData = useMemo(() => {
     if (!summary || summary.total === 0) return [];
     return [
       { name: "High", value: summary.high, color: COLORS.high },
       { name: "Medium", value: summary.medium, color: COLORS.medium },
       { name: "Low", value: summary.low, color: COLORS.low },
     ].filter((d) => d.value > 0);
   }, [summary]);
 
   if (!summary || summary.total === 0) {
     return (
       <Card>
         <CardHeader>
           <CardTitle className="font-display flex items-center gap-2">
             <PieChartIcon className="w-5 h-5 text-primary" />
             Engagement Distribution
           </CardTitle>
           <CardDescription>Overview of student engagement levels</CardDescription>
         </CardHeader>
         <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
           No data available yet
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="font-display flex items-center gap-2">
           <PieChartIcon className="w-5 h-5 text-primary" />
           Engagement Distribution
         </CardTitle>
         <CardDescription>Overview of student engagement levels</CardDescription>
       </CardHeader>
       <CardContent>
         <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie
                 data={chartData}
                 cx="50%"
                 cy="50%"
                 innerRadius={60}
                 outerRadius={90}
                 paddingAngle={4}
                 dataKey="value"
               >
                 {chartData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.color} />
                 ))}
               </Pie>
               <Tooltip
                 content={({ active, payload }) => {
                   if (!active || !payload?.length) return null;
                   const data = payload[0].payload;
                   return (
                     <div className="bg-popover border rounded-lg p-3 shadow-lg">
                       <p className="text-sm font-medium">{data.name} Engagement</p>
                       <p className="text-lg font-bold">{data.value} students</p>
                       <p className="text-sm text-muted-foreground">
                         {((data.value / summary.total) * 100).toFixed(1)}%
                       </p>
                     </div>
                   );
                 }}
               />
               <Legend
                 formatter={(value) => (
                   <span className="text-sm text-foreground">{value}</span>
                 )}
               />
             </PieChart>
           </ResponsiveContainer>
         </div>
       </CardContent>
     </Card>
   );
 }