
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Filter, Bell, CheckCircle, LogOut, Settings, BarChart3, Users, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, signOut } = useAuth();

  const stats = [
    { label: "Active Requests", value: "12", icon: MessageSquare, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Completed Today", value: "8", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
    { label: "Response Time", value: "2.4h", icon: Clock, color: "text-orange-600", bgColor: "bg-orange-50" },
    { label: "Client Satisfaction", value: "98%", icon: TrendingUp, color: "text-purple-600", bgColor: "bg-purple-50" },
  ];

  const quickActions = [
    { title: "View Requests", description: "Check pending client requests", icon: MessageSquare, color: "bg-blue-500" },
    { title: "Analytics", description: "View performance metrics", icon: BarChart3, color: "bg-green-500" },
    { title: "Client Management", description: "Manage your clients", icon: Users, color: "bg-purple-500" },
    { title: "Settings", description: "Configure your workspace", icon: Settings, color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">Request Manager</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <Link to="/designer-panel">
                    <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Panel
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={signOut} size="sm" className="border-slate-200 hover:bg-slate-50">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Hero Widget */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Request Manager</h2>
                <p className="text-blue-100 mb-6 max-w-2xl">
                  Streamline your client feedback workflow with our modern, widget-based interface. 
                  Manage requests efficiently and keep clients happy.
                </p>
                {user ? (
                  <Link to="/designer-panel">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Open Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                      Get Started
                    </Button>
                  </Link>
                )}
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                  <MessageSquare className="w-16 h-16 text-white/80" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm bg-white/60 backdrop-blur-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Card key={index} className="border-0 shadow-sm bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{action.title}</h3>
                <p className="text-sm text-slate-600">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Smart Requests</CardTitle>
              <CardDescription>
                Organize and prioritize client feedback with intelligent categorization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <Filter className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Advanced Filtering</CardTitle>
              <CardDescription>
                Find exactly what you need with powerful search and filter options
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Real-time Updates</CardTitle>
              <CardDescription>
                Stay informed with instant notifications and status changes
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Bottom CTA */}
        <Card className="mt-12 border-0 shadow-lg bg-gradient-to-r from-slate-900 to-slate-700 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to streamline your workflow?</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Join thousands of designers and developers who trust our platform to manage their client relationships.
            </p>
            {!user && (
              <Link to="/auth">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                  Start Free Trial
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
