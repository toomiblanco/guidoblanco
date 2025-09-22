import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              GUIDO BLANCO
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Error de Autenticación</CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <p className="text-sm text-muted-foreground">Error: {params.error}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Ocurrió un error durante la autenticación.</p>
              )}
              <div className="mt-4 text-center">
                <Link href="/auth/login" className="text-primary underline underline-offset-4">
                  Intentar nuevamente
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
