import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    return (
        <AuthLayout
            title="Crea una cuenta"
            description="Ingresa tus datos para registrarte en el sistema"
        >
            <Head title="Registro" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="co_ven">
                                    Código de Vendedor
                                </Label>
                                <Input
                                    id="co_ven"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    name="co_ven"
                                    placeholder="Código de vendedor"
                                    className="h-11 shadow-sm"
                                />
                                <InputError
                                    message={errors.co_ven as string}
                                    className="mt-2"
                                />
                            </div>

                            {/* <div className="grid gap-2">
                                <Label htmlFor="ven_des">
                                    Nombre / Descripción
                                </Label>
                                <Input
                                    id="ven_des"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    autoComplete="name"
                                    name="ven_des"
                                    placeholder="Nombre del vendedor"
                                    className="h-11 shadow-sm"
                                />
                                <InputError
                                    message={errors.ven_des as string}
                                />
                            </div> */}

                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Mínimo 8 caracteres"
                                    className="h-11 shadow-sm"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar contraseña
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Repite tu contraseña"
                                    className="h-11 shadow-sm"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full text-base font-semibold transition-all hover:shadow-lg active:scale-[0.98]"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Crear Cuenta
                            </Button>
                        </div>

                        <div className="text-center text-sm font-medium text-muted-foreground">
                            ¿Ya tienes una cuenta?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="font-bold text-indigo-600 hover:text-indigo-500"
                            >
                                Inicia sesión
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
