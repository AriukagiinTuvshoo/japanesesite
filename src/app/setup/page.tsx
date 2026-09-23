export default function SetupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-700">JLPT Master</p>
      <h1 className="text-3xl font-semibold">Supabase холболт шаардлагатай</h1>
      <p className="mt-4 text-muted-foreground">Supabase төсөл үүсгээд migration-уудаа ажиллуулж, Vercel-ийн орчны тохиргоонд project URL болон publishable key-гээ нэмнэ үү.</p>
      <p className="mt-3 text-sm text-muted-foreground">Нууц түлхүүрийг browser-д ил гаргах <code>NEXT_PUBLIC_</code> орчны хувьсагчид бүү хадгал.</p>
    </main>
  )
}
