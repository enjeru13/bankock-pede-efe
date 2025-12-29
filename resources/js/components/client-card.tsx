import { Building2, FileText, Mail, Phone } from 'lucide-react';
import { Link } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import clients from '@/routes/clients';

/**
 * Componente ClientCard
 * 
 * Tarjeta para mostrar un cliente con su información básica.
 * Incluye:
 * - Nombre y código del cliente
 * - Información de contacto
 * - Contador de documentos
 * - Estado (activo/inactivo)
 * - Enlace para ver detalles
 */

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
        <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <CardTitle className="line-clamp-1 text-base">
                                {client.name}
                            </CardTitle>
                            {!client.is_active && (
                                <Badge variant="secondary" className="text-xs">
                                    Inactivo
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="mt-1">
                            <Badge variant="outline" className="font-mono">
                                {client.code}
                            </Badge>
                        </CardDescription>
                    </div>
                    <Building2 className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-2 pb-3">
                {/* Email */}
                {client.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{client.email}</span>
                    </div>
                )}

                {/* Teléfono */}
                {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{client.phone}</span>
                    </div>
                )}

                {/* Estadísticas de documentos */}
                {client.documents_count !== undefined && (
                    <div className="flex items-center gap-2 pt-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            {client.documents_count}{' '}
                            {client.documents_count === 1 ? 'documento' : 'documentos'}
                        </span>
                        {client.formatted_total_size && (
                            <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">
                                    {client.formatted_total_size}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="border-t bg-muted/50 p-3">
                <Link href={clients.show(client.id).url} className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                        Ver detalles
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
