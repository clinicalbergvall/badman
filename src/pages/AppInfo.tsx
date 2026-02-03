import CleanerLayout from "@/components/CleanerLayout";
import { Card } from "@/components/ui";

const AppInfo = () => {
    const steps = [
        {
            title: "1. Find Opportunities",
            description: "Browse the 'Jobs' tab to see available detailing requests in your area. Review vehicle types, service packages, and total earnings before accepting.",
            icon: "🔎"
        },
        {
            title: "2. Accept & Navigate",
            description: "Once you accept a job, use the built-in navigation map to head to the client's location. The client will be notified when you are on your way.",
            icon: "🚗"
        },
        {
            title: "3. Arrival & Verification",
            description: "Upon arrival, the client will verify your identity. This ensure safety and trust for both parties before the service begins.",
            icon: "✅"
        },
        {
            title: "4. Perform Detail",
            description: "Deliver high-quality detailing. Use the 'Chat' feature if you need to clarify specific requirements or send progress updates.",
            icon: "🧼"
        },
        {
            title: "5. Complete & Earn",
            description: "Mark the job as complete to trigger payment. Your earnings will be instantly available in your history once confirmed.",
            icon: "💰"
        }
    ];

    const dataPolicies = [
        {
            title: "Real-Time Location",
            description: "We use your location only when the app is active to match you with jobs nearby and provide live tracking to the client once you are on your way.",
            icon: "📍"
        },
        {
            title: "Verified Identity",
            description: "Your identification data is encrypted and used solely for security verification. We never share your sensitive documents with clients.",
            icon: "🛡️"
        },
        {
            title: "M-PESA Payouts",
            description: "We maintain a secure ledger of your earnings. You can audit every transaction, including tips and base payouts, anytime.",
            icon: "📱"
        },
        {
            title: "Privacy First",
            description: "CleanCloak never sells your personal data to third parties. Your privacy is protected by end-to-end encryption for all messages.",
            icon: "🔒"
        }
    ];

    return (
        <CleanerLayout currentPage="info">
            <div className="max-w-4xl mx-auto space-y-12 pb-20 px-4 animate-in fade-in duration-700">
                {/* Header */}
                <div className="text-center space-y-4 pt-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                        App Guide & Safety
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Learn how to maximize your earnings while keeping your data secure and staying safe on the job.
                    </p>
                </div>

                {/* How it Works Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                        <span className="text-2xl">📖</span>
                        <h2 className="text-2xl font-bold text-gray-800">How it Works</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-1">
                        {steps.map((step, index) => (
                            <Card key={index} className="p-6 bg-white/50 backdrop-blur-sm border-gray-100 hover:shadow-md transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl bg-yellow-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                        {step.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg text-gray-900">{step.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Data Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                        <span className="text-2xl">🔐</span>
                        <h2 className="text-2xl font-bold text-gray-800">Data & Privacy</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {dataPolicies.map((policy, index) => (
                            <Card key={index} className="p-6 bg-gray-900 text-white border-gray-800 hover:border-yellow-500/50 transition-colors shadow-xl">
                                <div className="space-y-4">
                                    <div className="text-2xl opacity-80">{policy.icon}</div>
                                    <h3 className="font-bold text-white text-lg">{policy.title}</h3>
                                    <p className="text-gray-400 text-sm leading-snug">{policy.description}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Market Ready Footer */}
                <div className="space-y-4">
                    <div className="bg-yellow-100/50 rounded-3xl p-8 border border-yellow-200 text-center">
                        <p className="text-yellow-800 font-semibold mb-2">Build with Trust</p>
                        <p className="text-gray-700 text-sm">
                            CleanCloak is designed to be the safest and most transparent platform for detailing professionals.
                        </p>
                    </div>

                    <Card className="p-6 border-dashed border-2 border-gray-200 bg-gray-50/50">
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Developer Support</h3>
                                <p className="text-sm text-gray-600 mb-2">Technical issues or feedback? Contact CleanCloak developers at:</p>
                                <a href="tel:0718277282" className="text-lg font-bold text-yellow-600 hover:text-yellow-700 transition-colors">
                                    0718 277 282
                                </a>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </CleanerLayout>
    );
};

export default AppInfo;
