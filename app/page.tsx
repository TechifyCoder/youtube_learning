import { redirect } from 'next/navigation'

// Root page redirects to /dashboard (or /login if not authenticated)
// The middleware handles the auth redirect — this handles the root URL redirect
export default function RootPage() {
  redirect('/dashboard')
}
