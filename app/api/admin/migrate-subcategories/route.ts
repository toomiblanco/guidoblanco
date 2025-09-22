import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar que el usuario sea admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Ejecutar la migración
    await supabase.rpc('execute_migration_subcategories')

    return NextResponse.json({ message: "Migración ejecutada correctamente" })
  } catch (error) {
    console.error("Error en migración:", error)
    return NextResponse.json(
      { error: "Error al ejecutar la migración" },
      { status: 500 }
    )
  }
}