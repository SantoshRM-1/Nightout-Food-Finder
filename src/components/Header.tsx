import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Hotel, User, LogIn, LogOut, Shield, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      checkAdminStatus(user.id);
    }
  };

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Hotel className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Nightout</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="/" className="text-foreground hover:text-primary transition-colors">
            Browse Hotels
          </a>
          {user && (
            <a href="/submit" className="text-foreground hover:text-primary transition-colors">
              Submit Hotel
            </a>
          )}
          {isAdmin && (
            <a href="/admin" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Admin
            </a>
          )}
        </nav>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user && (
                <Button variant="outline" size="sm" onClick={() => navigate("/submit")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/auth")}>
                <User className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;