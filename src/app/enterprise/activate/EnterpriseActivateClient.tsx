"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Lock, Mail, Phone, Clock } from "lucide-react"
import { useToast } from "@/contexts/toast-context"
import { useTimeHhmm } from "@/hooks/use-time-hhmm"
import EnterpriseLocationPicker from "@/components/admin/EnterpriseLocationPicker"
import {
  enterpriseActivationSendOtp,
  enterpriseActivationStep1,
  enterpriseActivationStep3,
  enterpriseActivationVerifyOtp,
  verifyEnterpriseInvite,
} from "@/services/enterprise-activation.service"

type Step = 1 | 2 | 3

export default function EnterpriseActivateClient() {
  const router = useRouter()
  const sp = useSearchParams()
  const token = sp.get("token") || ""
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const [invitation, setInvitation] = useState<{
    email: string
    phoneNumber: string
    enterpriseName: string | null
    expiresAt: string
  } | null>(null)

  const [step1, setStep1] = useState({
    enterpriseName: "",
    password: "",
  })
  const [otp, setOtp] = useState("")

  const [step3, setStep3] = useState({
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
    openHours: "00:00",
    closeHours: "00:00",
    description: "",
  })

  const openTime = useTimeHhmm("00:00")
  const closeTime = useTimeHhmm("00:00")

  useEffect(() => {
    const run = async () => {
      try {
        const res = await verifyEnterpriseInvite(token)
        setInvitation(res.invitation)
        setStep1((p) => ({
          ...p,
          enterpriseName: res.invitation.enterpriseName || "",
        }))
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Invalid or expired invitation", "error", 6000)
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [token, showToast])

  useEffect(() => {
    setStep3((p) => ({ ...p, openHours: openTime.value }))
  }, [openTime.value])
  useEffect(() => {
    setStep3((p) => ({ ...p, closeHours: closeTime.value }))
  }, [closeTime.value])

  const step1CanContinue = useMemo(() => {
    const name = step1.enterpriseName.trim()
    const pw = step1.password
    return name.length > 0 && pw.length >= 8
  }, [step1.enterpriseName, step1.password])

  const step2CanContinue = useMemo(() => /^\d{6}$/.test(otp.trim()), [otp])

  const step3CanFinish = useMemo(() => {
    const addressOk = step3.address.trim().length > 0
    const locOk = step3.latitude !== null && step3.longitude !== null
    const timeOk = /^\d{2}:\d{2}$/.test(step3.openHours) && /^\d{2}:\d{2}$/.test(step3.closeHours)
    return addressOk && locOk && timeOk
  }, [step3.address, step3.latitude, step3.longitude, step3.openHours, step3.closeHours])

  async function onSubmitStep1() {
    if (!step1CanContinue) return
    startTransition(async () => {
      try {
        await enterpriseActivationStep1({
          token,
          enterpriseName: step1.enterpriseName.trim(),
          password: step1.password,
        })
        showToast("Step 1 saved", "success", 2500)
        setStep(2)
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Step 1 failed", "error", 5000)
      }
    })
  }

  async function onSendOtp() {
    startTransition(async () => {
      try {
        await enterpriseActivationSendOtp({ token })
        showToast("OTP sent to your email", "success", 3000)
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Failed to send OTP", "error", 5000)
      }
    })
  }

  async function onVerifyOtp() {
    if (!step2CanContinue) return
    startTransition(async () => {
      try {
        await enterpriseActivationVerifyOtp({ token, otp: otp.trim() })
        showToast("OTP verified", "success", 2500)
        setStep(3)
      } catch (e) {
        showToast(e instanceof Error ? e.message : "OTP verify failed", "error", 5000)
      }
    })
  }

  async function onFinish() {
    if (!step3CanFinish) return
    if (step3.latitude === null || step3.longitude === null) return
    startTransition(async () => {
      try {
        await enterpriseActivationStep3({
          token,
          address: step3.address.trim(),
          latitude: step3.latitude,
          longitude: step3.longitude,
          openHours: step3.openHours,
          closeHours: step3.closeHours,
          description: step3.description?.trim() ? step3.description.trim() : undefined,
        })
        showToast("Account activated. Please sign in.", "success", 4000)
        router.replace("/signin")
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Activation failed", "error", 6000)
      }
    })
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading…</div>
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-500 px-6 py-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Enterprise activation
                </h1>
                <p className="mt-1 text-sm text-white/85">
                  Complete your registration in 3 steps.
                </p>
              </div>
              {invitation && (
                <div className="text-xs text-white/90 space-y-1 text-right">
                  <div className="inline-flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {invitation.email}
                  </div>
                  <div className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {invitation.phoneNumber}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className={`h-1.5 rounded-full ${step === 1 ? "bg-white" : "bg-white/50"}`} />
              <div className={`h-1.5 rounded-full ${step === 2 ? "bg-white" : "bg-white/35"}`} />
              <div className={`h-1.5 rounded-full ${step === 3 ? "bg-white" : "bg-white/20"}`} />
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-white/90">
              <span className={`px-2 py-0.5 rounded-full border border-white/40 ${step===1 ? "bg-white/20" : ""}`}>Step 1</span>
              <span>→</span>
              <span className={`px-2 py-0.5 rounded-full border border-white/40 ${step===2 ? "bg-white/20" : ""}`}>Step 2</span>
              <span>→</span>
              <span className={`px-2 py-0.5 rounded-full border border-white/40 ${step===3 ? "bg-white/20" : ""}`}>Step 3</span>
            </div>
          </div>

          <div className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Enterprise name
                  </label>
                  <input
                    className="border rounded-md h-10 px-3 w-full border-slate-200 focus:ring-2 focus:ring-sky-200"
                    value={step1.enterpriseName}
                    onChange={(e) => setStep1((p) => ({ ...p, enterpriseName: e.target.value }))}
                    placeholder="Company LLC"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Password (min 8 chars)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      className="border rounded-md h-10 pl-9 pr-3 w-full border-slate-200 focus:ring-2 focus:ring-sky-200"
                      value={step1.password}
                      onChange={(e) => setStep1((p) => ({ ...p, password: e.target.value }))}
                      placeholder="********"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    disabled={isPending || !step1CanContinue}
                    onClick={() => void onSubmitStep1()}
                    className="h-10 px-5 rounded-md bg-gradient-to-r from-indigo-600 to-sky-600 text-white disabled:opacity-60 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-sky-700"
                  >
                    {isPending ? "Saving…" : "Continue"}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Click “Send OTP” to receive a 6-digit code via email (expires quickly).
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={isPending}
                    onClick={() => void onSendOtp()}
                    className="h-10 px-4 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60"
                  >
                    Send OTP
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => setStep(1)}
                    className="h-10 px-4 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60"
                  >
                    Back
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    OTP code
                  </label>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    className="border rounded-md h-10 px-3 w-full border-slate-200 focus:ring-2 focus:ring-sky-200 font-mono tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="123456"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    disabled={isPending || !step2CanContinue}
                    onClick={() => void onVerifyOtp()}
                    className="h-10 px-5 rounded-md bg-gradient-to-r from-indigo-600 to-sky-600 text-white disabled:opacity-60 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-sky-700"
                  >
                    {isPending ? "Verifying…" : "Verify"}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Fill enterprise profile details.
                </div>

                <EnterpriseLocationPicker
                  address={step3.address}
                  onAddressChange={(nextAddress) => setStep3((p) => ({ ...p, address: nextAddress }))}
                  latitude={step3.latitude}
                  longitude={step3.longitude}
                  onLocationChange={({ latitude, longitude }) =>
                    setStep3((p) => ({ ...p, latitude, longitude }))
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Open (HH:mm)
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        inputMode="numeric"
                        maxLength={5}
                        className="border rounded-md h-10 pl-9 pr-3 w-full border-slate-200 focus:ring-2 focus:ring-sky-200"
                        value={openTime.value}
                        onChange={() => {}}
                        onKeyDown={openTime.onKeyDown}
                        onPaste={openTime.onPaste}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Close (HH:mm)
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        inputMode="numeric"
                        maxLength={5}
                        className="border rounded-md h-10 pl-9 pr-3 w-full border-slate-200 focus:ring-2 focus:ring-sky-200"
                        value={closeTime.value}
                        onChange={() => {}}
                        onKeyDown={closeTime.onKeyDown}
                        onPaste={closeTime.onPaste}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    className="border rounded-md px-3 py-2 w-full border-slate-200 focus:ring-2 focus:ring-sky-200"
                    rows={3}
                    value={step3.description}
                    onChange={(e) => setStep3((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    disabled={isPending}
                    onClick={() => setStep(2)}
                    className="h-10 px-4 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-60"
                  >
                    Back
                  </button>
                  <button
                    disabled={isPending || !step3CanFinish}
                    onClick={() => void onFinish()}
                    className="h-10 px-5 rounded-md bg-gradient-to-r from-emerald-600 to-sky-600 text-white disabled:opacity-60 disabled:cursor-not-allowed hover:from-emerald-700 hover:to-sky-700"
                  >
                    {isPending ? "Activating…" : "Finish activation"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

