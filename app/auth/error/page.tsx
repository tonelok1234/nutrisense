import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {params?.error_description ? (
                <p className="text-sm text-muted-foreground mb-4">{params.error_description}</p>
              ) : params?.error ? (
                <p className="text-sm text-muted-foreground mb-4">Error code: {params.error}</p>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">An authentication error occurred.</p>
              )}
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
