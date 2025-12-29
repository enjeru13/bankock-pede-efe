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
 * Página: Crear Cliente
 * 
 * Formulario para crear un nuevo cliente.
 * Incluye:
 * - Nombre y código
 * - Información de contacto
 * - Notas internas
 * - Estado activo/inactivo
 */

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
        title: 'Crear Cliente',
        href: clients.create().url,
    },
];

export default function ClientsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        is_active: true,
    });

    /**
     * Enviar formulario
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(clients.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Cliente" />

            <div className="mx-auto max-w-2xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Crear Cliente
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Registra un nuevo cliente en el sistema
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Cliente</CardTitle>
                            <CardDescription>
                                Completa los datos del cliente
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
                            {processing ? 'Creando...' : 'Crear Cliente'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(clients.index().url)}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
