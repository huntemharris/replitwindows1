import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ServiceCard } from "@/components/ServiceCard";
import { ShieldCheck, Sun, Sparkles, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary font-medium text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-4 h-4" />
              <span>Utah Valley's #1 Rated Window Cleaners</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              See the world clearly <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                through brighter windows
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Professional residential and commercial window cleaning services. 
              Get an instant quote online in seconds and book your appointment today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link href="/quote">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all">
                  Get Instant Quote
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-slate-50">
                View Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-slate-900 mb-4">Why Choose Us?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We bring professional quality and reliability to every job, ensuring your home shines inside and out.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard 
              icon={Sun}
              title="Crystal Clear Results"
              description="We use purified water and professional-grade equipment to leave your windows streak-free and spotless."
            />
            <ServiceCard 
              icon={ShieldCheck}
              title="Fully Insured"
              description="Rest easy knowing your property is protected. We are fully licensed and insured professionals."
            />
            <ServiceCard 
              icon={CheckCircle2}
              title="Satisfaction Guaranteed"
              description="If you're not 100% happy with our service, we'll come back and make it right at no extra cost."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
        
        {/* Abstract pattern */}
        <svg className="absolute top-0 right-0 opacity-10" width="404" height="404" fill="none" viewBox="0 0 404 404">
          <defs>
            <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" className="text-white" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="404" height="404" fill="url(#pattern)" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Ready to brighten up your home?
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
            Our online booking process is simple and transparent. No hidden fees, no waiting for callbacks.
          </p>
          <Link href="/quote">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90 h-14 px-10 text-lg rounded-full shadow-2xl">
              Start Your Quote
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
