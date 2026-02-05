 import { useParams, useNavigate } from "react-router-dom";
 import { DashboardLayout } from "@/components/DashboardLayout";
 import { MetricsForm } from "@/components/MetricsForm";
 import { EngagementChart } from "@/components/EngagementChart";
 import { EngagementGauge } from "@/components/EngagementGauge";
 import { FactorsBreakdown } from "@/components/FactorsBreakdown";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Skeleton } from "@/components/ui/skeleton";
 import { useStudent, useStudentPredictions } from "@/hooks/useStudents";
 import { ArrowLeft, Mail, Hash, GraduationCap, Calendar, Info } from "lucide-react";
 import { format } from "date-fns";
 
 const StudentDetail = () => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const { data: student, isLoading } = useStudent(id);
   const { data: predictions = [] } = useStudentPredictions(id);
 
   if (isLoading) {
     return (
       <DashboardLayout>
         <div className="space-y-8">
           <Skeleton className="h-10 w-48" />
           <div className="grid gap-6 lg:grid-cols-3">
             <Skeleton className="h-64" />
             <Skeleton className="h-64 lg:col-span-2" />
           </div>
         </div>
       </DashboardLayout>
     );
   }
 
   if (!student) {
     return (
       <DashboardLayout>
         <div className="flex flex-col items-center justify-center py-16 text-center">
           <Info className="w-12 h-12 text-muted-foreground mb-4" />
           <h2 className="text-xl font-semibold">Student Not Found</h2>
           <p className="text-muted-foreground mt-2">
             The student you're looking for doesn't exist.
           </p>
           <Button className="mt-4" onClick={() => navigate("/students")}>
             Back to Students
           </Button>
         </div>
       </DashboardLayout>
     );
   }
 
   return (
     <DashboardLayout>
       <div className="space-y-8">
         {/* Header */}
         <div className="flex items-start gap-4">
           <Button
             variant="outline"
             size="icon"
             onClick={() => navigate(-1)}
             className="shrink-0"
           >
             <ArrowLeft className="w-4 h-4" />
           </Button>
           <div className="flex-1">
             <h1 className="text-3xl font-bold font-display text-foreground">
               {student.name}
             </h1>
             <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
               <span className="flex items-center gap-1">
                 <Mail className="w-4 h-4" />
                 {student.email}
               </span>
               {student.student_id && (
                 <span className="flex items-center gap-1">
                   <Hash className="w-4 h-4" />
                   {student.student_id}
                 </span>
               )}
               {student.grade_level && (
                 <span className="flex items-center gap-1 capitalize">
                   <GraduationCap className="w-4 h-4" />
                   {student.grade_level}
                 </span>
               )}
               <span className="flex items-center gap-1">
                 <Calendar className="w-4 h-4" />
                 Added {format(new Date(student.created_at), "MMM d, yyyy")}
               </span>
             </div>
           </div>
         </div>
 
         {/* Current Engagement */}
         {student.latestPrediction && (
           <div className="grid gap-6 lg:grid-cols-3">
             <Card className="flex flex-col items-center justify-center py-8">
               <CardHeader className="text-center pb-2">
                 <CardTitle className="font-display">Current Engagement</CardTitle>
                 <CardDescription>
                   Last updated{" "}
                   {format(
                     new Date(student.latestPrediction.predicted_at),
                     "MMM d, yyyy 'at' HH:mm"
                   )}
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <EngagementGauge
                   score={student.latestPrediction.engagement_score}
                   level={student.latestPrediction.engagement_level}
                   size="lg"
                 />
                 <div className="mt-4 text-center">
                   <p className="text-sm text-muted-foreground">
                     Confidence: {student.latestPrediction.confidence?.toFixed(1) ?? 0}%
                   </p>
                 </div>
               </CardContent>
             </Card>
 
             <div className="lg:col-span-2">
               <FactorsBreakdown factors={student.latestPrediction.factors} />
             </div>
           </div>
         )}
 
         {/* Charts */}
         <EngagementChart predictions={predictions} />
 
         {/* Metrics Form */}
         <MetricsForm studentId={student.id} />
       </div>
     </DashboardLayout>
   );
 };
 
 export default StudentDetail;