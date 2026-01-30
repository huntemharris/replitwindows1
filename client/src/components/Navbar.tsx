import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Droplets, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Droplets className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 tracking-tight">
              Utah Valley <span className="text-primary">Cleaners</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Services
            </Link>
            <Link href="/quote" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Get Quote
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="font-medium">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => logout()}>
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex"
                  onClick={() => (window.location.href = "/api/login")}
                >
                  Staff Login
                </Button>
                <Link href="/quote">
                  <Button className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                    Book Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
