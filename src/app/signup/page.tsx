"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="flex min-h-screen">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="max-w-sm w-full p-6">
          <h1 className="text-2xl font-bold mb-2">SIGN IN</h1>

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

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Confirm Password</label>
            <Input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Sign in button */}
          <Button className="w-full bg-red-500 hover:bg-red-600 text-white mb-3">
            Sign in
          </Button>

          {/* already have an account */}
          <p className="text-sm text-gray-500 mt-4 text-center">
            Already have an account?{" "}
            <Link href="/signin" className="text-red-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - logo image */}
      <div className="hidden md:block w-1/2 bg-white flex items-center justify-center">
        {/* Chừa div này lại thêm ảnh sau */}
        <div className="w-3/4 h-3/4 border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
          Your image here
        </div>
      </div>
    </div>
  );
}
