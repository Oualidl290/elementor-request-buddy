import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Filter, Bell, CheckCircle, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-16">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <div></div>
          <div className="flex gap-4">
            {user ? (
              <>
                <Link to="/designer-panel">
                  <Button variant="outline">Designer Panel</Button>
                </Link>
                <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Client Request Manager
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A clean, focused interface for designers and developers to manage client edit requests 
            in WordPress with Elementor. Streamline your workflow and keep clients happy.
          </p>
          
          {user ? (
            <Link to="/designer-panel">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                Open Designer Panel
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                Get Started
              </Button>
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <MessageSquare className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Client Requests</CardTitle>
              <CardDescription>
                View and manage all client edit requests in one place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <Filter className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Smart Filtering</CardTitle>
              <CardDescription>
                Filter by page, status, or search through request content
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <Bell className="w-8 h-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">Real-time Updates</CardTitle>
              <CardDescription>
                Get notified when new requests come in or status changes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CheckCircle className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Status Management</CardTitle>
              <CardDescription>
                Track progress from open to resolved with visual indicators
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">Perfect for WordPress + Elementor</CardTitle>
              <CardDescription className="text-lg">
                This interface is designed to be embedded into WordPress admin pages, 
                giving you a professional tool to manage client feedback and requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Clean Design</h4>
                  <p className="text-gray-600 text-sm">
                    Matches Elementor's minimal aesthetic with white cards and soft shadows
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Responsive</h4>
                  <p className="text-gray-600 text-sm">
                    Works perfectly on desktop and tablet devices for on-the-go management
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Embeddable</h4>
                  <p className="text-gray-600 text-sm">
                    Can be embedded into WordPress admin via iframe or shortcode
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
