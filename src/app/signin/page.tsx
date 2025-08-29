"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-screen">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="max-w-sm w-full p-6">
          <h1 className="text-2xl font-bold mb-2">WELCOME BACK</h1>
          <p className="text-gray-500 mb-6">Welcome back! Please enter your account</p>

          {/* Username */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Username</label>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block mb-1 text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Forgot password */}
          <div className="text-right mb-4">
            <Link href="/forgot-password" className="text-sm text-gray-500 hover:underline">
              Forgot password
            </Link>
          </div>

          {/* Sign in button */}
          <Button className="w-full bg-red-500 hover:bg-red-600 text-white mb-3">
            Sign in
          </Button>

          {/* Google sign in */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            Sign in with Google
          </Button>

          {/* Sign up link */}
          <p className="text-sm text-gray-500 mt-4 text-center">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-red-500 hover:underline">
              Sign up for free!
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Placeholder for your image */}
      <div className="hidden md:block w-1/2 bg-white flex items-center justify-center">
        {/* Chừa div này lại cho bạn thêm ảnh sau */}
        <div className="w-3/4 h-3/4 border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
          Your image here
        </div>
      </div>
    </div>
  );
}
