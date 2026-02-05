 import { DashboardLayout } from "@/components/DashboardLayout";
 import { StudentTable } from "@/components/StudentTable";
 import { AddStudentDialog } from "@/components/AddStudentDialog";
 import { useStudents, useDeleteStudent } from "@/hooks/useStudents";
 import { AlertTriangle } from "lucide-react";
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
 
 const Students = () => {
   const { data: students = [], isLoading } = useStudents();
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
         <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
           <div>
             <h1 className="text-3xl font-bold font-display text-foreground">
               Students
             </h1>
             <p className="text-muted-foreground mt-1">
               Manage all students and their engagement data
             </p>
           </div>
           <AddStudentDialog />
         </div>
 
         <StudentTable
           students={students}
           onDelete={handleDelete}
           isLoading={isLoading}
         />
       </div>
 
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
 
 export default Students;