 import { useState } from "react";
 import { useForm } from "react-hook-form";
 import { zodResolver } from "@hookform/resolvers/zod";
 import * as z from "zod";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Slider } from "@/components/ui/slider";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { useAddMetrics, usePredictEngagement } from "@/hooks/useStudents";
 import { Loader2, Sparkles, Clock, BookOpen, Users, MessageSquare, Trophy } from "lucide-react";
 
 const metricsSchema = z.object({
   attendance_rate: z.number().min(0).max(100),
   assignment_completion: z.number().min(0).max(100),
   participation_score: z.number().min(0).max(100),
   time_on_platform: z.number().min(0),
   forum_posts: z.number().min(0),
   quiz_average: z.number().min(0).max(100).optional(),
 });
 
 type MetricsFormData = z.infer<typeof metricsSchema>;
 
 interface MetricsFormProps {
   studentId: string;
   onSuccess?: () => void;
 }
 
 export function MetricsForm({ studentId, onSuccess }: MetricsFormProps) {
   const addMetrics = useAddMetrics();
   const predictEngagement = usePredictEngagement();
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   const {
     register,
     handleSubmit,
     watch,
     setValue,
     formState: { errors },
   } = useForm<MetricsFormData>({
     resolver: zodResolver(metricsSchema),
     defaultValues: {
       attendance_rate: 85,
       assignment_completion: 75,
       participation_score: 70,
       time_on_platform: 120,
       forum_posts: 5,
       quiz_average: 80,
     },
   });
 
   const watchedValues = watch();
 
   const onSubmit = async (data: MetricsFormData) => {
     setIsSubmitting(true);
     try {
       // Add metrics first
       await addMetrics.mutateAsync({
         student_id: studentId,
         attendance_rate: data.attendance_rate,
         assignment_completion: data.assignment_completion,
         participation_score: data.participation_score,
         time_on_platform: data.time_on_platform,
         forum_posts: data.forum_posts,
         quiz_average: data.quiz_average,
       });
 
       // Then run prediction
       await predictEngagement.mutateAsync({
         student_id: studentId,
         attendance_rate: data.attendance_rate,
         assignment_completion: data.assignment_completion,
         participation_score: data.participation_score,
         time_on_platform: data.time_on_platform,
         forum_posts: data.forum_posts,
         quiz_average: data.quiz_average ?? null,
       });
 
       onSuccess?.();
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const MetricSlider = ({
     label,
     name,
     icon: Icon,
     max = 100,
     suffix = "%",
     description,
   }: {
     label: string;
     name: keyof MetricsFormData;
     icon: React.ElementType;
     max?: number;
     suffix?: string;
     description?: string;
   }) => (
     <div className="space-y-3">
       <div className="flex items-center justify-between">
         <Label className="flex items-center gap-2 text-sm font-medium">
           <Icon className="w-4 h-4 text-muted-foreground" />
           {label}
         </Label>
         <span className="text-sm font-semibold text-primary">
           {watchedValues[name] ?? 0}{suffix}
         </span>
       </div>
       {description && (
         <p className="text-xs text-muted-foreground">{description}</p>
       )}
       <Slider
         value={[Number(watchedValues[name]) || 0]}
         onValueChange={([value]) => setValue(name, value)}
         max={max}
         step={1}
         className="cursor-pointer"
       />
       {errors[name] && (
         <p className="text-sm text-destructive">{errors[name]?.message}</p>
       )}
     </div>
   );
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="font-display flex items-center gap-2">
           <Sparkles className="w-5 h-5 text-primary" />
           Update Engagement Metrics
         </CardTitle>
         <CardDescription>
           Enter the student's current metrics to generate an engagement prediction.
         </CardDescription>
       </CardHeader>
       <CardContent>
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
           <div className="grid gap-6 md:grid-cols-2">
             <MetricSlider
               label="Attendance Rate"
               name="attendance_rate"
               icon={Users}
               description="Percentage of classes attended"
             />
 
             <MetricSlider
               label="Assignment Completion"
               name="assignment_completion"
               icon={BookOpen}
               description="Percentage of assignments submitted"
             />
 
             <MetricSlider
               label="Participation Score"
               name="participation_score"
               icon={MessageSquare}
               description="Active engagement in discussions"
             />
 
             <MetricSlider
               label="Quiz Average"
               name="quiz_average"
               icon={Trophy}
               description="Average score across quizzes"
             />
           </div>
 
           <div className="grid gap-6 md:grid-cols-2">
             <div className="space-y-2">
               <Label className="flex items-center gap-2 text-sm font-medium">
                 <Clock className="w-4 h-4 text-muted-foreground" />
                 Time on Platform (minutes/week)
               </Label>
               <Input
                 type="number"
                 min={0}
                 {...register("time_on_platform", { valueAsNumber: true })}
                 className={errors.time_on_platform ? "border-destructive" : ""}
               />
               {errors.time_on_platform && (
                 <p className="text-sm text-destructive">
                   {errors.time_on_platform.message}
                 </p>
               )}
             </div>
 
             <div className="space-y-2">
               <Label className="flex items-center gap-2 text-sm font-medium">
                 <MessageSquare className="w-4 h-4 text-muted-foreground" />
                 Forum Posts
               </Label>
               <Input
                 type="number"
                 min={0}
                 {...register("forum_posts", { valueAsNumber: true })}
                 className={errors.forum_posts ? "border-destructive" : ""}
               />
               {errors.forum_posts && (
                 <p className="text-sm text-destructive">
                   {errors.forum_posts.message}
                 </p>
               )}
             </div>
           </div>
 
           <Button
             type="submit"
             className="w-full gap-2"
             size="lg"
             disabled={isSubmitting}
           >
             {isSubmitting ? (
               <Loader2 className="w-4 h-4 animate-spin" />
             ) : (
               <Sparkles className="w-4 h-4" />
             )}
             {isSubmitting ? "Generating Prediction..." : "Submit & Predict Engagement"}
           </Button>
         </form>
       </CardContent>
     </Card>
   );
 }