import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {Button} from 'primereact/button';
import CarBody from '@/Components/CarBody';
import CarSelect from "@/Components/CarSelect.jsx";
import {useState} from "react";
import {Checkbox} from "primereact/checkbox";
export default function Dashboard({ auth }) {
    const [editable, setEditable] = useState(false);
    const [value, setValue] = useState([]);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Anasayfas</h2>}
        >
            <Head title="Anasayfa" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-3">
                        <div className="flex align-items-center">
                            <Checkbox inputId={"editable_i"} onChange={(e) => setEditable(e.checked)} checked={editable} />
                            <label htmlFor={"editable_i"} className="ml-2">{editable ? "Düzenleme Modu":"Görüntüleme Modu"}</label>
                        </div>
                        <CarBody editable={editable} onChange={(data) => setValue(data)} value={value} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
