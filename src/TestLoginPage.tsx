import { LoginForm } from './components/ui'

export default function TestLoginPage() {
    return (
        <div>
            <LoginForm onAuthSuccess={(user) => {
                console.log('Login successful:', user)
                window.location.href = '/'
            }} />
        </div>
    )
}
