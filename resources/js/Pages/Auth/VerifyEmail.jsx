import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Eposta Doğrulama" />

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Üye olduğunuz için teşekkürler! Başlamadan önce, simgesine tıklayarak e-posta adresinizi doğrulayabilir misiniz?
                az önce size e-postayla gönderdiğimiz bağlantı? E-postayı almadıysanız, size memnuniyetle başka bir e-posta göndeririz.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 font-medium text-sm text-green-600 dark:text-green-400">
                    Kayıt sırasında verdiğiniz e-posta adresine yeni bir doğrulama bağlantısı gönderildi.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton disabled={processing}>Doğrulama e-postasını tekrar gönder</PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                    >
                        Çıkış Yap
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
