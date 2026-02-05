 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 interface MetricsInput {
   student_id: string;
   attendance_rate: number;
   assignment_completion: number;
   participation_score: number;
   time_on_platform: number;
   forum_posts: number;
   quiz_average: number | null;
 }
 
 interface PredictionResult {
   engagement_score: number;
   engagement_level: "high" | "medium" | "low";
   confidence: number;
   factors: {
     attendance_impact: number;
     assignment_impact: number;
     participation_impact: number;
     time_impact: number;
     activity_impact: number;
     performance_impact: number;
   };
 }
 
 function calculateEngagement(metrics: MetricsInput): PredictionResult {
   // Weighted engagement prediction algorithm
   const weights = {
     attendance: 0.25,
     assignment: 0.25,
     participation: 0.20,
     time: 0.10,
     activity: 0.10,
     performance: 0.10,
   };
 
   // Normalize time on platform (assume 300 mins/week is optimal)
   const normalizedTime = Math.min(metrics.time_on_platform / 300, 1) * 100;
 
   // Normalize forum posts (assume 10 posts is excellent)
   const normalizedActivity = Math.min(metrics.forum_posts / 10, 1) * 100;
 
   // Calculate weighted scores
   const attendanceImpact = metrics.attendance_rate * weights.attendance;
   const assignmentImpact = metrics.assignment_completion * weights.assignment;
   const participationImpact = metrics.participation_score * weights.participation;
   const timeImpact = normalizedTime * weights.time;
   const activityImpact = normalizedActivity * weights.activity;
   const performanceImpact = (metrics.quiz_average ?? 70) * weights.performance;
 
   // Calculate total engagement score
   const engagementScore =
     attendanceImpact +
     assignmentImpact +
     participationImpact +
     timeImpact +
     activityImpact +
     performanceImpact;
 
   // Determine engagement level
   let engagementLevel: "high" | "medium" | "low";
   if (engagementScore >= 70) {
     engagementLevel = "high";
   } else if (engagementScore >= 45) {
     engagementLevel = "medium";
   } else {
     engagementLevel = "low";
   }
 
   // Calculate confidence based on data completeness
   let dataPoints = 5;
   if (metrics.quiz_average !== null) dataPoints++;
   const confidence = (dataPoints / 6) * 100;
 
   return {
     engagement_score: Math.round(engagementScore * 100) / 100,
     engagement_level: engagementLevel,
     confidence: Math.round(confidence * 100) / 100,
     factors: {
       attendance_impact: Math.round(attendanceImpact * 100) / 100,
       assignment_impact: Math.round(assignmentImpact * 100) / 100,
       participation_impact: Math.round(participationImpact * 100) / 100,
       time_impact: Math.round(timeImpact * 100) / 100,
       activity_impact: Math.round(activityImpact * 100) / 100,
       performance_impact: Math.round(performanceImpact * 100) / 100,
     },
   };
 }
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response("ok", { headers: corsHeaders });
   }
 
   try {
     const supabaseUrl = Deno.env.get("SUPABASE_URL");
     const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 
     if (!supabaseUrl || !supabaseKey) {
       throw new Error("Missing Supabase configuration");
     }
 
     const supabase = createClient(supabaseUrl, supabaseKey);
 
     const { action, data } = await req.json();
     console.log("Received action:", action, "with data:", JSON.stringify(data));
 
     switch (action) {
       case "predict": {
         // Predict engagement for a single student
         const metrics: MetricsInput = data;
         const prediction = calculateEngagement(metrics);
 
         // Store the prediction in the database
         const { error: insertError } = await supabase
           .from("predictions")
           .insert({
             student_id: metrics.student_id,
             engagement_score: prediction.engagement_score,
             engagement_level: prediction.engagement_level,
             confidence: prediction.confidence,
             factors: prediction.factors,
           });
 
         if (insertError) {
           console.error("Error storing prediction:", insertError);
           throw new Error(`Failed to store prediction: ${insertError.message}`);
         }
 
         console.log("Prediction stored successfully:", prediction);
 
         return new Response(JSON.stringify({ success: true, prediction }), {
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
 
       case "predict-batch": {
         // Predict engagement for multiple students
         const metricsArray: MetricsInput[] = data.metrics;
         const predictions = [];
 
         for (const metrics of metricsArray) {
           const prediction = calculateEngagement(metrics);
           predictions.push({
             student_id: metrics.student_id,
             ...prediction,
           });
 
           // Store each prediction
           await supabase.from("predictions").insert({
             student_id: metrics.student_id,
             engagement_score: prediction.engagement_score,
             engagement_level: prediction.engagement_level,
             confidence: prediction.confidence,
             factors: prediction.factors,
           });
         }
 
         console.log(`Batch prediction completed for ${predictions.length} students`);
 
         return new Response(JSON.stringify({ success: true, predictions }), {
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
 
       case "get-trends": {
         // Get engagement trends for a student
         const { student_id, limit = 10 } = data;
 
         const { data: trends, error } = await supabase
           .from("predictions")
           .select("*")
           .eq("student_id", student_id)
           .order("predicted_at", { ascending: false })
           .limit(limit);
 
         if (error) {
           throw new Error(`Failed to fetch trends: ${error.message}`);
         }
 
         return new Response(JSON.stringify({ success: true, trends }), {
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
 
       case "get-summary": {
         // Get engagement summary statistics
         const { data: predictions, error } = await supabase
           .from("predictions")
           .select("engagement_level, engagement_score")
           .order("predicted_at", { ascending: false });
 
         if (error) {
           throw new Error(`Failed to fetch summary: ${error.message}`);
         }
 
         // Get unique latest predictions per student
         const latestByStudent = new Map();
         const { data: latestPredictions } = await supabase
           .from("predictions")
           .select("student_id, engagement_level, engagement_score, predicted_at")
           .order("predicted_at", { ascending: false });
 
         if (latestPredictions) {
           for (const p of latestPredictions) {
             if (!latestByStudent.has(p.student_id)) {
               latestByStudent.set(p.student_id, p);
             }
           }
         }
 
         const uniquePredictions = Array.from(latestByStudent.values());
 
         const summary = {
           total: uniquePredictions.length,
           high: uniquePredictions.filter((p) => p.engagement_level === "high").length,
           medium: uniquePredictions.filter((p) => p.engagement_level === "medium").length,
           low: uniquePredictions.filter((p) => p.engagement_level === "low").length,
           averageScore:
             uniquePredictions.length > 0
               ? Math.round(
                   (uniquePredictions.reduce((sum, p) => sum + p.engagement_score, 0) /
                     uniquePredictions.length) *
                     100
                 ) / 100
               : 0,
         };
 
         return new Response(JSON.stringify({ success: true, summary }), {
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
 
       default:
         throw new Error(`Unknown action: ${action}`);
     }
   } catch (error) {
     console.error("Error in predict-engagement function:", error);
     return new Response(
       JSON.stringify({
         success: false,
         error: error instanceof Error ? error.message : "Unknown error",
       }),
       {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   }
 });