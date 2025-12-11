import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Shield
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    password: "",
    confirmPassword: ""
  });
  const { showSuccess, showError } = useNotifications();

  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      showError("Password Mismatch", "Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    const result = await signup({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      department: formData.department,
      position: formData.position,
      phone: formData.phone
    });

    if (result.success) {
      showSuccess("Account Created", "Welcome to Rush Corporation!");
      setLocation("/");
    } else {
      showError("Registration Failed", result.error || "Please fill in all required fields.");
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const departments = [
    "Human Resources",
    "Information Technology",
    "Finance & Accounting",
    "Operations",
    "Marketing",
    "Sales",
    "Customer Service",
    "Administration"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Rush Corporation</h1>
              <p className="text-sm text-muted-foreground">Employee Management Portal</p>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-border/50 max-w-2xl mx-auto">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription className="text-base">
              Join Rush Corporation's employee management system
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john.doe@rushcorp.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Work Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                    <Select onValueChange={(value) => handleSelectChange("department", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept.toLowerCase().replace(/\s+/g, '-')}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium">Position</Label>
                    <Input
                      id="position"
                      name="position"
                      type="text"
                      placeholder="Software Engineer"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 h-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 h-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 rounded border-border" required />
                  <div className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href="/policies" className="text-primary hover:text-primary/80 font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/policies" className="text-primary hover:text-primary/80 font-medium">
                      Privacy Policy
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Account verification email will be sent upon registration</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Islamic-Friendly Workplace
            </Badge>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          © 2025 Rush Corporation. All rights reserved.
        </div>
      </div>
    </div>
  );
}