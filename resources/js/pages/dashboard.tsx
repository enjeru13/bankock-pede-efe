import { Head, Link } from '@inertiajs/react';
import { Building2, FileText, HardDrive, Download, TrendingUp } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import clients from '@/routes/clients';
import type { BreadcrumbItem } from '@/types';

/**
 * Página: Dashboard
 * 
 * Muestra estadísticas generales del sistema de gestión de PDFs.
 */

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
        id: number;
        name: string;
        code: string;
    };
}

interface TopClient {
    id: number;
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Bienvenido al sistema de gestión de documentos Bancock. Aquí tienes un resumen de la actividad reciente.
                    </p>
                </div>

                {/* Estadísticas principales */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Clientes */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total_clients}</div>
                            <p className="text-xs text-muted-foreground mt-1">Clientes activos registrados</p>
                        </CardContent>
                    </Card>

                    {/* Total Documentos */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
                            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.total_documents}</div>
                            <p className="text-xs text-muted-foreground mt-1">PDFs almacenados en el sistema</p>
                        </CardContent>
                    </Card>

                    {/* Almacenamiento */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Almacenamiento</CardTitle>
                            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
                                <HardDrive className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.formatted_storage}</div>
                            <p className="text-xs text-muted-foreground mt-1">Espacio total utilizado</p>
                        </CardContent>
                    </Card>

                    {/* Descargas */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Descargas</CardTitle>
                            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                                <Download className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.total_downloads}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total de descargas realizadas</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Documentos Recientes */}
                    <Card className="col-span-1 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                Documentos Recientes
                            </CardTitle>
                            <CardDescription>Últimos 3 documentos subidos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentDocuments.length > 0 ? (
                                <div className="space-y-6">
                                    {recentDocuments.map((doc) => (
                                        <div key={doc.id} className="flex items-start justify-between group">
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    href={clients.show(doc.client.id).url}
                                                    className="font-medium hover:text-primary transition-colors line-clamp-1"
                                                >
                                                    {doc.title}
                                                </Link>
                                                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        {doc.client.name}
                                                    </span>
                                                    <Badge variant="outline" className="h-5 px-1.5 font-mono text-[10px]">
                                                        {doc.client.code}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-medium block">{doc.formatted_size}</span>
                                                <span className="text-[10px] text-muted-foreground">{doc.created_at}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <FileText className="h-8 w-8 mb-2 opacity-50" />
                                    <p>No hay documentos recientes</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Clientes Más Activos */}
                    <Card className="col-span-1 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                Top 3 Clientes
                            </CardTitle>
                            <CardDescription>Clientes con mayor volumen de documentos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topClients.length > 0 ? (
                                <div className="space-y-6">
                                    {topClients.map((client, index) => (
                                        <div key={client.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-bold text-muted-foreground">
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <Link
                                                        href={clients.show(client.id).url}
                                                        className="font-medium hover:text-primary transition-colors"
                                                    >
                                                        {client.name}
                                                    </Link>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Badge variant="secondary" className="font-mono text-[10px] h-5 px-1.5">
                                                            {client.code}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">{client.formatted_total_size}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-lg">{client.documents_count}</span>
                                                <span className="text-xs text-muted-foreground">docs</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <Building2 className="h-8 w-8 mb-2 opacity-50" />
                                    <p>No hay datos disponibles</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Distribución por Categorías */}
                {categoriesDistribution.length > 0 && (
                    <div className="grid gap-6">
                        <h2 className="text-lg font-semibold tracking-tight">Distribución por Categorías</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {categoriesDistribution.map((item) => (
                                <Link
                                    key={item.category}
                                    // AQUÍ ESTÁ EL CAMBIO IMPORTANTE:
                                    href={`/documents?category=${encodeURIComponent(item.category)}`}
                                >
                                    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                                        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                            <div className="mb-3 p-3 rounded-full bg-secondary">
                                                <FileText className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="text-2xl font-bold">{item.count}</div>
                                            <div className="text-sm font-medium mt-1">{item.category}</div>
                                            <div className="text-xs text-muted-foreground mt-1">documentos</div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Acciones rápidas (Footer) */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Botón Registrar Cliente
                    <Link href={clients.create().url}>
                        <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-md transition-all hover:border-blue-500/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Registrar Nuevo Cliente</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Crear un perfil para un nuevo cliente y comenzar a subir documentos.</p>
                                </div>
                            </div>
                        </div>
                    </Link> */}

                    {/* Botón Subir Documento
                    <Link href={documents.create().url}> 
                        <div className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-md transition-all hover:border-green-500/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Subir Documento PDF</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Cargar un nuevo archivo PDF y asociarlo a un cliente existente.</p>
                                </div>
                            </div>
                        </div>
                    </Link> */}
                </div>
            </div>
        </AppLayout>
    );
}
