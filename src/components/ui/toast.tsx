"use client";

import { useCallback, useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

export function Toast({ 
  message, 
  type = "error", 
  duration = 5000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Wait for animation to complete
  }, [onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          container: "bg-green-50 border-green-200",
          text: "text-green-800",
          icon: "text-green-600"
        };
      case "warning":
        return {
          container: "bg-yellow-50 border-yellow-200",
          text: "text-yellow-800",
          icon: "text-yellow-600"
        };
      case "info":
        return {
          container: "bg-blue-50 border-blue-200",
          text: "text-blue-800",
          icon: "text-blue-600"
        };
      default: // error
        return {
          container: "bg-red-50 border-red-200",
          text: "text-red-800",
          icon: "text-red-600"
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case "info":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default: // error
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const styles = getStyles();

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] transform transition-all duration-300 ease-in-out">
      <div className={`p-4 border rounded-lg shadow-lg max-w-sm ${styles.container}`}>
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${styles.text}`}>
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ${styles.icon} hover:opacity-70 transition-opacity`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
