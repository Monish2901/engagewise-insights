 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 export interface Student {
   id: string;
   name: string;
   email: string;
   student_id: string | null;
   grade_level: string | null;
   created_at: string;
   updated_at: string;
 }
 
 export interface StudentMetrics {
   id: string;
   student_id: string;
   attendance_rate: number;
   assignment_completion: number;
   participation_score: number;
   time_on_platform: number;
   forum_posts: number;
   quiz_average: number | null;
   recorded_at: string;
 }
 
 export interface Prediction {
   id: string;
   student_id: string;
   engagement_score: number;
   engagement_level: "high" | "medium" | "low";
   confidence: number;
   factors: Record<string, number> | null;
   predicted_at: string;
 }
 
 export interface StudentWithData extends Student {
   latestMetrics?: StudentMetrics;
   latestPrediction?: Prediction;
 }
 
 export function useStudents() {
   return useQuery({
     queryKey: ["students"],
     queryFn: async (): Promise<StudentWithData[]> => {
       const { data: students, error } = await supabase
         .from("students")
         .select("*")
         .order("created_at", { ascending: false });
 
       if (error) throw error;
 
       // Fetch latest metrics and predictions for each student
       const studentsWithData = await Promise.all(
         (students || []).map(async (student) => {
           const { data: metrics } = await supabase
             .from("student_metrics")
             .select("*")
             .eq("student_id", student.id)
             .order("recorded_at", { ascending: false })
             .limit(1)
             .maybeSingle();
 
           const { data: prediction } = await supabase
             .from("predictions")
             .select("*")
             .eq("student_id", student.id)
             .order("predicted_at", { ascending: false })
             .limit(1)
             .maybeSingle();
 
           return {
             ...student,
             latestMetrics: metrics || undefined,
             latestPrediction: prediction ? {
               ...prediction,
               engagement_level: prediction.engagement_level as "high" | "medium" | "low",
               factors: prediction.factors as Record<string, number> | null,
             } : undefined,
           };
         })
       );
 
       return studentsWithData;
     },
   });
 }
 
 export function useStudent(studentId: string | undefined) {
   return useQuery({
     queryKey: ["student", studentId],
     queryFn: async (): Promise<StudentWithData | null> => {
       if (!studentId) return null;
 
       const { data: student, error } = await supabase
         .from("students")
         .select("*")
         .eq("id", studentId)
         .maybeSingle();
 
       if (error) throw error;
       if (!student) return null;
 
       const { data: metrics } = await supabase
         .from("student_metrics")
         .select("*")
         .eq("student_id", student.id)
         .order("recorded_at", { ascending: false })
         .limit(1)
         .maybeSingle();
 
       const { data: prediction } = await supabase
         .from("predictions")
         .select("*")
         .eq("student_id", student.id)
         .order("predicted_at", { ascending: false })
         .limit(1)
         .maybeSingle();
 
       return {
         ...student,
         latestMetrics: metrics || undefined,
         latestPrediction: prediction ? {
           ...prediction,
           engagement_level: prediction.engagement_level as "high" | "medium" | "low",
           factors: prediction.factors as Record<string, number> | null,
         } : undefined,
       };
     },
     enabled: !!studentId,
   });
 }
 
 export function useStudentPredictions(studentId: string | undefined) {
   return useQuery({
     queryKey: ["predictions", studentId],
     queryFn: async (): Promise<Prediction[]> => {
       if (!studentId) return [];
 
       const { data, error } = await supabase
         .from("predictions")
         .select("*")
         .eq("student_id", studentId)
         .order("predicted_at", { ascending: true })
         .limit(20);
 
       if (error) throw error;
 
       return (data || []).map(p => ({
         ...p,
         engagement_level: p.engagement_level as "high" | "medium" | "low",
         factors: p.factors as Record<string, number> | null,
       }));
     },
     enabled: !!studentId,
   });
 }
 
 export function useCreateStudent() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (data: {
       name: string;
       email: string;
       student_id?: string;
       grade_level?: string;
     }) => {
       const { data: student, error } = await supabase
         .from("students")
         .insert(data)
         .select()
         .single();
 
       if (error) throw error;
       return student;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["students"] });
       toast.success("Student created successfully");
     },
     onError: (error) => {
       toast.error(`Failed to create student: ${error.message}`);
     },
   });
 }
 
 export function useUpdateStudent() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async ({
       id,
       ...data
     }: {
       id: string;
       name?: string;
       email?: string;
       student_id?: string;
       grade_level?: string;
     }) => {
       const { data: student, error } = await supabase
         .from("students")
         .update(data)
         .eq("id", id)
         .select()
         .single();
 
       if (error) throw error;
       return student;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["students"] });
       toast.success("Student updated successfully");
     },
     onError: (error) => {
       toast.error(`Failed to update student: ${error.message}`);
     },
   });
 }
 
 export function useDeleteStudent() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase.from("students").delete().eq("id", id);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["students"] });
       toast.success("Student deleted successfully");
     },
     onError: (error) => {
       toast.error(`Failed to delete student: ${error.message}`);
     },
   });
 }
 
 export function useAddMetrics() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (data: {
       student_id: string;
       attendance_rate: number;
       assignment_completion: number;
       participation_score: number;
       time_on_platform: number;
       forum_posts: number;
       quiz_average?: number;
     }) => {
       const { data: metrics, error } = await supabase
         .from("student_metrics")
         .insert(data)
         .select()
         .single();
 
       if (error) throw error;
       return metrics;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["students"] });
       queryClient.invalidateQueries({ queryKey: ["student"] });
     },
     onError: (error) => {
       toast.error(`Failed to add metrics: ${error.message}`);
     },
   });
 }
 
 export function usePredictEngagement() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (metrics: {
       student_id: string;
       attendance_rate: number;
       assignment_completion: number;
       participation_score: number;
       time_on_platform: number;
       forum_posts: number;
       quiz_average: number | null;
     }) => {
       const { data, error } = await supabase.functions.invoke(
         "predict-engagement",
         {
           body: { action: "predict", data: metrics },
         }
       );
 
       if (error) throw error;
       if (!data.success) throw new Error(data.error);
       return data.prediction;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["students"] });
       queryClient.invalidateQueries({ queryKey: ["student"] });
       queryClient.invalidateQueries({ queryKey: ["predictions"] });
       queryClient.invalidateQueries({ queryKey: ["engagement-summary"] });
       toast.success("Engagement prediction completed");
     },
     onError: (error) => {
       toast.error(`Prediction failed: ${error.message}`);
     },
   });
 }
 
 export function useEngagementSummary() {
   return useQuery({
     queryKey: ["engagement-summary"],
     queryFn: async () => {
       const { data, error } = await supabase.functions.invoke(
         "predict-engagement",
         {
           body: { action: "get-summary", data: {} },
         }
       );
 
       if (error) throw error;
       if (!data.success) throw new Error(data.error);
       return data.summary as {
         total: number;
         high: number;
         medium: number;
         low: number;
         averageScore: number;
       };
     },
   });
 }