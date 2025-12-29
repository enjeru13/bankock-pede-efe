import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { dashboard } from '@/routes';
import clients from '@/routes/clients';
import type { BreadcrumbItem } from '@/types';

/**
 * Página: Editar Cliente
 * 
 * Formulario para editar un cliente existente.
 */

interface Client {
    id: number;
    name: string;
    code: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    is_active: boolean;
}

interface Props {
    client: Client;
}

export default function ClientsEdit({ client }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
        {
            title: 'Clientes',
            href: clients.index().url,
        },
        {
            title: client.name,
            href: clients.show(client.id).url,
        },
        {
            title: 'Editar',
            href: clients.edit(client.id).url,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: client.name,
        code: client.code,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        notes: client.notes || '',
        is_active: client.is_active,
    });

    /**
     * Enviar formulario
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(clients.update(client.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${client.name}`} />

            <div className="mx-auto max-w-2xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Editar Cliente
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Actualiza la información del cliente
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Cliente</CardTitle>
                            <CardDescription>
                                Modifica los datos del cliente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Nombre */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nombre <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ej: Empresa ABC S.A."
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Código */}
                            <div className="space-y-2">
                                <Label htmlFor="code">
                                    Código <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    type="text"
                                    value={data.code}
                                    onChange={(e) =>
                                        setData('code', e.target.value.toUpperCase())
                                    }
                                    placeholder="Ej: CLI-001"
                                    className="font-mono"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Solo letras mayúsculas, números y guiones
                                </p>
                                <InputError message={errors.code} />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="contacto@empresa.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Teléfono */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+58 412-1234567"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            {/* Dirección */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Dirección completa del cliente..."
                                    rows={2}
                                />
                                <InputError message={errors.address} />
                            </div>

                            {/* Notas */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas Internas</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Notas internas sobre el cliente..."
                                    rows={3}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Estas notas solo son visibles para el equipo interno
                                </p>
                                <InputError message={errors.notes} />
                            </div>

                            {/* Estado activo */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Cliente Activo</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Los clientes inactivos no aparecen en los filtros por defecto
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', checked)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botones de acción */}
                    <div className="mt-6 flex gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(clients.show(client.id).url)}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
