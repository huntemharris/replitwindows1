import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { useCreateBooking, useAvailability } from "@/hooks/use-bookings";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertBookingSchema } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowLeft, Check, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";

const steps = ["Contact", "Estimate", "Review", "Schedule", "Success"];

// Extend schema for form validation including required boolean logic
const formSchema = insertBookingSchema.extend({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Invalid email"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  windowCount: z.number().min(1, "At least 1 window required"),
});

type FormData = z.infer<typeof formSchema>;

export default function QuoteWizard() {
  const [step, setStep] = useState(0);
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const { mutate: createBooking, isPending: isBooking } = useCreateBooking();
  
  // Date selection state
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  // Fetch availability for next 30 days
  const today = new Date();
  const nextMonth = addDays(today, 30);
  const { data: bookedDates } = useAvailability(today, nextMonth);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      isCommercial: false,
      windowCount: 10,
      serviceExterior: true,
      serviceInterior: false,
      serviceScreens: false,
      serviceSills: false,
      serviceGutters: false,
      serviceSolar: false,
      solarPanelCount: 0,
      totalPrice: 0,
      status: "pending",
    },
  });

  const values = form.watch();

  // Price Calculation Logic
  const calculateTotal = () => {
    if (!settings) return 0;
    
    let total = 0;
    
    // Window Base Price
    let windowPrice = settings.priceExterior;
    if (values.serviceInterior) windowPrice += settings.priceInterior;
    if (values.serviceScreens) windowPrice += settings.priceScreens;
    if (values.serviceSills) windowPrice += settings.priceSills;
    
    total += windowPrice * values.windowCount;
    
    // Add-ons
    if (values.serviceGutters) total += settings.priceGutters * 100; // Assuming basic package for now
    if (values.serviceSolar) total += settings.priceSolar * (values.solarPanelCount || 0);

    // Commercial Multiplier
    if (values.isCommercial) {
      total = total * parseFloat(settings.commercialMultiplier);
    }
    
    return total; // in cents if integer, let's assume dollars for display simplicity or convert
  };

  const totalPrice = calculateTotal();

  const handleNext = async () => {
    const isStepValid = await form.trigger(
      step === 0 
        ? ["customerName", "customerEmail", "customerPhone"] 
        : step === 1 
          ? ["windowCount"] 
          : []
    );

    if (isStepValid) {
      setStep(prev => prev + 1);
    }
  };

  const handleBooking = () => {
    if (!date) return;
    
    const bookingData = {
      ...values,
      totalPrice,
      scheduledDate: date,
    };
    
    createBooking(bookingData, {
      onSuccess: () => setStep(4),
    });
  };

  if (isLoadingSettings) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Disable already booked dates
  const isDateDisabled = (day: Date) => {
    if (day < new Date()) return true;
    // Check against bookedDates string array
    if (bookedDates?.some(d => new Date(d).toDateString() === day.toDateString())) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
              <span>Information</span>
              <span>Services</span>
              <span>Review</span>
              <span>Schedule</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((step) / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  {/* Step 0: Contact Info */}
                  {step === 0 && (
                    <div className="space-y-6">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Let's get started</h2>
                        <p className="text-slate-500">First, tell us a bit about yourself.</p>
                      </div>

                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            {...form.register("customerName")}
                            className="bg-white"
                            placeholder="John Doe"
                          />
                          {form.formState.errors.customerName && (
                            <p className="text-sm text-red-500">{form.formState.errors.customerName.message}</p>
                          )}
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            {...form.register("customerEmail")}
                            className="bg-white"
                            placeholder="john@example.com"
                          />
                          {form.formState.errors.customerEmail && (
                            <p className="text-sm text-red-500">{form.formState.errors.customerEmail.message}</p>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            {...form.register("customerPhone")}
                            className="bg-white"
                            placeholder="(555) 123-4567"
                          />
                          {form.formState.errors.customerPhone && (
                            <p className="text-sm text-red-500">{form.formState.errors.customerPhone.message}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox 
                            id="commercial" 
                            checked={values.isCommercial}
                            onCheckedChange={(checked) => form.setValue("isCommercial", !!checked)}
                          />
                          <Label htmlFor="commercial" className="font-normal cursor-pointer">
                            This is for a commercial property
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Estimator */}
                  {step === 1 && (
                    <div className="space-y-8">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Estimate your service</h2>
                        <p className="text-slate-500">How many windows do you need cleaned?</p>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                          <Label className="text-lg font-medium">Number of Windows</Label>
                          <span className="text-2xl font-bold text-primary">{values.windowCount}</span>
                        </div>
                        <Slider
                          defaultValue={[10]}
                          value={[values.windowCount]}
                          onValueChange={(val) => form.setValue("windowCount", val[0])}
                          max={50}
                          step={1}
                          className="py-4"
                        />
                        <p className="text-xs text-slate-400 mt-2 text-center">Drag slider to adjust count</p>
                      </div>

                      <div className="grid gap-4">
                        <Label className="text-lg font-medium mb-2">Additional Services</Label>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className={`p-4 rounded-xl border cursor-pointer transition-all ${values.serviceExterior ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-white border-slate-200 hover:border-primary/50'}`}>
                            <div className="flex items-center space-x-3">
                              <Checkbox 
                                id="exterior" 
                                checked={values.serviceExterior}
                                onCheckedChange={(c) => form.setValue("serviceExterior", !!c)}
                              />
                              <Label htmlFor="exterior" className="cursor-pointer font-medium">Exterior Cleaning</Label>
                            </div>
                          </div>

                          <div className={`p-4 rounded-xl border cursor-pointer transition-all ${values.serviceInterior ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-white border-slate-200 hover:border-primary/50'}`}>
                            <div className="flex items-center space-x-3">
                              <Checkbox 
                                id="interior" 
                                checked={values.serviceInterior}
                                onCheckedChange={(c) => form.setValue("serviceInterior", !!c)}
                              />
                              <Label htmlFor="interior" className="cursor-pointer font-medium">Interior Cleaning</Label>
                            </div>
                          </div>

                          <div className={`p-4 rounded-xl border cursor-pointer transition-all ${values.serviceScreens ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-white border-slate-200 hover:border-primary/50'}`}>
                            <div className="flex items-center space-x-3">
                              <Checkbox 
                                id="screens" 
                                checked={values.serviceScreens}
                                onCheckedChange={(c) => form.setValue("serviceScreens", !!c)}
                              />
                              <Label htmlFor="screens" className="cursor-pointer font-medium">Screen Cleaning</Label>
                            </div>
                          </div>

                          <div className={`p-4 rounded-xl border cursor-pointer transition-all ${values.serviceSills ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-white border-slate-200 hover:border-primary/50'}`}>
                            <div className="flex items-center space-x-3">
                              <Checkbox 
                                id="sills" 
                                checked={values.serviceSills}
                                onCheckedChange={(c) => form.setValue("serviceSills", !!c)}
                              />
                              <Label htmlFor="sills" className="cursor-pointer font-medium">Sill Detailing</Label>
                            </div>
                          </div>
                          
                          <div className={`p-4 rounded-xl border cursor-pointer transition-all ${values.serviceGutters ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-white border-slate-200 hover:border-primary/50'}`}>
                            <div className="flex items-center space-x-3">
                              <Checkbox 
                                id="gutters" 
                                checked={values.serviceGutters}
                                onCheckedChange={(c) => form.setValue("serviceGutters", !!c)}
                              />
                              <Label htmlFor="gutters" className="cursor-pointer font-medium">Gutter Cleaning</Label>
                            </div>
                          </div>

                          <div className={`p-4 rounded-xl border cursor-pointer transition-all ${values.serviceSolar ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-white border-slate-200 hover:border-primary/50'}`}>
                            <div className="flex items-center space-x-3">
                              <Checkbox 
                                id="solar" 
                                checked={values.serviceSolar}
                                onCheckedChange={(c) => form.setValue("serviceSolar", !!c)}
                              />
                              <Label htmlFor="solar" className="cursor-pointer font-medium">Solar Panels</Label>
                            </div>
                          </div>
                        </div>

                        {values.serviceSolar && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2">
                            <Label htmlFor="solarCount" className="mb-2 block">How many panels?</Label>
                            <Input 
                              type="number"
                              min="0"
                              {...form.register("solarPanelCount", { valueAsNumber: true })}
                              className="bg-white"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Instant Quote */}
                  {step === 2 && (
                    <div className="space-y-8 text-center">
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Your Instant Quote</h2>
                        <p className="text-slate-500">Based on the services you selected</p>
                      </div>

                      <div className="py-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Estimated Total</p>
                        <div className="text-5xl font-display font-bold text-primary mb-2">
                          {formatCurrency(totalPrice)}
                        </div>
                        <p className="text-sm text-slate-400">Includes all selected services</p>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-left space-y-3">
                        <h3 className="font-semibold text-slate-900 mb-4">Summary</h3>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Window Count</span>
                          <span className="font-medium">{values.windowCount} windows</span>
                        </div>
                        {values.serviceExterior && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Exterior Cleaning</span>
                            <span className="font-medium text-primary">Included</span>
                          </div>
                        )}
                        {values.serviceInterior && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Interior Cleaning</span>
                            <span className="font-medium text-primary">Included</span>
                          </div>
                        )}
                        {/* Add other services similarly... */}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Schedule */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Pick a Date</h2>
                        <p className="text-slate-500">Choose a day that works for you</p>
                      </div>

                      <div className="flex justify-center">
                        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={isDateDisabled}
                            initialFocus
                            className="rounded-md border-none"
                          />
                        </div>
                      </div>

                      {date && (
                        <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20 text-primary font-medium animate-in fade-in">
                          Selected: {format(date, "EEEE, MMMM do, yyyy")}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Success */}
                  {step === 4 && (
                    <div className="text-center py-12 space-y-6">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900">Booking Confirmed!</h2>
                      <p className="text-slate-600 max-w-md mx-auto">
                        Thank you, {values.customerName}. We have sent a confirmation email to {values.customerEmail}.
                      </p>
                      <div className="pt-8">
                        <Button onClick={() => window.location.href = "/"} variant="outline">
                          Back to Home
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons (Hidden on Success Step) */}
                  {step !== 4 && (
                    <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
                      {step > 0 ? (
                        <Button 
                          variant="ghost" 
                          onClick={() => setStep(prev => prev - 1)}
                          className="text-slate-500 hover:text-slate-900"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                      ) : (
                        <div /> // Spacer
                      )}

                      {step === 3 ? (
                        <Button 
                          onClick={handleBooking} 
                          disabled={!date || isBooking}
                          className="bg-primary hover:bg-primary/90 min-w-[140px]"
                        >
                          {isBooking ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Booking...
                            </>
                          ) : (
                            "Confirm Booking"
                          )}
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleNext}
                          className="bg-primary hover:bg-primary/90 min-w-[140px]"
                        >
                          Next <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
