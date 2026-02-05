 import { useState } from "react";
 import { useForm } from "react-hook-form";
 import { zodResolver } from "@hookform/resolvers/zod";
 import * as z from "zod";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { useCreateStudent } from "@/hooks/useStudents";
 import { UserPlus, Loader2 } from "lucide-react";
 
 const studentSchema = z.object({
   name: z.string().min(2, "Name must be at least 2 characters"),
   email: z.string().email("Invalid email address"),
   student_id: z.string().optional(),
   grade_level: z.string().optional(),
 });
 
 type StudentFormData = z.infer<typeof studentSchema>;
 
 interface AddStudentDialogProps {
   children?: React.ReactNode;
 }
 
 export function AddStudentDialog({ children }: AddStudentDialogProps) {
   const [open, setOpen] = useState(false);
   const createStudent = useCreateStudent();
 
   const {
     register,
     handleSubmit,
     reset,
     setValue,
     formState: { errors },
   } = useForm<StudentFormData>({
     resolver: zodResolver(studentSchema),
   });
 
   const onSubmit = async (data: StudentFormData) => {
     await createStudent.mutateAsync({
       name: data.name,
       email: data.email,
       student_id: data.student_id || undefined,
       grade_level: data.grade_level || undefined,
     });
     reset();
     setOpen(false);
   };
 
   return (
     <Dialog open={open} onOpenChange={setOpen}>
       <DialogTrigger asChild>
         {children || (
           <Button className="gap-2">
             <UserPlus className="w-4 h-4" />
             Add Student
           </Button>
         )}
       </DialogTrigger>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle className="font-display">Add New Student</DialogTitle>
           <DialogDescription>
             Enter student information to start tracking their engagement.
           </DialogDescription>
         </DialogHeader>
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           <div className="space-y-2">
             <Label htmlFor="name">Full Name *</Label>
             <Input
               id="name"
               placeholder="John Doe"
               {...register("name")}
               className={errors.name ? "border-destructive" : ""}
             />
             {errors.name && (
               <p className="text-sm text-destructive">{errors.name.message}</p>
             )}
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="email">Email Address *</Label>
             <Input
               id="email"
               type="email"
               placeholder="john.doe@school.edu"
               {...register("email")}
               className={errors.email ? "border-destructive" : ""}
             />
             {errors.email && (
               <p className="text-sm text-destructive">{errors.email.message}</p>
             )}
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="student_id">Student ID</Label>
             <Input
               id="student_id"
               placeholder="STU-001"
               {...register("student_id")}
             />
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="grade_level">Grade Level</Label>
             <Select onValueChange={(value) => setValue("grade_level", value)}>
               <SelectTrigger>
                 <SelectValue placeholder="Select grade" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="freshman">Freshman</SelectItem>
                 <SelectItem value="sophomore">Sophomore</SelectItem>
                 <SelectItem value="junior">Junior</SelectItem>
                 <SelectItem value="senior">Senior</SelectItem>
                 <SelectItem value="graduate">Graduate</SelectItem>
               </SelectContent>
             </Select>
           </div>
 
           <DialogFooter className="pt-4">
             <Button
               type="button"
               variant="outline"
               onClick={() => setOpen(false)}
             >
               Cancel
             </Button>
             <Button type="submit" disabled={createStudent.isPending}>
               {createStudent.isPending && (
                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
               )}
               Add Student
             </Button>
           </DialogFooter>
         </form>
       </DialogContent>
     </Dialog>
   );
 }