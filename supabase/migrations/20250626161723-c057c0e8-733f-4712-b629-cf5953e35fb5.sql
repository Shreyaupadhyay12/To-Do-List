
-- Create a new table for todo categories (separate from quiz_categories)
CREATE TABLE public.todo_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for todo tasks
CREATE TABLE public.todo_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.todo_categories(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories for the todo app
INSERT INTO public.todo_categories (name, color, icon) VALUES
  ('Personal', '#8b5cf6', 'user'),
  ('Work', '#3b82f6', 'briefcase'),
  ('Shopping', '#10b981', 'shopping-cart'),
  ('Health', '#ef4444', 'heart');

-- Enable Row Level Security for todo_categories
ALTER TABLE public.todo_categories ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security for todo_tasks
ALTER TABLE public.todo_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for todo_categories (public read access for all users)
CREATE POLICY "Anyone can view todo categories" 
  ON public.todo_categories 
  FOR SELECT 
  USING (true);

-- Create policies for todo_tasks (users can only see their own tasks)
CREATE POLICY "Users can view their own todo tasks" 
  ON public.todo_tasks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own todo tasks" 
  ON public.todo_tasks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todo tasks" 
  ON public.todo_tasks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todo tasks" 
  ON public.todo_tasks 
  FOR DELETE 
  USING (auth.uid() = user_id);
