import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background p-6 md:p-10">
            {/* Background Aesthetic */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
                <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-6">
                        <Link
                            href={home()}
                            className="group flex flex-col items-center gap-3 transition-transform hover:scale-105"
                        >
                            <div className="flex size-14 items-center justify-center rounded-2xl border-b-4 border-indigo-800 bg-indigo-600 shadow-xl transition-all group-hover:shadow-indigo-500/20">
                                <FileText className="size-8 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-black tracking-tighter text-transparent">
                                BANCO DE PDF
                            </span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {title}
                            </h1>
                            <p className="text-sm font-medium text-balance text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-3xl border bg-card/50 p-8 shadow-xl backdrop-blur-sm dark:bg-zinc-900/50">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
