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
import clientsRoutes from '@/routes/clients';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    FileText,
    HardDrive,
    Users,
} from 'lucide-react';

// --- INTERFACES ---

interface Stats {
    total_clients: number;
    total_documents: number;
    total_storage: number;
    formatted_storage: string;
    total_missing_docs: number;
}

interface ClientWithoutDocs {
    id: string;
    name: string;
    code: string;
    created_at: string;
}

interface CategoryDistribution {
    category: string;
    count: number;
}

interface Props {
    stats: Stats;
    categoriesDistribution: CategoryDistribution[];
    clientsWithoutDocuments: ClientWithoutDocs[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({
    stats,
    categoriesDistribution,
    clientsWithoutDocuments,
}: Props) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* --- HEADER --- */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {auth.user.name}
                        </h1>
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
                    {/* Tarjeta corregida: Usa stats.total_missing_docs para el número real */}
                    <StatsCard
                        title="Clientes Pendientes"
                        value={stats.total_missing_docs}
                        desc="Sin archivos subidos"
                        icon={AlertCircle}
                        color="purple"
                    />
                </div>

                {/* --- SECCIÓN: LISTA DE CLIENTES SIN DOCUMENTOS --- */}
                <div className="grid gap-6">
                    <Card className="shadow-sm border-amber-200 dark:border-amber-900/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                                <AlertCircle className="h-5 w-5" />
                                Clientes sin Archivos Subidos
                            </CardTitle>
                            <CardDescription>
                                {/* Lógica dinámica para el texto descriptivo */}
                                {stats.total_missing_docs > clientsWithoutDocuments.length
                                    ? `Mostrando ${clientsWithoutDocuments.length} de ${stats.total_missing_docs} clientes que requieren atención`
                                    : 'Listado completo de clientes pendientes'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {clientsWithoutDocuments.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {clientsWithoutDocuments.map((client) => (
                                        <div
                                            key={client.id}
                                            className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                                        >
                                            <div className="space-y-1 overflow-hidden">
                                                <Link
                                                    href={clientsRoutes.show(client.id).url}
                                                    className="block truncate font-medium hover:underline hover:text-primary"
                                                    title={client.name}
                                                >
                                                    {client.name}
                                                </Link>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="font-mono bg-muted px-1 py-0.5 rounded">
                                                        {client.code}
                                                    </span>
                                                </div>
                                            </div>

                                            <Link
                                                href={clientsRoutes.show(client.id).url}
                                                className="ml-2 rounded-full bg-amber-100 p-2 text-amber-700 opacity-70 transition-all hover:scale-110 hover:opacity-100 dark:bg-amber-900/30 dark:text-amber-400"
                                                title="Ir a cargar archivos"
                                            >
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={FileText}
                                    text="¡Excelente! Todos los clientes tienen documentos."
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
                                <Card key={item.category} className="h-full border transition-all hover:border-primary/50 hover:shadow-md">
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
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

// --- SUBCOMPONENTES ---

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