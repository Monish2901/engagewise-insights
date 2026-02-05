 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Progress } from "@/components/ui/progress";
 import { BarChart3, Users, BookOpen, MessageSquare, Clock, Activity, Trophy } from "lucide-react";
 
 interface FactorsBreakdownProps {
   factors: Record<string, number> | null;
 }
 
 export function FactorsBreakdown({ factors }: FactorsBreakdownProps) {
   if (!factors) {
     return null;
   }
 
   const factorConfig = [
     {
       key: "attendance_impact",
       label: "Attendance",
       icon: Users,
       maxWeight: 25,
     },
     {
       key: "assignment_impact",
       label: "Assignments",
       icon: BookOpen,
       maxWeight: 25,
     },
     {
       key: "participation_impact",
       label: "Participation",
       icon: MessageSquare,
       maxWeight: 20,
     },
     {
       key: "time_impact",
       label: "Platform Time",
       icon: Clock,
       maxWeight: 10,
     },
     {
       key: "activity_impact",
       label: "Forum Activity",
       icon: Activity,
       maxWeight: 10,
     },
     {
       key: "performance_impact",
       label: "Quiz Performance",
       icon: Trophy,
       maxWeight: 10,
     },
   ];
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="font-display flex items-center gap-2">
           <BarChart3 className="w-5 h-5 text-primary" />
           Engagement Factors
         </CardTitle>
         <CardDescription>
           Breakdown of factors contributing to the engagement score
         </CardDescription>
       </CardHeader>
       <CardContent className="space-y-4">
         {factorConfig.map(({ key, label, icon: Icon, maxWeight }) => {
           const value = factors[key] ?? 0;
           const percentage = (value / maxWeight) * 100;
 
           return (
             <div key={key} className="space-y-2">
               <div className="flex items-center justify-between text-sm">
                 <span className="flex items-center gap-2 font-medium">
                   <Icon className="w-4 h-4 text-muted-foreground" />
                   {label}
                 </span>
                 <span className="text-muted-foreground">
                   {value.toFixed(1)} / {maxWeight}
                 </span>
               </div>
               <Progress value={percentage} className="h-2" />
             </div>
           );
         })}
       </CardContent>
     </Card>
   );
 }