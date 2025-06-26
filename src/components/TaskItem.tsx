
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, Pause, Edit, Trash2, Save, X, Play } from 'lucide-react';

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || ''
  });

  const handleSave = () => {
    onUpdate(task.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description || ''
    });
    setIsEditing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200';
      case 'paused':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200';
      case 'active':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      case 'active':
        return <Play className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
      task.status === 'completed' ? 'opacity-75' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Header with category and status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {task.todo_categories && (
                  <Badge 
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ 
                      backgroundColor: `${task.todo_categories.color}20`,
                      color: task.todo_categories.color,
                      borderColor: `${task.todo_categories.color}40`
                    }}
                  >
                    {task.todo_categories.name}
                  </Badge>
                )}
                
                <Badge className={`text-xs px-3 py-1 rounded-full font-medium border ${getStatusColor(task.status)}`}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(task.status)}
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </Badge>
              </div>
              
              <div className="text-xs text-gray-500 font-medium">
                {new Date(task.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Task content */}
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  className="font-semibold text-lg border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                  placeholder="Task title"
                />
                <Input
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                  placeholder="Task description (optional)"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className={`text-lg font-semibold text-gray-800 ${
                  task.status === 'completed' ? 'line-through text-gray-500' : ''
                }`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className={`text-sm text-gray-600 ${
                    task.status === 'completed' ? 'line-through' : ''
                  }`}>
                    {task.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {isEditing ? (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancel}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                {/* Status toggle buttons */}
                {task.status !== 'completed' && (
                  <Button 
                    size="sm" 
                    onClick={() => onUpdate(task.id, { status: 'completed' })}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    title="Mark as completed"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                
                {task.status === 'active' && (
                  <Button 
                    size="sm" 
                    onClick={() => onUpdate(task.id, { status: 'paused' })}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    title="Pause task"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                
                {task.status === 'paused' && (
                  <Button 
                    size="sm" 
                    onClick={() => onUpdate(task.id, { status: 'active' })}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    title="Resume task"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  title="Edit task"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onDelete(task.id)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskItem;
