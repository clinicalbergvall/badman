import { Card, Button } from '@/components/ui';
import { Clock, CheckCircle, ShieldCheck } from 'lucide-react';

export default function VerificationPending() {

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 relative overflow-hidden font-inter">
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-400/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="max-w-lg w-full relative z-10">
        <Card className="p-8 border-gray-200 bg-white backdrop-blur-2xl shadow-2xl text-center">
          {/* Logo Section */}
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-300 border border-gray-100">
            <img src="/detail-logo.jpg" className="w-full h-full object-cover rounded-2xl" alt="CleanCloak Logo" />
          </div>
          
          <h1 className="text-4xl font-black text-black mb-4 tracking-tight uppercase">
            Verification <span className="text-black">Pending</span>
          </h1>
          
          <div className="space-y-6 mb-10 text-left">
            <div className="flex items-center gap-3 text-black mb-2 justify-center">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-bold tracking-[0.2em] uppercase">Security Audit In Progress</span>
            </div>

            <p className="text-black leading-relaxed text-lg text-center font-medium px-4">
              Welcome to the <span className="text-black font-bold border-b-2 border-black">CleanCloak Family</span>! 
              Our elite team is currently conducting a thorough review of your profile to maintain our 
              premium service standards.
            </p>
            
            {/* Highly Visible Wait Message */}
            <div className="mt-8 p-6 bg-yellow-400 rounded-2xl border-l-[6px] border-yellow-600 shadow-xl transform hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-black/10 p-3 rounded-xl">
                  <Clock className="w-8 h-8 text-black" />
                </div>
                <div>
                  <p className="text-black/70 text-sm font-bold uppercase tracking-wider mb-1">Estimated Wait Time</p>
                  <p className="text-black text-2xl font-black leading-tight">
                    24 - 48 HOURS
                  </p>
                </div>
              </div>
              <p className="text-black/80 mt-3 text-sm font-medium leading-relaxed">
                You will receive a notification and an email once your specialized access has been granted.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button 
              className="w-full h-14 bg-black text-white hover:bg-gray-800 font-black text-lg rounded-xl transition-all duration-300 shadow-lg group"
              onClick={() => window.location.reload()}
            >
              <div className="flex items-center justify-center gap-2">
                <span>REFRESH STATUS</span>
                <CheckCircle className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Button>
            
            <div className="flex flex-col items-center gap-4">

            </div>
          </div>
          

        </Card>
      </div>
    </div>
  );
}
