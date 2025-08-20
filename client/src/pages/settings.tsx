import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Settings as SettingsIcon, User, Save, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

const userSettingsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  displayName: z.string().min(1, "Display name is required"),
});

type UserSettings = z.infer<typeof userSettingsSchema>;

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Default user data (in a real app, this would come from a user API)
  const [currentUser, setCurrentUser] = useState({
    firstName: "Dr. Jane",
    lastName: "Smith",
    email: "dr.jane.smith@uow.edu.my",
    displayName: "DJ",
  });

  const form = useForm<UserSettings>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: currentUser,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: UserSettings): Promise<UserSettings> => {
      // Simulate API call - in real app this would update user preferences
      return new Promise((resolve) => {
        setTimeout(() => {
          setCurrentUser(data);
          resolve(data);
        }, 1000);
      });
    },
    onSuccess: (data: UserSettings) => {
      toast({
        title: "Settings updated",
        description: "Your profile settings have been successfully updated.",
      });
      
      // Update the display name in navigation
      const initials = `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`;
      setCurrentUser(prev => ({ ...prev, displayName: initials }));
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserSettings) => {
    updateUserMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <SettingsIcon className="w-8 h-8 mr-3 text-primary" />
              Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your profile and application preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="w-5 h-5 mr-2" />
                Settings Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start"
              >
                <User className="w-4 h-4 mr-3" />
                Profile Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-500"
                disabled
              >
                <SettingsIcon className="w-4 h-4 mr-3" />
                Application Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-500"
                disabled
              >
                <SettingsIcon className="w-4 h-4 mr-3" />
                Notification Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Settings Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <User className="w-6 h-6 mr-3 text-primary" />
                Profile Settings
              </CardTitle>
              <p className="text-gray-600">
                Update your personal information and display preferences
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Current Profile Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Current Profile</h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {currentUser.displayName}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {currentUser.firstName} {currentUser.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{currentUser.email}</div>
                      <div className="text-sm text-gray-500">Programme Leader</div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      className="mt-1"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      className="mt-1"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    className="mt-1"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="displayName">Display Initials</Label>
                  <Input
                    id="displayName"
                    {...form.register("displayName")}
                    className="mt-1"
                    maxLength={3}
                    placeholder="e.g., DJ, JS"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    These initials will appear in the top navigation
                  </p>
                  {form.formState.errors.displayName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.displayName.message}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset(currentUser)}
                  >
                    Reset Changes
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateUserMutation.isPending}
                    className="flex items-center"
                  >
                    {updateUserMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}