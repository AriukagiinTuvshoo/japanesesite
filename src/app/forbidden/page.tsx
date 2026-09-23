import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-700">403</p>
      <h1 className="text-3xl font-semibold">Энэ хэсэгт хандах эрхгүй</h1>
      <p className="mt-4 text-muted-foreground">Админ эрхийг сервер баталгаажуулдаг. Хэрэглэгч өөрөө эрхээ өөрчлөх боломжгүй.</p>
      <Link className="mt-6 w-fit rounded-lg bg-primary px-4 py-2 text-primary-foreground" href="/dashboard">Хичээл рүү буцах</Link>
    </main>
  )
}
