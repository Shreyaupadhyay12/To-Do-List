
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Camera, Trash2, ArrowLeft, Save, CheckCircle, Sparkles, Trophy, Target, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = ({ currentUser, onLogout }) => {
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    completionRate: 0
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const { data: tasks, error } = await supabase
        .from('todo_tasks')
        .select('*')
        .eq('user_id', currentUser.id);

      if (error) throw error;

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0;
      const activeTasks = tasks?.filter(task => task.status === 'active').length || 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      setStats({
        totalTasks,
        completedTasks,
        activeTasks,
        completionRate
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, avatar: e.target.result }));
        toast({
          title: "Photo updated! 📸",
          description: "Your profile photo has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setProfile(prev => ({ ...prev, avatar: null }));
    toast({
      title: "Photo removed 🗑️",
      description: "Your profile photo has been removed.",
    });
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      // Save to localStorage for now (can be updated to use Supabase later)
      const updatedUser = { ...currentUser, ...profile };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      toast({
        title: "Profile updated! ✨",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile changes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="hover:bg-purple-50 text-purple-700 font-medium">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to FlowFocus
                </Button>
              </Link>
              <div className="hidden md:flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
                <span className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Profile Settings
                </span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="relative inline-block">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    My Profile
                  </CardTitle>
                  <Sparkles className="h-6 w-6 text-pink-500 absolute -top-2 -right-8" />
                </div>
                <p className="text-gray-600">Manage your account settings and preferences</p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                      <AvatarImage src={profile.avatar} alt="Profile" />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 text-white font-bold">
                        {getInitials(profile.name || profile.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                      <Camera className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label htmlFor="avatar-upload">
                        <Button variant="outline" size="sm" className="cursor-pointer border-purple-200 text-purple-700 hover:bg-purple-50">
                          <Camera className="h-4 w-4 mr-2" />
                          Upload Photo
                        </Button>
                      </label>
                    </div>
                    
                    {profile.avatar && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={removeAvatar}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                {/* Profile Form */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">Full Name</label>
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Enter your full name"
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">Email Address</label>
                      <Input
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Enter your email"
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 pt-6 border-t border-purple-100">
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                    >
                      <User className="h-5 w-5 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-3">
                      <Button 
                        onClick={saveProfile}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        disabled={loading}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Achievement Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Your Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.completionRate}%</div>
                  <div className="text-sm text-yellow-700 font-medium">Completion Rate</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="text-xl font-bold text-blue-600">{stats.totalTasks}</div>
                    <div className="text-xs text-blue-700 font-medium">Total Tasks</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <div className="text-xl font-bold text-green-600">{stats.completedTasks}</div>
                    <div className="text-xs text-green-700 font-medium">Completed</div>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                  <div className="text-xl font-bold text-purple-600">{stats.activeTasks}</div>
                  <div className="text-xs text-purple-700 font-medium">Active Tasks</div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/" className="block">
                  <Button variant="outline" className="w-full justify-start border-purple-200 text-purple-700 hover:bg-purple-50">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    View Tasks
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50" disabled>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            {/* Motivational Quote */}
            <Card className="bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 text-white border-0 shadow-xl">
              <CardContent className="text-center py-6">
                <Sparkles className="h-8 w-8 mx-auto mb-3 text-yellow-300" />
                <p className="text-sm font-medium mb-2">"Success is the sum of small efforts repeated day in and day out."</p>
                <p className="text-xs opacity-80">- Robert Collier</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-purple-100 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
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

export default ProfilePage;
