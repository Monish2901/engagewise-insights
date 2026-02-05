 import { DashboardLayout } from "@/components/DashboardLayout";
 import { StatCard } from "@/components/StatCard";
 import { StudentTable } from "@/components/StudentTable";
 import { AddStudentDialog } from "@/components/AddStudentDialog";
 import { EngagementDistribution } from "@/components/EngagementDistribution";
 import {
   useStudents,
   useDeleteStudent,
   useEngagementSummary,
 } from "@/hooks/useStudents";
 import {
   Users,
   TrendingUp,
   TrendingDown,
   Activity,
   AlertTriangle,
 } from "lucide-react";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from "@/components/ui/alert-dialog";
 import { useState } from "react";
 
 const Index = () => {
   const { data: students = [], isLoading: studentsLoading } = useStudents();
   const { data: summary } = useEngagementSummary();
   const deleteStudent = useDeleteStudent();
   const [deleteId, setDeleteId] = useState<string | null>(null);
 
   const handleDelete = (id: string) => {
     setDeleteId(id);
   };
 
   const confirmDelete = async () => {
     if (deleteId) {
       await deleteStudent.mutateAsync(deleteId);
       setDeleteId(null);
     }
   };
 
   return (
     <DashboardLayout>
       <div className="space-y-8">
         {/* Header */}
         <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
           <div>
             <h1 className="text-3xl font-bold font-display text-foreground">
               Dashboard
             </h1>
             <p className="text-muted-foreground mt-1">
               Monitor and predict student engagement in real-time
             </p>
           </div>
           <AddStudentDialog />
         </div>
 
         {/* Stats Grid */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <StatCard
             title="Total Students"
             value={summary?.total ?? students.length}
             subtitle="Active in system"
             icon={Users}
             variant="primary"
           />
           <StatCard
             title="High Engagement"
             value={summary?.high ?? 0}
             subtitle="Students performing well"
             icon={TrendingUp}
             variant="success"
           />
           <StatCard
             title="Medium Engagement"
             value={summary?.medium ?? 0}
             subtitle="Students at risk"
             icon={Activity}
             variant="warning"
           />
           <StatCard
             title="Low Engagement"
             value={summary?.low ?? 0}
             subtitle="Need immediate attention"
             icon={TrendingDown}
             variant="danger"
           />
         </div>
 
         {/* Charts and Table */}
         <div className="grid gap-6 lg:grid-cols-3">
           <div className="lg:col-span-2">
             <div className="space-y-2">
               <h2 className="text-xl font-semibold font-display text-foreground">
                 Recent Students
               </h2>
               <p className="text-sm text-muted-foreground">
                 Click on a student to view details and manage their engagement
                 metrics
               </p>
             </div>
             <div className="mt-4">
               <StudentTable
                 students={students.slice(0, 10)}
                 onDelete={handleDelete}
                 isLoading={studentsLoading}
               />
             </div>
           </div>
           <div>
             <EngagementDistribution summary={summary ?? null} />
           </div>
         </div>
       </div>
 
       {/* Delete Confirmation */}
       <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle className="flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-destructive" />
               Delete Student
             </AlertDialogTitle>
             <AlertDialogDescription>
               This action cannot be undone. This will permanently delete the
               student and all their associated metrics and predictions.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Cancel</AlertDialogCancel>
             <AlertDialogAction
               onClick={confirmDelete}
               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
             >
               Delete
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </DashboardLayout>
   );
 };
 
 export default Index;
