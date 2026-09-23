import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: account, error } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
  if (error || !['admin', 'super_admin'].includes(account?.role ?? '')) redirect('/forbidden')
  return children
}
