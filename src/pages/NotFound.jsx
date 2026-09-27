import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { useAuth } from '../store/AuthContext.jsx'
import { landingFor } from '../lib/nav.js'
import { Card, EmptyState } from '../components/ui/Primitives.jsx'

// Reached at the top level, so it can render with no one signed in and no
// shell around it. Both cases are handled here.
export function NotFound() {
  const { user } = useAuth()
  const to = user ? landingFor(user.role) : '/'
  const label = user ? 'Back to your home screen' : 'Back to the shop'

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-5">
      <Card className="w-full">
        <EmptyState
          icon={FileQuestion}
          title="That page does not exist"
          message="The address you opened is not part of the system."
        >
          <Link to={to} className="mt-2 text-sm font-semibold text-ink hover:underline">
            {label}
          </Link>
        </EmptyState>
      </Card>
    </div>
  )
}
