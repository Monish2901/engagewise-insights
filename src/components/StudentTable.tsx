 import { useState } from "react";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { Input } from "@/components/ui/input";
 import { Button } from "@/components/ui/button";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { EngagementBadge } from "@/components/EngagementBadge";
 import { StudentWithData } from "@/hooks/useStudents";
 import { Search, ArrowUpDown, Eye, Trash2 } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 
 interface StudentTableProps {
   students: StudentWithData[];
   onDelete?: (id: string) => void;
   isLoading?: boolean;
 }
 
 type SortField = "name" | "engagement" | "attendance" | "updated";
 type SortDirection = "asc" | "desc";
 type EngagementFilter = "all" | "high" | "medium" | "low";
 
 export function StudentTable({
   students,
   onDelete,
   isLoading,
 }: StudentTableProps) {
   const navigate = useNavigate();
   const [search, setSearch] = useState("");
   const [sortField, setSortField] = useState<SortField>("name");
   const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
   const [engagementFilter, setEngagementFilter] =
     useState<EngagementFilter>("all");
 
   const filteredStudents = students
     .filter((student) => {
       const matchesSearch =
         student.name.toLowerCase().includes(search.toLowerCase()) ||
         student.email.toLowerCase().includes(search.toLowerCase()) ||
         student.student_id?.toLowerCase().includes(search.toLowerCase());
 
       const matchesEngagement =
         engagementFilter === "all" ||
         student.latestPrediction?.engagement_level === engagementFilter;
 
       return matchesSearch && matchesEngagement;
     })
     .sort((a, b) => {
       let comparison = 0;
 
       switch (sortField) {
         case "name":
           comparison = a.name.localeCompare(b.name);
           break;
         case "engagement":
           const scoreA = a.latestPrediction?.engagement_score ?? 0;
           const scoreB = b.latestPrediction?.engagement_score ?? 0;
           comparison = scoreA - scoreB;
           break;
         case "attendance":
           const attendA = a.latestMetrics?.attendance_rate ?? 0;
           const attendB = b.latestMetrics?.attendance_rate ?? 0;
           comparison = attendA - attendB;
           break;
         case "updated":
           comparison =
             new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
           break;
       }
 
       return sortDirection === "asc" ? comparison : -comparison;
     });
 
   const toggleSort = (field: SortField) => {
     if (sortField === field) {
       setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
     } else {
       setSortField(field);
       setSortDirection("asc");
     }
   };
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center py-12">
         <div className="animate-pulse text-muted-foreground">
           Loading students...
         </div>
       </div>
     );
   }
 
   return (
     <div className="space-y-4">
       <div className="flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder="Search students..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="pl-10"
           />
         </div>
         <Select
           value={engagementFilter}
           onValueChange={(v) => setEngagementFilter(v as EngagementFilter)}
         >
           <SelectTrigger className="w-full sm:w-48">
             <SelectValue placeholder="Filter by engagement" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All Levels</SelectItem>
             <SelectItem value="high">High Engagement</SelectItem>
             <SelectItem value="medium">Medium Engagement</SelectItem>
             <SelectItem value="low">Low Engagement</SelectItem>
           </SelectContent>
         </Select>
       </div>
 
       <div className="rounded-xl border bg-card overflow-hidden">
         <Table>
           <TableHeader>
             <TableRow className="bg-muted/50">
               <TableHead>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => toggleSort("name")}
                   className="gap-1 font-semibold"
                 >
                   Student
                   <ArrowUpDown className="w-3 h-3" />
                 </Button>
               </TableHead>
               <TableHead>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => toggleSort("engagement")}
                   className="gap-1 font-semibold"
                 >
                   Engagement
                   <ArrowUpDown className="w-3 h-3" />
                 </Button>
               </TableHead>
               <TableHead className="hidden md:table-cell">
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => toggleSort("attendance")}
                   className="gap-1 font-semibold"
                 >
                   Attendance
                   <ArrowUpDown className="w-3 h-3" />
                 </Button>
               </TableHead>
               <TableHead className="hidden lg:table-cell">Assignments</TableHead>
               <TableHead className="hidden lg:table-cell">Participation</TableHead>
               <TableHead className="text-right">Actions</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {filteredStudents.length === 0 ? (
               <TableRow>
                 <TableCell
                   colSpan={6}
                   className="text-center py-12 text-muted-foreground"
                 >
                   {search || engagementFilter !== "all"
                     ? "No students match your filters"
                     : "No students yet. Add your first student to get started."}
                 </TableCell>
               </TableRow>
             ) : (
               filteredStudents.map((student) => (
                 <TableRow
                   key={student.id}
                   className="data-table-row cursor-pointer"
                   onClick={() => navigate(`/student/${student.id}`)}
                 >
                   <TableCell>
                     <div>
                       <p className="font-medium text-foreground">
                         {student.name}
                       </p>
                       <p className="text-sm text-muted-foreground">
                         {student.email}
                       </p>
                       {student.student_id && (
                         <p className="text-xs text-muted-foreground">
                           ID: {student.student_id}
                         </p>
                       )}
                     </div>
                   </TableCell>
                   <TableCell>
                     {student.latestPrediction ? (
                       <EngagementBadge
                         level={student.latestPrediction.engagement_level}
                         score={student.latestPrediction.engagement_score}
                         showScore
                       />
                     ) : (
                       <span className="text-sm text-muted-foreground italic">
                         No prediction
                       </span>
                     )}
                   </TableCell>
                   <TableCell className="hidden md:table-cell">
                     {student.latestMetrics ? (
                       <span className="font-medium">
                         {student.latestMetrics.attendance_rate.toFixed(1)}%
                       </span>
                     ) : (
                       <span className="text-muted-foreground">-</span>
                     )}
                   </TableCell>
                   <TableCell className="hidden lg:table-cell">
                     {student.latestMetrics ? (
                       <span className="font-medium">
                         {student.latestMetrics.assignment_completion.toFixed(1)}%
                       </span>
                     ) : (
                       <span className="text-muted-foreground">-</span>
                     )}
                   </TableCell>
                   <TableCell className="hidden lg:table-cell">
                     {student.latestMetrics ? (
                       <span className="font-medium">
                         {student.latestMetrics.participation_score.toFixed(1)}%
                       </span>
                     ) : (
                       <span className="text-muted-foreground">-</span>
                     )}
                   </TableCell>
                   <TableCell className="text-right">
                     <div className="flex items-center justify-end gap-2">
                       <Button
                         size="icon"
                         variant="ghost"
                         onClick={(e) => {
                           e.stopPropagation();
                           navigate(`/student/${student.id}`);
                         }}
                       >
                         <Eye className="w-4 h-4" />
                       </Button>
                       {onDelete && (
                         <Button
                           size="icon"
                           variant="ghost"
                           className="text-destructive hover:text-destructive"
                           onClick={(e) => {
                             e.stopPropagation();
                             onDelete(student.id);
                           }}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       )}
                     </div>
                   </TableCell>
                 </TableRow>
               ))
             )}
           </TableBody>
         </Table>
       </div>
 
       <p className="text-sm text-muted-foreground">
         Showing {filteredStudents.length} of {students.length} students
       </p>
     </div>
   );
 }