import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import clientsRoutes from '@/routes/clients';
import type { Client } from '@/types/client';
import { Link } from '@inertiajs/react';
import { Building2, ExternalLink, FileText, Mail, Phone } from 'lucide-react';

interface ClientCardProps {
    client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
    const isActive = client.inactivo;
    const hasDocuments = (client.documents_count || 0) > 0;
    const isComplete = client.is_complete || false;

    return (
        <Link
            href={clientsRoutes.show(client.co_cli).url}
            className="block h-full"
        >
            <Card
                className={cn(
                    'group relative flex h-full cursor-pointer flex-col overflow-hidden border transition-all duration-300 hover:shadow-lg',
                    isComplete
                        ? 'border-green-300 bg-gradient-to-br from-green-100/60 to-transparent dark:border-green-700/50 dark:from-green-900/30'
                        : hasDocuments
                            ? 'border-red-300 bg-gradient-to-br from-red-100/60 to-transparent dark:border-red-700/50 dark:from-red-900/30'
                            : 'border-border/50',
                    'hover:border-primary/50'
                )}
            >
                <CardContent className="flex flex-1 flex-col p-5">
                    {/* Header: Icono y Estado */}
                    <div className="mb-4 flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-105">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>

                        {/* Indicadores de Estado */}
                        <div className="flex flex-col items-end gap-1.5">
                            {/* Badge de Conteo de Archivos */}
                            <div className="flex items-center gap-1.5">
                                <span className={cn(
                                    "flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold shadow-sm",
                                    hasDocuments
                                        ? "bg-primary/20 text-primary font-bold border border-primary/20"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    <FileText className="h-3 w-3" />
                                    {client.documents_count || 0}
                                </span>
                            </div>

                            {/* Estado Activo/Inactivo */}
                            <div
                                className={cn(
                                    'flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium bg-background',
                                    isActive == 0
                                        ? 'border-green-300 text-green-800 dark:border-green-700 dark:text-green-300'
                                        : 'border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300',
                                )}
                            >
                                <span
                                    className={cn(
                                        'h-1.5 w-1.5 rounded-full',
                                        isActive == 0
                                            ? 'bg-green-600'
                                            : 'bg-zinc-500',
                                    )}
                                />
                                {isActive == 0 ? 'Activo' : 'Inactivo'}
                            </div>
                        </div>
                    </div>

                    {/* Información Principal */}
                    <div className="mb-4 space-y-1">
                        <h3 className="line-clamp-1 text-lg leading-tight font-semibold text-foreground transition-colors group-hover:text-primary">
                            {client.cli_des}
                        </h3>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className="border-muted bg-muted/50 font-mono text-[10px] font-normal text-muted-foreground"
                            >
                                {client.co_cli}
                            </Badge>
                        </div>
                    </div>

                    {/* Información de Contacto */}
                    <div className="mt-auto space-y-2 text-sm text-muted-foreground">
                        {client.rif ? (
                            <div className="group/item flex min-w-0 items-center gap-2">
                                <Mail className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70 transition-colors group-hover/item:text-primary" />
                                <span
                                    className="truncate transition-colors hover:text-foreground"
                                    title={client.rif}
                                >
                                    {client.rif}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground/40 italic">
                                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>Sin documento de identidad</span>
                            </div>
                        )}

                        {client.telefonos ? (
                            <div className="group/item flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70 transition-colors group-hover/item:text-primary" />
                                <span className="transition-colors hover:text-foreground">
                                    {client.telefonos}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground/40 italic">
                                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>Sin teléfono</span>
                            </div>
                        )}
                    </div>
                </CardContent>

                {/* Footer: Estadísticas */}
                <CardFooter className="flex items-center justify-between border-t border-border/50 bg-muted/30 px-5 py-3 transition-colors group-hover:bg-muted/50">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            <span>{client.documents_count || 0} docs</span>
                        </div>
                        {client.formatted_total_size && (
                            <>
                                <span className="text-muted-foreground/30">
                                    •
                                </span>
                                <span>{client.formatted_total_size}</span>
                            </>
                        )}
                    </div>

                    {/* Flecha que aparece en hover */}
                    <div className="-translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                        <ExternalLink className="h-4 w-4 text-primary" />
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
