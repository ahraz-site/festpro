"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { acceptInvite } from "@/lib/actions/organization"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function handle() {
      if (!token) {
        setStatus("error")
        setMessage("No invitation token provided.")
        return
      }

      const result = await acceptInvite(token)
      if (result.error) {
        setStatus("error")
        setMessage(result.error)
      } else {
        setStatus("success")
        setMessage("You have successfully joined the organization!")
        setTimeout(() => {
          if (result.orgId) {
            router.push(`/dashboard/organization/${result.orgId}`)
          } else {
            router.push("/dashboard")
          }
        }, 2000)
      }
    }
    handle()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            {status === "loading" && "Processing your invitation..."}
            {status === "success" && "Redirecting to your dashboard..."}
            {status === "error" && "Invitation error"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="py-8">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
            </div>
          )}
          {status === "success" && (
            <div className="py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="mt-4 text-sm text-gray-600">{message}</p>
            </div>
          )}
          {status === "error" && (
            <div className="py-8">
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
              <p className="mt-4 text-sm text-red-600">{message}</p>
              <div className="mt-6 flex gap-3 justify-center">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
                <Button onClick={() => router.push("/login")}>
                  Sign In
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  )
}
