-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  student_id TEXT UNIQUE,
  grade_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_metrics table for tracking engagement data
CREATE TABLE public.student_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  attendance_rate NUMERIC(5,2) NOT NULL CHECK (attendance_rate >= 0 AND attendance_rate <= 100),
  assignment_completion NUMERIC(5,2) NOT NULL CHECK (assignment_completion >= 0 AND assignment_completion <= 100),
  participation_score NUMERIC(5,2) NOT NULL CHECK (participation_score >= 0 AND participation_score <= 100),
  time_on_platform INTEGER NOT NULL DEFAULT 0, -- minutes
  forum_posts INTEGER NOT NULL DEFAULT 0,
  quiz_average NUMERIC(5,2) CHECK (quiz_average >= 0 AND quiz_average <= 100),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create predictions table for storing engagement predictions
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  engagement_score NUMERIC(5,2) NOT NULL CHECK (engagement_score >= 0 AND engagement_score <= 100),
  engagement_level TEXT NOT NULL CHECK (engagement_level IN ('high', 'medium', 'low')),
  confidence NUMERIC(5,2) CHECK (confidence >= 0 AND confidence <= 100),
  factors JSONB,
  predicted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables (public access for this demo)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access (for demo purposes)
-- Students policies
CREATE POLICY "Allow public read access to students" 
ON public.students 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to students" 
ON public.students 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to students" 
ON public.students 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to students" 
ON public.students 
FOR DELETE 
USING (true);

-- Student metrics policies
CREATE POLICY "Allow public read access to student_metrics" 
ON public.student_metrics 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to student_metrics" 
ON public.student_metrics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to student_metrics" 
ON public.student_metrics 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to student_metrics" 
ON public.student_metrics 
FOR DELETE 
USING (true);

-- Predictions policies
CREATE POLICY "Allow public read access to predictions" 
ON public.predictions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to predictions" 
ON public.predictions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to predictions" 
ON public.predictions 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to predictions" 
ON public.predictions 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on students
CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_student_metrics_student_id ON public.student_metrics(student_id);
CREATE INDEX idx_student_metrics_recorded_at ON public.student_metrics(recorded_at);
CREATE INDEX idx_predictions_student_id ON public.predictions(student_id);
CREATE INDEX idx_predictions_predicted_at ON public.predictions(predicted_at);
CREATE INDEX idx_predictions_engagement_level ON public.predictions(engagement_level);