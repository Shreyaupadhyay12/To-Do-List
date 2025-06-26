
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, User, LogOut, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import TaskItem from './TaskItem';
import CategoryManager from './CategoryManager';

const TodoApp = ({ currentUser, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', category: '' });
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadTasks();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('todo_categories')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    }
  };

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('todo_tasks')
        .select(`
          *,
          todo_categories(name, color, icon)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTasks(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive"
      });
      return;
    }

    if (!newTask.category) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedCategory = categories.find(cat => cat.name === newTask.category);
      
      const { data, error } = await supabase
        .from('todo_tasks')
        .insert([{
          title: newTask.title,
          description: newTask.description || null,
          category_id: selectedCategory.id,
          user_id: currentUser.id,
          status: 'active'
        }])
        .select(`
          *,
          todo_categories(name, color, icon)
        `)
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      setNewTask({ title: '', description: '', category: '' });
      
      toast({
        title: "Task added! ✨",
        description: "Your new task has been created successfully.",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive"
      });
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('todo_tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));

      const statusMessages = {
        completed: 'Task completed! 🎉',
        paused: 'Task paused ⏸️',
        active: 'Task resumed ▶️'
      };

      if (updates.status && statusMessages[updates.status]) {
        toast({
          title: statusMessages[updates.status],
          description: `"${tasks.find(t => t.id === id)?.title}" is now ${updates.status}`,
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (id) => {
    try {
      const { error } = await supabase
        .from('todo_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
      toast({
        title: "Task deleted 🗑️",
        description: "The task has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filter === 'all' || task.status === filter;
    const categoryMatch = categoryFilter === 'all' || task.todo_categories?.name === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const taskCounts = {
    all: tasks.length,
    active: tasks.filter(t => t.status === 'active').length,
    paused: tasks.filter(t => t.status === 'paused').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  const categoryNames = categories.map(cat => cat.name);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <CheckCircle className="h-16 w-16 text-purple-600 mx-auto animate-pulse" />
            <Sparkles className="h-8 w-8 text-pink-500 absolute -top-2 -right-2 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">Loading your workspace...</h3>
            <p className="text-gray-600">Getting everything ready for you</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <CheckCircle className="h-10 w-10 text-purple-600" />
                <Sparkles className="h-5 w-5 text-pink-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  FlowFocus Pro
                </h1>
                <p className="text-sm text-gray-600 font-medium">Productivity Reimagined</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
                <User className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  Welcome, {currentUser.name || currentUser.email}!
                </span>
              </div>
              <Link to="/profile">
                <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
                className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Enhanced Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Stats Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Task Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">{taskCounts.all}</div>
                    <div className="text-xs text-blue-700 font-medium">Total</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-green-600">{taskCounts.completed}</div>
                    <div className="text-xs text-green-700 font-medium">Done</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600">{taskCounts.active}</div>
                    <div className="text-xs text-purple-700 font-medium">Active</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-100">
                    <div className="text-2xl font-bold text-yellow-600">{taskCounts.paused}</div>
                    <div className="text-xs text-yellow-700 font-medium">Paused</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Manager */}
            <CategoryManager 
              categories={categoryNames} 
              onCategoriesChange={loadCategories}
            />

            {/* Enhanced Filters */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Smart Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Status Filter</label>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="active">Active Tasks</SelectItem>
                      <SelectItem value="paused">Paused Tasks</SelectItem>
                      <SelectItem value="completed">Completed Tasks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Category Filter</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoryNames.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Enhanced Add Task Form */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Plus className="h-5 w-5 text-purple-600" />
                  Create New Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="What needs to be done?"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                  />
                  <Select 
                    value={newTask.category} 
                    onValueChange={(value) => setNewTask({...newTask, category: value})}
                  >
                    <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-200">
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryNames.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Add some details (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="mb-4 border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                />
                <Button 
                  onClick={addTask} 
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Task
                </Button>
              </CardContent>
            </Card>

            {/* Enhanced Tasks List */}
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="text-center py-16">
                    <div className="relative mb-6">
                      <CheckCircle className="h-20 w-20 text-gray-300 mx-auto" />
                      <Sparkles className="h-8 w-8 text-purple-400 absolute top-0 right-1/2 transform translate-x-8" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-600 mb-3">All caught up!</h3>
                    <p className="text-gray-500 text-lg">No tasks match your current filters.</p>
                    <p className="text-gray-400 mt-2">Create a new task to get started on your productivity journey!</p>
                  </CardContent>
                </Card>
              ) : (
                filteredTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-purple-100 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <CheckCircle className="h-6 w-6 text-purple-600" />
              <span className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                FlowFocus Pro
              </span>
            </div>
            <p className="text-gray-600 font-medium">© 2025 Created by Shreya</p>
            <p className="text-sm text-gray-500">Productivity • Focus • Success</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TodoApp;
