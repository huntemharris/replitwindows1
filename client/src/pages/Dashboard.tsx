import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useBookings } from "@/hooks/use-bookings";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { PricingStats } from "@/components/PricingStats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSettingsSchema } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect } from "react";
import { z } from "zod";

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: bookings, isLoading: isBookingsLoading } = useBookings();
  const { data: settings, isLoading: isSettingsLoading } = useSettings();
  const { mutate: updateSettings, isPending: isUpdatingSettings } = useUpdateSettings();

  const settingsForm = useForm({
    resolver: zodResolver(insertSettingsSchema.omit({ id: true })),
    defaultValues: {
      priceExterior: 10,
      priceInterior: 5,
      priceScreens: 3,
      priceSills: 3,
      priceGutters: 50,
      priceSolar: 10,
      commercialMultiplier: "1.5",
    },
  });

  // Load settings into form when data arrives
  useEffect(() => {
    if (settings) {
      settingsForm.reset(settings);
    }
  }, [settings, settingsForm]);

  if (isAuthLoading || isBookingsLoading || isSettingsLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate Stats
  const totalRevenue = bookings?.reduce((acc, curr) => acc + curr.totalPrice, 0) || 0;
  const totalBookings = bookings?.length || 0;
  const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;
  const avgValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const onSaveSettings = (data: z.infer<typeof insertSettingsSchema>) => {
    updateSettings(data);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user?.firstName || 'Admin'}.</p>
        </div>

        <PricingStats 
          totalRevenue={totalRevenue}
          totalBookings={totalBookings}
          pendingBookings={pendingBookings}
          averageValue={avgValue}
        />

        <div className="mt-8">
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="settings">Pricing Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Manage your upcoming appointments and quote history.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Windows</TableHead>
                        <TableHead className="text-right">Total Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings?.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{booking.customerName}</span>
                              <span className="text-xs text-muted-foreground">{booking.customerEmail}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status}
                            </span>
                          </TableCell>
                          <TableCell>{format(new Date(booking.scheduledDate), "MMM d, yyyy")}</TableCell>
                          <TableCell>{booking.windowCount}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(booking.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Configuration</CardTitle>
                  <CardDescription>Update your base prices. These changes reflect immediately in the customer quote wizard.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={settingsForm.handleSubmit(onSaveSettings)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Exterior Window Price (Base)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                          <Input 
                            type="number" 
                            className="pl-7"
                            {...settingsForm.register("priceExterior", { valueAsNumber: true })} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Interior Window Price (Add-on)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                          <Input 
                            type="number" 
                            className="pl-7"
                            {...settingsForm.register("priceInterior", { valueAsNumber: true })} 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Screens Cleaning</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                          <Input 
                            type="number" 
                            className="pl-7"
                            {...settingsForm.register("priceScreens", { valueAsNumber: true })} 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Sills Detailing</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                          <Input 
                            type="number" 
                            className="pl-7"
                            {...settingsForm.register("priceSills", { valueAsNumber: true })} 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Gutters Cleaning (Flat Fee)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                          <Input 
                            type="number" 
                            className="pl-7"
                            {...settingsForm.register("priceGutters", { valueAsNumber: true })} 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Solar Panels (Per Panel)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                          <Input 
                            type="number" 
                            className="pl-7"
                            {...settingsForm.register("priceSolar", { valueAsNumber: true })} 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Commercial Multiplier (e.g., 1.5x)</Label>
                        <Input 
                          {...settingsForm.register("commercialMultiplier")} 
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isUpdatingSettings}>
                        {isUpdatingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
