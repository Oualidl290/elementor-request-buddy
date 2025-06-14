
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Filter, Bell, CheckCircle, LogOut, Settings, BarChart3, Users, Clock, TrendingUp, Sparkles, Zap, Shield, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, signOut } = useAuth();

  const stats = [
    { label: "Active Requests", value: "12", icon: MessageSquare, color: "text-emerald-600", bgColor: "bg-emerald-50/80", accentColor: "border-emerald-200" },
    { label: "Completed Today", value: "8", icon: CheckCircle, color: "text-blue-600", bgColor: "bg-blue-50/80", accentColor: "border-blue-200" },
    { label: "Response Time", value: "2.4h", icon: Clock, color: "text-amber-600", bgColor: "bg-amber-50/80", accentColor: "border-amber-200" },
    { label: "Client Satisfaction", value: "98%", icon: TrendingUp, color: "text-violet-600", bgColor: "bg-violet-50/80", accentColor: "border-violet-200" },
  ];

  const quickActions = [
    { title: "View Requests", description: "Check pending client requests", icon: MessageSquare, gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/25" },
    { title: "Analytics", description: "View performance metrics", icon: BarChart3, gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/25" },
    { title: "Client Management", description: "Manage your clients", icon: Users, gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/25" },
    { title: "Settings", description: "Configure your workspace", icon: Settings, gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/25" },
  ];

  const features = [
    {
      title: "Smart Requests",
      description: "AI-powered categorization and prioritization of client feedback",
      icon: Sparkles,
      gradient: "from-emerald-100 to-teal-50",
      iconBg: "bg-gradient-to-r from-emerald-500 to-teal-600",
    },
    {
      title: "Lightning Fast",
      description: "Instant filtering and search with real-time updates",
      icon: Zap,
      gradient: "from-blue-100 to-indigo-50",
      iconBg: "bg-gradient-to-r from-blue-500 to-indigo-600",
    },
    {
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee",
      icon: Shield,
      gradient: "from-violet-100 to-purple-50",
      iconBg: "bg-gradient-to-r from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Request Manager</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <Link to="/designer-panel">
                    <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Panel
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={signOut} size="sm" className="border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <Card className="mb-12 border-0 shadow-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-black/5"></div>
          <CardContent className="p-12 relative">
            <div className="flex items-center justify-between">
              <div className="max-w-3xl">
                <h2 className="text-4xl font-bold mb-4 leading-tight">
                  Transform Your Client 
                  <span className="block text-white/90">Feedback Workflow</span>
                </h2>
                <p className="text-emerald-50 mb-8 text-lg leading-relaxed max-w-2xl">
                  Experience the future of client management with our AI-powered platform. 
                  Streamline requests, automate workflows, and deliver exceptional results faster than ever.
                </p>
                {user ? (
                  <Link to="/designer-panel">
                    <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Open Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth">
                    <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get Started Free
                    </Button>
                  </Link>
                )}
              </div>
              <div className="hidden lg:block">
                <div className="w-40 h-40 bg-white/10 rounded-3xl backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-2xl">
                  <Rocket className="w-20 h-20 text-white/90" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className={`border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 ${stat.accentColor} border`}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center border ${stat.accentColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {quickActions.map((action, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-105">
              <CardContent className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg ${action.shadow}`}>
                  <action.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-3 text-lg">{action.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className={`border-0 shadow-lg bg-gradient-to-br ${feature.gradient} hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900 mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-slate-700 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10"></div>
          <CardContent className="p-12 text-center relative">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold mb-6">Ready to revolutionize your workflow?</h3>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                Join thousands of designers and developers who trust our platform to transform their client relationships and deliver exceptional results.
              </p>
              {!user && (
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
