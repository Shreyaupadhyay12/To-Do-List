
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Palette, Folder } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CategoryManager = ({ categories, onCategoriesChange }) => {
  const [newCategory, setNewCategory] = useState({ name: '', color: '#6366f1' });
  const [isAdding, setIsAdding] = useState(false);
  const [categoryData, setCategoryData] = useState([]);

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', 
    '#f59e0b', '#10b981', '#06b6d4', '#84cc16'
  ];

  useEffect(() => {
    loadCategoryData();
  }, [categories]);

  const loadCategoryData = async () => {
    try {
      const { data, error } = await supabase
        .from('todo_categories')
        .select('*')
        .order('created_at');
      
      if (error) throw error;
      setCategoryData(data || []);
    } catch (error) {
      console.error('Error loading category data:', error);
    }
  };

  const addCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('todo_categories')
        .insert([{
          name: newCategory.name.trim(),
          color: newCategory.color,
          icon: 'folder'
        }]);

      if (error) throw error;

      setNewCategory({ name: '', color: '#6366f1' });
      setIsAdding(false);
      onCategoriesChange();
      
      toast({
        title: "Category added! 🎯",
        description: `"${newCategory.name}" category has been created.`,
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
    }
  };

  const deleteCategory = async (categoryId, categoryName) => {
    try {
      // Check if there are tasks using this category
      const { data: tasks, error: tasksError } = await supabase
        .from('todo_tasks')
        .select('id')
        .eq('category_id', categoryId);

      if (tasksError) throw tasksError;

      if (tasks && tasks.length > 0) {
        toast({
          title: "Cannot delete category",
          description: `"${categoryName}" is being used by ${tasks.length} task(s). Please reassign or delete those tasks first.`,
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('todo_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      onCategoriesChange();
      
      toast({
        title: "Category deleted 🗑️",
        description: `"${categoryName}" category has been removed.`,
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
          <Folder className="h-5 w-5 text-purple-600" />
          Categories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category List */}
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {categoryData.map(category => (
            <div key={category.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteCategory(category.id, category.name)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add Category Form */}
        {isAdding ? (
          <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <Input
              placeholder="Category name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
            />
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Choose Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      newCategory.color === color ? 'border-gray-400 scale-110' : 'border-white hover:scale-105'
                    } shadow-md`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewCategory({...newCategory, color})}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={addCategory}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsAdding(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={() => setIsAdding(true)}
            variant="outline"
            className="w-full border-dashed border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 py-3 font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Category
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
