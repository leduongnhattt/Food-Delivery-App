"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SuccessPopup } from "@/components/ui/success-popup";
import { PasswordStrength } from "@/components/ui/password-strength";
import { ErrorDisplay } from "@/components/ui/error-display";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePasswordToggle } from "@/hooks/use-password-toggle";
import { useTranslations } from "@/lib/i18n";

export default function EnterpriseSignupPage() {
  const router = useRouter();
  const { t, isLoading: i18nLoading } = useTranslations();

  // Account fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Enterprise fields
  const [enterpriseName, setEnterpriseName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [openHours, setOpenHours] = useState("");
  const [closeHours, setCloseHours] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Password toggle hooks
  const passwordToggle = usePasswordToggle();
  const confirmPasswordToggle = usePasswordToggle();

  // Clear error when user starts typing
  const handleFieldFocus = () => {
    if (error) {
      setError("");
    }
  };

  // Handle success popup close
  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    // Clear form
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setEnterpriseName("");
    setAddress("");
    setPhoneNumber("");
    setDescription("");
    setOpenHours("");
    setCloseHours("");
    setError("");
    // Redirect to signin page
    router.push("/enterprise-signin?registered=success");
  };

  // Register enterprise function
  const registerEnterprise = async (data: any) => {
    try {
      const response = await fetch("/api/enterprise/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: result.error || "Registration failed",
            field: result.field,
          },
        };
      }

      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: {
          message: "Network error occurred",
        },
      };
    }
  };

  const handleSubmit = async () => {
    // Reset error state
    setError("");

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError(t("signup.errors.passwordMismatch"));
      setPassword("");
      setConfirmPassword("");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError(t("signup.errors.passwordTooShort"));
      setPassword("");
      setConfirmPassword("");
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number");
      return;
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(openHours) || !timeRegex.test(closeHours)) {
      setError("Please enter valid time format (HH:MM)");
      return;
    }

    // Validate business hours logic
    const [openHour, openMin] = openHours.split(":").map(Number);
    const [closeHour, closeMin] = closeHours.split(":").map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    if (openTime >= closeTime) {
      setError("Opening hours must be before closing hours");
      return;
    }

    try {
      setIsLoading(true);

      const result = await registerEnterprise({
        username,
        email,
        password,
        enterpriseName,
        address,
        phoneNumber,
        description,
        openHours,
        closeHours,
      });

      if (!result.success) {
        setError(
          result.error?.message || t("signup.errors.registrationFailed")
        );

        // Clear specific fields based on error type
        if (result.error?.field === "username") {
          setUsername("");
        } else if (result.error?.field === "email") {
          setEmail("");
        } else if (result.error?.field === "enterpriseName") {
          setEnterpriseName("");
        } else if (result.error?.field === "phoneNumber") {
          setPhoneNumber("");
        } else {
          // Clear sensitive fields for general errors
          setPassword("");
          setConfirmPassword("");
        }
        return;
      }

      // Registration successful - show success popup
      setShowSuccessPopup(true);
    } catch (err) {
      setError(t("signup.errors.unexpectedError"));
      setPassword("");
      setConfirmPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while translations are loading
  if (i18nLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-5xl bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Mobile logo */}
          <div className="md:hidden w-full bg-white flex items-center justify-center py-4">
            <div className="w-20 h-20">
              <img
                src={`${process.env.BASE_IMAGE_URL}/logo.png`}
                alt="Hanala Food Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Registration form */}
          <div className="w-full md:w-2/3 bg-blue-100 flex items-center justify-center p-3 sm:p-6 md:p-8">
            <div className="w-full max-w-2xl mx-auto">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-4 sm:mb-6 text-center">
                Enterprise Registration
              </h1>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-4"
              >
                {/* Account Information Section */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Account Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("common.username")} *
                      </label>
                      <Input
                        type="text"
                        placeholder={t("common.usernamePlaceholder")}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onFocus={handleFieldFocus}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        placeholder="enterprise@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={handleFieldFocus}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("common.password")} *
                      </label>
                      <div className="relative">
                        <Input
                          type={
                            passwordToggle.showPassword ? "text" : "password"
                          }
                          placeholder={t("common.passwordPlaceholder")}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={handleFieldFocus}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={passwordToggle.togglePasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {passwordToggle.showPassword ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      <PasswordStrength password={password} className="mt-2" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Input
                          type={
                            confirmPasswordToggle.showPassword
                              ? "text"
                              : "password"
                          }
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onFocus={handleFieldFocus}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={
                            confirmPasswordToggle.togglePasswordVisibility
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {confirmPasswordToggle.showPassword ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enterprise Information Section */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Enterprise Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enterprise Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="Your restaurant/business name"
                        value={enterpriseName}
                        onChange={(e) => setEnterpriseName(e.target.value)}
                        onFocus={handleFieldFocus}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        placeholder="+84 123 456 789"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        onFocus={handleFieldFocus}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <Input
                        type="text"
                        placeholder="Full business address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onFocus={handleFieldFocus}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opening Hours *
                      </label>
                      <Input
                        type="time"
                        value={openHours}
                        onChange={(e) => setOpenHours(e.target.value)}
                        onFocus={handleFieldFocus}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Closing Hours *
                      </label>
                      <Input
                        type="time"
                        value={closeHours}
                        onChange={(e) => setCloseHours(e.target.value)}
                        onFocus={handleFieldFocus}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        placeholder="Brief description about your business"
                        value={description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                        onFocus={handleFieldFocus}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all min-h-[100px] resize-none"
                        maxLength={255}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {description.length}/255 characters
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                <ErrorDisplay
                  error={error}
                  type="error"
                  onClose={() => setError("")}
                  className="mb-4"
                />

                {/* Actions */}
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-red-500 hover:bg-red-600 text-white h-12 rounded-lg font-medium transition-all flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Enterprise Account...
                      </div>
                    ) : (
                      "Create Enterprise Account"
                    )}
                  </Button>
                </div>

                {/* Footer */}
                <div className="text-center pt-4">
                  <p className="text-gray-600 text-sm">
                    Already have an enterprise account?{" "}
                    <Link
                      href="/enterprise-signin"
                      className="text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Looking for a customer account?{" "}
                    <Link
                      href="/signup"
                      className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
                    >
                      Register as Customer
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Desktop logo */}
          <div className="hidden md:flex w-1/3 bg-white items-center justify-center relative p-6">
            <img
              src={`${process.env.BASE_IMAGE_URL}/logo.png`}
              alt="Hanala Food Logo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </div>

      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        autoClose={false}
      />
    </div>
  );
}
