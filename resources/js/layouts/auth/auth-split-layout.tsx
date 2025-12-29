import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />

                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-xl font-bold tracking-tight"
                >
                    <div className="mr-3 flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20">
                        <FileText className="size-6 text-indigo-400" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        BANCOCK
                    </span>
                </Link>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden mb-8"
                    >
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl border-b-4 border-indigo-800">
                            <FileText className="size-8 text-white" />
                        </div>
                    </Link>
                    <div className="flex flex-col items-start gap-3 border-l-4 border-indigo-600 pl-6 sm:pl-0 sm:border-l-0 sm:items-center sm:text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                        <p className="text-md text-muted-foreground font-medium">
                            {description}
                        </p>
                    </div>
                    <div className="rounded-2xl border bg-card p-2 sm:p-0 sm:border-0 sm:bg-transparent shadow-sm sm:shadow-none">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
