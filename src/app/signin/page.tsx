"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorDisplay } from "@/components/ui/error-display";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/client-auth";
import { setAuthToken } from "@/lib/auth-helpers";
import { usePasswordToggle } from "@/hooks/use-password-toggle";
import { useTranslations } from "@/lib/i18n";
import GoogleAuthButton from "@/components/ui/google-auth-button";

export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isLoading: i18nLoading } = useTranslations();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // const [successMessage, setSuccessMessage] = useState(""); // REMOVED
  const [isLoading, setIsLoading] = useState(false);
  
  // Password toggle hook
  const passwordToggle = usePasswordToggle();

  // Check for password reset success message - REMOVED
  // useEffect(() => {
  //   const message = searchParams.get('message');
  //   if (message === 'password-reset-success') {
  //     setSuccessMessage(t("signin.success.passwordResetSuccess"));
  //     // Clear the success message after 5 seconds
  //     setTimeout(() => setSuccessMessage(""), 5000);
  //   }
  // }, [searchParams, t]);

  // Clear error when user starts typing
  const handleFieldFocus = () => {
    if (error) {
      setError("");
    }
  };

  // Check for registration success message - no longer needed since we use popup
  // useEffect(() => {
  //   const registered = searchParams.get('registered');
  //   if (registered === 'success') {
  //     setSuccessMessage(t("signin.success.registrationComplete"));
  //     // Clear the success message after 5 seconds
  //     setTimeout(() => setSuccessMessage(""), 5000);
  //   }
  // }, [searchParams, t]);

  const handleSubmit = async () => {
    // Reset error state
    setError("");
    
    try {
      setIsLoading(true);
      
      const result = await loginUser({
        username,
        password
      });
      
      if (!result.success) {
        setError(result.error?.message || t("signin.errors.loginFailed"));
        // Clear password field for invalid credentials
        setPassword("");
        return;
      }
      
      // Check if user is customer (only customers can use this login)
      if (result.data?.user?.role !== 'customer') {
        setError("Access denied. This login is for customers only. Please use the appropriate portal.");
        setUsername("");
        setPassword("");
        return;
      }
      
      // Store only the access token
      setAuthToken(result.data.accessToken);
      
      // Login successful - redirect to home page
      router.replace("/");
    } catch (err) {
      setError(t("signin.errors.unexpectedError"));
      setUsername("");
      setPassword("");
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
    <div className="h-screen bg-gray-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:min-h-[600px]">
          <div className="md:hidden w-full bg-white flex items-center justify-center py-4">
            <div className="w-20 h-20">
              <img 
                src={`${process.env.BASE_IMAGE_URL}/logo.png`}
                alt="Hanala Food Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          {/* Sign in form */}
          <div className="w-full md:w-1/2 bg-blue-100 flex items-center justify-center p-3 sm:p-6 md:p-8">
            <div className="w-full max-w-sm mx-auto">
              {/* Header */}
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-8 text-center">{t("signin.title")}</h1>

              {/* Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("common.username")}
                  </label>
                  <Input
                    type="text"
                    placeholder={t("common.usernamePlaceholder")}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={handleFieldFocus}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all text-sm sm:text-base shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("common.password")}
                  </label>
                  <div className="relative">
                    <Input
                      type={passwordToggle.showPassword ? "text" : "password"}
                      placeholder={t("common.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={handleFieldFocus}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 transition-all pr-10 sm:pr-12 text-sm sm:text-base shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={passwordToggle.togglePasswordVisibility}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {passwordToggle.showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                  >
                    {t("signin.forgotPassword")}
                  </Link>
                </div>

                {/* Error message */}
                <ErrorDisplay 
                  error={error} 
                  type="error"
                  onClose={() => setError("")}
                  className="mb-4"
                />

                {/* Success message - REMOVED */}
                {/* {successMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm mb-4">
                    {successMessage}
                  </div>
                )} */}
                
                {/* Actions */}
                <div className="space-y-2">
                  <Button 
                    type="submit"
                    className="w-full bg-red-500 hover:bg-red-600 text-white h-12 rounded-lg font-medium transition-all text-sm sm:text-base flex items-center justify-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {t("signin.signingIn")}
                      </div>
                    ) : (
                      t("signin.signInButton")
                    )}
                  </Button>

                  {/* Continue with Google */}
                  <GoogleAuthButton 
                    onError={(errorMessage) => setError(errorMessage)}
                  />
                </div>
              </form>

              {/* Footer */}
              <div className="mt-3 sm:mt-6 text-center space-y-2">
                <p className="text-gray-600 text-xs sm:text-base">
                  {t("signin.dontHaveAccount")}{" "}
                  <Link 
                    href="/signup" 
                    className="text-red-500 hover:text-red-600 font-medium transition-colors"
                  >
                    {t("common.signUp")}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex w-1/2 bg-white items-center justify-center relative p-6">
            <img 
              src={`${process.env.BASE_IMAGE_URL}/logo.png`}
              alt="Hanala Food Logo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
