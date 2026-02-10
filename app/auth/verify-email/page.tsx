import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>We&apos;ve sent you a verification link</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Please check your email and click the verification link to activate your account. You can close this
                page.
              </p>
              <Link href="/auth/login" className="text-sm text-primary hover:underline">
                Back to login
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
