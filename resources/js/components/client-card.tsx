import { Building2, FileText, Mail, Phone, ExternalLink } from 'lucide-react';
import { Link } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import clientsRoutes from '@/routes/clients';
import { cn } from '@/lib/utils';

interface Client {
    id: number;
    name: string;
    code: string;
    email?: string;
    phone?: string;
    is_active: boolean;
    documents_count?: number;
    formatted_total_size?: string;
}

interface ClientCardProps {
    client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
    return (
        <Link href={clientsRoutes.show(client.id).url} className="block h-full">
            <Card className="group relative flex h-full flex-col overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg cursor-pointer">
                {/* Decoración superior sutil */}
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <CardContent className="flex flex-1 flex-col p-5">

                    {/* Header: Icono y Estado */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 transition-transform duration-300 group-hover:scale-105">
                            <Building2 className="h-5 w-5" />
                        </div>

                        {/* Indicador de Estado */}
                        <div className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                            client.is_active
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30"
                                : "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                        )}>
                            <span className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                client.is_active ? "bg-green-500" : "bg-zinc-400"
                            )} />
                            {client.is_active ? "Activo" : "Inactivo"}
                        </div>
                    </div>

                    {/* Información Principal */}
                    <div className="space-y-1 mb-4">
                        <h3 className="font-semibold text-lg leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {client.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground font-normal bg-muted/50 border-muted">
                                {client.code}
                            </Badge>
                        </div>
                    </div>

                    {/* Información de Contacto */}
                    <div className="space-y-2 text-sm text-muted-foreground mt-auto">
                        {client.email ? (
                            <div className="flex items-center gap-2 min-w-0 group/item">
                                <Mail className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70 group-hover/item:text-primary transition-colors" />
                                <span className="truncate hover:text-foreground transition-colors" title={client.email}>
                                    {client.email}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground/40 italic">
                                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>Sin email</span>
                            </div>
                        )}

                        {client.phone ? (
                            <div className="flex items-center gap-2 group/item">
                                <Phone className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70 group-hover/item:text-primary transition-colors" />
                                <span className="hover:text-foreground transition-colors">{client.phone}</span>
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
                <CardFooter className="bg-muted/30 px-5 py-3 border-t border-border/50 flex justify-between items-center group-hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            <span>{client.documents_count || 0} docs</span>
                        </div>
                        {client.formatted_total_size && (
                            <>
                                <span className="text-muted-foreground/30">•</span>
                                <span>{client.formatted_total_size}</span>
                            </>
                        )}
                    </div>

                    {/* Flecha que aparece en hover */}
                    <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <ExternalLink className="h-4 w-4 text-primary" />
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}