import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Trash2, Folder, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import categoriesRoutes from '@/routes/categories';
import type { BreadcrumbItem } from '@/types';

interface Category {
    id: number;
    name: string;
    documents_count: number;
}

interface Props {
    categories: Category[];
}

export default function CategoriesIndex({ categories }: Props) {
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

    // Formulario para crear
    const {
        data: createData,
        setData: setCreateData,
        post: postCreate,
        processing: processingCreate,
        reset: resetCreate,
        errors: errorsCreate
    } = useForm({
        name: '',
    });

    // Formulario para editar
    const {
        data: editData,
        setData: setEditData,
        post: postEdit,
        processing: processingEdit,
        reset: resetEdit,
        errors: errorsEdit
    } = useForm({
        id: '' as string | number,
        name: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Categorías',
            href: categoriesRoutes.index().url,
        },
    ];

    // Filtrar categorías
    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    );

    // Manejadores Crear
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        postCreate(categoriesRoutes.store().url, {
            onSuccess: () => {
                setIsCreateOpen(false);
                resetCreate();
            },
        });
    };

    // Manejadores Editar
    const handleEditClick = (category: Category) => {
        setEditingCategory(category);
        setEditData({
            id: category.id,
            name: category.name,
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        postEdit(categoriesRoutes.update().url, {
            onSuccess: () => {
                setEditingCategory(null);
                resetEdit();
            },
        });
    };

    // Manejadores Eliminar
    const handleDelete = () => {
        if (!deletingCategory) return;

        router.post(categoriesRoutes.destroy().url, {
            id: deletingCategory.id,
        }, {
            onSuccess: () => setDeletingCategory(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Categorías" />

            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Gestión de Categorías
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Administra las categorías de los documentos.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Categoría
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar categoría..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Categorías Existentes</CardTitle>
                        <CardDescription>
                            Lista de todas las categorías utilizadas en los documentos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead className="text-right">Documentos</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map((cat) => (
                                        <TableRow key={cat.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Folder className="h-4 w-4 text-muted-foreground" />
                                                    {cat.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {cat.documents_count}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditClick(cat)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => setDeletingCategory(cat)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No se encontraron categorías.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Diálogo Crear */}
                <Dialog open={isCreateOpen} onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateOpen(false);
                        resetCreate();
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nueva Categoría</DialogTitle>
                            <DialogDescription>
                                Crea una nueva categoría para organizar documentos.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-name">Nombre</Label>
                                <Input
                                    id="create-name"
                                    value={createData.name}
                                    onChange={(e) => setCreateData('name', e.target.value)}
                                    placeholder="Ej: Facturas, Contratos..."
                                />
                                {errorsCreate.name && (
                                    <p className="text-sm text-destructive">{errorsCreate.name}</p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processingCreate}>
                                    Crear Categoría
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Diálogo Editar */}
                <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Renombrar Categoría</DialogTitle>
                            <DialogDescription>
                                Esto actualizará todos los documentos que usan esta categoría.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nombre</Label>
                                <Input
                                    id="edit-name"
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                    placeholder="Nombre de la categoría"
                                />
                                {errorsEdit.name && (
                                    <p className="text-sm text-destructive">{errorsEdit.name}</p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processingEdit}>
                                    Guardar Cambios
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Diálogo Eliminar */}
                <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Los documentos asociados a "{deletingCategory?.name}" quedarán sin categoría.
                                Esta acción no elimina los documentos.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
