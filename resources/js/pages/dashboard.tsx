/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import clientsRoutes from '@/routes/clients'; // Asegúrate de importar esto correctamente
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Building2,
    Download,
    FileText,
    HardDrive,
    TrendingUp,
    Users,
} from 'lucide-react';

// ... (Las interfaces se mantienen igual)
interface Stats {
    total_clients: number;
    total_documents: number;
    total_storage: number;
    formatted_storage: string;
    total_downloads: number;
}

interface RecentDocument {
    id: number;
    title: string;
    formatted_size: string;
    created_at: string;
    client: {
        id: string;
        name: string;
        code: string;
    };
}

interface TopClient {
    id: string;
    name: string;
    code: string;
    documents_count: number;
    formatted_total_size: string;
}

interface CategoryDistribution {
    category: string;
    count: number;
}

interface Props {
    stats: Stats;
    recentDocuments: RecentDocument[];
    topClients: TopClient[];
    categoriesDistribution: CategoryDistribution[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({
    stats,
    recentDocuments,
    topClients,
    categoriesDistribution,
}: Props) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Hola, {auth.user.name}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Bienvenido de nuevo. Aquí tienes el resumen de
                            actividad del Banco de PDF.
                        </p>
                    </div>
                </div>

                {/* --- ESTADÍSTICAS PRINCIPALES --- */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Clientes"
                        value={stats.total_clients}
                        desc="Clientes activos"
                        icon={Users}
                        color="blue"
                    />
                    <StatsCard
                        title="Documentos"
                        value={stats.total_documents}
                        desc="PDFs almacenados"
                        icon={FileText}
                        color="green"
                    />
                    <StatsCard
                        title="Almacenamiento"
                        value={stats.formatted_storage}
                        desc="Espacio utilizado"
                        icon={HardDrive}
                        color="orange"
                    />
                    <StatsCard
                        title="Descargas"
                        value={stats.total_downloads}
                        desc="Total histórico"
                        icon={Download}
                        color="purple"
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-7">
                    {/* --- DOCUMENTOS RECIENTES (Ocupa 4 columnas) --- */}
                    <Card className="col-span-1 h-full shadow-sm md:col-span-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-muted-foreground" />
                                Actividad Reciente
                            </CardTitle>
                            <CardDescription>
                                Últimos documentos incorporados al sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentDocuments.length > 0 ? (
                                <div className="space-y-0 divide-y">
                                    {recentDocuments.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="group -mx-2 flex items-center justify-between rounded-md px-2 py-4 transition-colors first:pt-0 last:pb-0 hover:bg-muted/30"
                                        >
                                            <div className="flex min-w-0 items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <Link
                                                        href={
                                                            clientsRoutes.show(
                                                                doc.client.id,
                                                            ).url
                                                        }
                                                        className="block truncate leading-none font-medium transition-colors hover:text-primary"
                                                    >
                                                        {doc.title}
                                                    </Link>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="font-medium text-foreground">
                                                            {doc.client.name}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {doc.formatted_size}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right text-xs whitespace-nowrap text-muted-foreground">
                                                {doc.created_at}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={FileText}
                                    text="No hay actividad reciente"
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* --- TOP CLIENTES (Ocupa 3 columnas) --- */}
                    <Card className="col-span-1 h-full shadow-sm md:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                Top Clientes
                            </CardTitle>
                            <CardDescription>
                                Mayor volumen de archivos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topClients.length > 0 ? (
                                <div className="space-y-5">
                                    {topClients.map((client, index) => (
                                        <div
                                            key={client.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                                                        index === 0
                                                            ? 'bg-yellow-100 text-yellow-700 ring-4 ring-yellow-50'
                                                            : index === 1
                                                              ? 'bg-zinc-100 text-zinc-700'
                                                              : 'bg-zinc-50 text-zinc-500',
                                                    )}
                                                >
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <Link
                                                        href={
                                                            clientsRoutes.show(
                                                                client.id,
                                                            ).url
                                                        }
                                                        className="text-sm font-medium hover:underline"
                                                    >
                                                        {client.name}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">
                                                        {client.code}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-sm font-bold">
                                                    {client.documents_count}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase">
                                                    Docs
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Building2}
                                    text="Sin datos aún"
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* --- DISTRIBUCIÓN POR CATEGORÍAS --- */}
                {categoriesDistribution.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="px-1 text-lg font-semibold tracking-tight">
                            Explorar por Categorías
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {categoriesDistribution.map((item) => (
                                <Link
                                    key={item.category}
                                    href={`/documents?category=${encodeURIComponent(item.category)}`}
                                    className="group block"
                                >
                                    <Card className="h-full border transition-all hover:border-primary/50 hover:shadow-md">
                                        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                            <div className="mb-3 rounded-full bg-secondary p-3 transition-transform group-hover:scale-110">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="text-2xl font-bold tracking-tight">
                                                {item.count}
                                            </div>
                                            <div className="mt-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                {item.category}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

// --- SUBCOMPONENTES PARA LIMPIAR EL CÓDIGO ---

function StatsCard({ title, value, desc, icon: Icon, color }: any) {
    const colorStyles = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    };

    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div
                    className={cn(
                        'rounded-lg p-2',
                        colorStyles[color as keyof typeof colorStyles],
                    )}
                >
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </CardContent>
        </Card>
    );
}

function EmptyState({ icon: Icon, text }: any) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground/50">
            <Icon className="mb-2 h-10 w-10 opacity-20" />
            <p className="text-sm">{text}</p>
        </div>
    );
}
