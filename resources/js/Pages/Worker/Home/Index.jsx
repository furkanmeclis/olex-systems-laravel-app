import {Head} from "@inertiajs/react";
import CarBody from "@/Components/CarBody.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import useServiceTemplate from "@/Pages/Worker/Pdf.jsx";
import React, {useEffect} from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/firebase";
import {ScrollPanel} from 'primereact/scrollpanel';
import {Button} from "primereact/button";

export default function ({auth,csrf_token}) {
    const { VITE_APP_VAPID_KEY } = import.meta.env;

    async function requestPermission() {
        //requesting permission using Notification API
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: VITE_APP_VAPID_KEY,
            });

            //We can send token to server
            console.log("Token generated : ", token);
        } else if (permission === "denied") {
            //notifications are blocked
            alert("You denied for the notification");
        }
    }
    useEffect(() => {
        requestPermission();
    }, [])
    onMessage(messaging, (payload) => {
        let {body,title} = payload.notification;
        let image = payload.notification.image || "http://localhost:8000/icons/logo-1024x1024.png";
        new Notification(title+" FR", { body,icon:image,badge:image});
    });
    const [serviceData, setServiceData] = React.useState({});
    const getServiceData = () => {
        fetch(route('worker.pdfSourceDataService',13), {
            method: 'GET',
            headers: {
                'X-CSRF-TOKEN': csrf_token
            },

        }).then(response => response.json()).then(data => {
            if (data.status) {
                setServiceData(
                    data.data
                )
            } else {

            }
        }).catch((error) => {

        }).finally(() => {

        })
    }
    useEffect(() => {
        getServiceData();
    }, [])
    const {handlePrint,ServiceTemplate} = useServiceTemplate(serviceData);
    return <AuthenticatedLayout
        user={auth.user}
        header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight" onClick={handlePrint}>Anasayfa</h2>}
    >
        <Head title="Anasayfa"/>

        <div className="py-6">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className={""}>
                        <Button label={"Abone Ol"} onClick={requestPermission}/>
                        <ScrollPanel style={{ width: '100%', height: '29.7cm' }}>
                            <ServiceTemplate serviceNumber={"fffff"}/>
                        </ScrollPanel>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
}
