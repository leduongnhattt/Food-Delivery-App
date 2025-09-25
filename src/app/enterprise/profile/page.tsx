"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/services/api";

export default function EnterpriseProfile() {
  const [enterpriseName, setEnterpriseName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [openHours, setOpenHours] = useState("");
  const [closeHours, setCloseHours] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Get current profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const { enterprise } = await apiClient.get<{ enterprise: any }>(
          "/enterprise/profile"
        );

        setEnterpriseName(enterprise.EnterpriseName || "");
        setEmail(enterprise.account.Email || "");
        setAddress(enterprise.Address || "");
        setPhoneNumber(enterprise.PhoneNumber || "");
        setDescription(enterprise.Description || "");
        setOpenHours(enterprise.OpenHours || "");
        setCloseHours(enterprise.CloseHours || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage("Failed to load profile data");
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      const payload = {
        EnterpriseName: enterpriseName,
        Address: address,
        PhoneNumber: phoneNumber,
        Email: email,
        Description: description,
        OpenHours: openHours,
        CloseHours: closeHours,
      };

      await apiClient.put("/enterprise/profile", payload);

      setMessage("Profile updated successfully");
      setFile(null); // clear file
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Enterprise Profile</h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.includes("successfully")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grid layout 2x2 */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium">
              Enterprise Name *
            </label>
            <Input
              type="text"
              value={enterpriseName}
              onChange={(e) => setEnterpriseName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100"
              placeholder="Enterprise Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <Input
              type="email"
              disabled
              value={email}
              className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-200"
              placeholder="Email"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Address</label>
              <Input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100"
                placeholder="Address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <Input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100"
                placeholder="Phone Number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg h-[140px] bg-gray-100"
              placeholder="Description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Open Hours</label>
            <Input
              type="time"
              value={openHours}
              onChange={(e) => setOpenHours(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100"
              placeholder="Open Hours"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Close Hours</label>
            <Input
              type="time"
              value={closeHours}
              onChange={(e) => setCloseHours(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100"
              placeholder="Close Hours"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
