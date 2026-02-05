 import { DashboardLayout } from "@/components/DashboardLayout";
 import { StatCard } from "@/components/StatCard";
 import { EngagementDistribution } from "@/components/EngagementDistribution";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { useStudents, useEngagementSummary } from "@/hooks/useStudents";
 import { Users, Target, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";
 import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   Cell,
 } from "recharts";
 import { useMemo } from "react";
 
 const Analytics = () => {
   const { data: students = [] } = useStudents();
   const { data: summary } = useEngagementSummary();
 
   const metricsAverage = useMemo(() => {
     const studentsWithMetrics = students.filter((s) => s.latestMetrics);
     if (studentsWithMetrics.length === 0) return null;
 
     const totals = studentsWithMetrics.reduce(
       (acc, s) => {
         const m = s.latestMetrics!;
         return {
           attendance: acc.attendance + m.attendance_rate,
           assignments: acc.assignments + m.assignment_completion,
           participation: acc.participation + m.participation_score,
           time: acc.time + m.time_on_platform,
         };
       },
       { attendance: 0, assignments: 0, participation: 0, time: 0 }
     );
 
     const count = studentsWithMetrics.length;
     return {
       attendance: totals.attendance / count,
       assignments: totals.assignments / count,
       participation: totals.participation / count,
       time: totals.time / count,
     };
   }, [students]);
 
   const metricsChartData = useMemo(() => {
     if (!metricsAverage) return [];
     return [
       {
         name: "Attendance",
         value: metricsAverage.attendance,
         fill: "hsl(var(--chart-1))",
       },
       {
         name: "Assignments",
         value: metricsAverage.assignments,
         fill: "hsl(var(--chart-2))",
       },
       {
         name: "Participation",
         value: metricsAverage.participation,
         fill: "hsl(var(--chart-3))",
       },
     ];
   }, [metricsAverage]);
 
   const atRiskStudents = students.filter(
     (s) => s.latestPrediction?.engagement_level === "low"
   );
 
   return (
     <DashboardLayout>
       <div className="space-y-8">
         <div>
           <h1 className="text-3xl font-bold font-display text-foreground">
             Analytics
           </h1>
           <p className="text-muted-foreground mt-1">
             Insights and trends across all students
           </p>
         </div>
 
         {/* Overview Stats */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <StatCard
             title="Total Students"
             value={summary?.total ?? students.length}
             icon={Users}
             variant="primary"
           />
           <StatCard
             title="Average Score"
             value={`${summary?.averageScore?.toFixed(1) ?? 0}%`}
             icon={Target}
             variant="default"
           />
           <StatCard
             title="High Performers"
             value={summary?.high ?? 0}
             subtitle={`${
               summary?.total
                 ? ((summary.high / summary.total) * 100).toFixed(1)
                 : 0
             }% of total`}
             icon={TrendingUp}
             variant="success"
           />
           <StatCard
             title="At Risk"
             value={summary?.low ?? 0}
             subtitle="Need attention"
             icon={AlertTriangle}
             variant="danger"
           />
         </div>
 
         {/* Charts Row */}
         <div className="grid gap-6 lg:grid-cols-2">
           <EngagementDistribution summary={summary ?? null} />
 
           <Card>
             <CardHeader>
               <CardTitle className="font-display flex items-center gap-2">
                 <BarChart3 className="w-5 h-5 text-primary" />
                 Average Metrics
               </CardTitle>
               <CardDescription>
                 Class-wide averages across key metrics
               </CardDescription>
             </CardHeader>
             <CardContent>
               {metricsChartData.length > 0 ? (
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={metricsChartData} layout="vertical">
                       <CartesianGrid
                         strokeDasharray="3 3"
                         horizontal={true}
                         vertical={false}
                         className="stroke-border"
                       />
                       <XAxis
                         type="number"
                         domain={[0, 100]}
                         tick={{ fontSize: 12 }}
                         axisLine={false}
                         tickLine={false}
                         tickFormatter={(v) => `${v}%`}
                       />
                       <YAxis
                         dataKey="name"
                         type="category"
                         tick={{ fontSize: 12 }}
                         axisLine={false}
                         tickLine={false}
                         width={100}
                       />
                       <Tooltip
                         content={({ active, payload }) => {
                           if (!active || !payload?.length) return null;
                           const data = payload[0].payload;
                           return (
                             <div className="bg-popover border rounded-lg p-3 shadow-lg">
                               <p className="text-sm font-medium">{data.name}</p>
                               <p className="text-lg font-bold">
                                 {data.value.toFixed(1)}%
                               </p>
                             </div>
                           );
                         }}
                       />
                       <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                         {metricsChartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                         ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               ) : (
                 <div className="flex items-center justify-center py-12 text-muted-foreground">
                   No metrics data available yet
                 </div>
               )}
             </CardContent>
           </Card>
         </div>
 
         {/* At Risk Students */}
         {atRiskStudents.length > 0 && (
           <Card>
             <CardHeader>
               <CardTitle className="font-display flex items-center gap-2 text-destructive">
                 <AlertTriangle className="w-5 h-5" />
                 Students Requiring Attention
               </CardTitle>
               <CardDescription>
                 These students have low engagement and may need intervention
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                 {atRiskStudents.map((student) => (
                   <div
                     key={student.id}
                     className="flex items-center gap-3 p-4 rounded-lg border bg-destructive/5 border-destructive/20"
                   >
                     <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-bold">
                       {student.name.charAt(0)}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-medium truncate">{student.name}</p>
                       <p className="text-sm text-muted-foreground">
                         Score:{" "}
                         {student.latestPrediction?.engagement_score.toFixed(1)}%
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         )}
       </div>
     </DashboardLayout>
   );
 };
 
 export default Analytics;