import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import MediaManager from "./components/MediaManager"
import { ImageIcon, ShieldCheck } from "lucide-react"

export default async function MediaPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        redirect('/admin');
    }

    return (
        <div className="space-y-8 p-4 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-brand-surface to-brand-bg p-8 rounded-3xl border border-brand-border shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-blue-500/10" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <ImageIcon className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-brand-text tracking-tight">Media Manager</h1>
                    </div>
                    <p className="text-brand-text-muted max-w-xl">
                        Manage all shipment proof images and videos in one place. Delete old media to free up storage space.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-4 bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl max-w-xs">
                    <ShieldCheck className="w-8 h-8 text-orange-400 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-orange-400 uppercase tracking-wider">Retention Policy</p>
                        <p className="text-xs text-orange-400/80 leading-relaxed">
                            Media less than 30 days old is protected from deletion to ensure data integrity.
                        </p>
                    </div>
                </div>
            </div>

            <MediaManager />
        </div>
    )
}
