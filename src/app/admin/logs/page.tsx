import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ScrollText } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');
    if (session.user.role !== 'SUPER_ADMIN') {
        return (
            <div className="p-8 text-center text-red-500">
                Unauthorized: Only Super Admins can view audit logs.
            </div>
        );
    }

    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
            admin: {
                select: { name: true, email: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
                <p className="text-slate-400">View recent system actions and security events.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-300">
                                <th className="p-4 font-semibold">Time</th>
                                <th className="p-4 font-semibold">Admin</th>
                                <th className="p-4 font-semibold">Action</th>
                                <th className="p-4 font-semibold">Entity ID</th>
                                <th className="p-4 font-semibold">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-400 text-sm">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-white">
                                            {log.admin.name || log.admin.email}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold
                                                ${log.action.includes('DELETE') ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-xs text-slate-500">
                                            {log.entityId}
                                        </td>
                                        <td className="p-4 max-w-xs truncate" title={log.details || ''}>
                                            {log.details}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
