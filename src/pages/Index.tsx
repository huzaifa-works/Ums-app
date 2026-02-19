import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, ArrowRight, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-2xl text-center space-y-8">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Client<span className="text-accent">Vault</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            A simple, powerful system to manage your client information — all in one place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 px-8"
            onClick={() => navigate("/auth")}
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
          {[
            { icon: Shield, title: "Secure", desc: "Your data is protected with enterprise-grade security" },
            { icon: Zap, title: "Fast", desc: "Lightning-fast search and real-time updates" },
            { icon: Users, title: "Simple", desc: "Add, edit, and manage clients effortlessly" },
          ].map((f) => (
            <div key={f.title} className="text-center space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <f.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
