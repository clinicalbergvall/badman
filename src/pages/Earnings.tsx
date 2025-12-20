import { Card, Button } from '@/components/ui'
import CleanerLayout from '@/components/CleanerLayout'

export default function Earnings() {
    return (
        <CleanerLayout currentPage="earnings">
            <div className="space-y-6">
                <div className="text-center animate-up">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Earnings</h1>
                    <p className="text-gray-600">Track your payouts and income history.</p>
                </div>

                <Card className="p-8 text-center bg-white border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">💰</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
                    <p className="text-gray-600 mb-6">
                        We are rolling out detailed earnings analytics soon.
                        <br />
                        For now, check your M-PESA messages for immediate payout confirmations.
                    </p>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                </Card>
            </div>
        </CleanerLayout>
    )
}
