'use client';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { downloadCSV } from '@/lib/export';

export default function AppHeader({ title, subtitle, backHref, entries }) {
    const { data: session } = useSession();

    return (
        <header className="app-header">
            <div>
                <h1 className="app-title">{title}</h1>
                {subtitle && <p className="app-subtitle">{subtitle}</p>}
            </div>
            <div className="header-actions">
                {backHref ? (
                    <Link href={backHref} className="export-btn">← Volver</Link>
                ) : (
                    <>
                        {entries !== undefined && (
                            <button
                                className="export-btn"
                                onClick={() => downloadCSV(entries)}
                                disabled={!entries.length}
                            >
                                ↓ CSV
                            </button>
                        )}
                        {session?.user?.isAdmin && (
                            <Link href="/admin" className="export-btn">Admin</Link>
                        )}
                        <button
                            className="export-btn"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                        >
                            Salir
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
