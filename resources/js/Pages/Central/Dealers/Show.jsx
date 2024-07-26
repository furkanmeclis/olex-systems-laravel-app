import {Head, router} from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import {PanelMenu} from 'primereact/panelmenu';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import Profile from "@/Pages/Central/Dealers/Pages/Profile.jsx";
import NewWorker from "@/Pages/Central/Dealers/Pages/NewWorker.jsx";
import Workers from "@/Pages/Central/Dealers/Pages/Workers.jsx";
import Services from "@/Pages/Central/Dealers/Pages/Services.jsx";
import Customers from "@/Pages/Central/Dealers/Pages/Customers.jsx";
import StockIn from "@/Pages/Central/Dealers/Pages/StockIn.jsx";
import React, {useRef, useState} from "react";
import {Toast} from "primereact/toast";
import {BlockUI} from "primereact/blockui";
import { Splitter, SplitterPanel } from 'primereact/splitter';
const Index = (props) => {
    const {auth, dealer, subRoute,csrf_token} = props;
    const toast = useRef(null);
    const [loading, setLoading] = useState(false);
    const handleRoute = (action) => {
        router.visit(route('central.dealers.show', dealer.id), {
            method: "get",
            data: {
                subRoute: action
            }
        });
    }
    const items = [
        {
            label: 'Bayi Bilgileri',
            icon: 'pi pi-fw pi-home',
            command: () => {
                handleRoute('profile');
            },
        },
        {
            label: 'Çalışanlar',
            icon: 'pi pi-fw pi-users',
            command: () => {
                handleRoute('workers');
            }
        },
        {
            label: 'Hizmetler',
            icon: 'pi pi-fw pi-file',
            command: () => {
                handleRoute('services');
            }
        },
        {
            label: 'Stok Hareketleri',
            icon: 'pi pi-fw pi-plus-circle',
            command: () => {
                handleRoute('stock-records');
            }
        },
        {
            label: 'Müşteriler',
            icon: 'pi pi-fw pi-users',
            command: () => {
                handleRoute('customers');
            }
        },

    ];
    const [detail, setDetail] = useState(props?.company);
    const [workers, setWorkers] = useState(props?.workers);
    const [stockRecords, setStockRecords] = useState(props?.stockRecords);
    const Body = () => {
        let propsX = {
            dealer: dealer,
            toast: toast,
            csrf_token: csrf_token,
            loading: loading,
            setLoading: setLoading
        }
        switch (subRoute) {
            case 'profile':
                propsX.detail = detail;
                propsX.setDetail = setDetail;
                return <Profile {...propsX} />;
            case 'workers':
                return <Workers {...propsX} workersAll={workers} />;
            case 'services':
                return <Services dealer={dealer}/>;
            case 'stock-records':
                propsX.stockRecords = stockRecords;
                propsX.setStockRecords = setStockRecords;
                return <StockIn {...propsX} />;
            case 'customers':
                return <Customers dealer={dealer}/>;

        }
    }
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Bayi Yöneticisi
                - {dealer.name} </h2>}
        >
            <Head title="Bayiler"/>
            <Toast ref={toast}/>

            <div className="py-4 sm:px-6">
                <div className={"grid sm:grid-cols-4 grid-cols-1 gap-3"}>
                    <div className={"sm:col-span-4 px-4 rounded"}>
                        <Button label="Geri Dön" icon="pi pi-arrow-left" size={"small"} severity={"warning"} className="p-button-text"
                                onClick={() => {
                                    if(window.history.length > 1){
                                        window.history.back();
                                    }else {
                                        router.visit(route('central.dealers.index'));
                                    }
                                }}/>
                    </div>
                    <div className={"sm:columns-1 dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg py-4 px-2"}>
                        <div
                            className={"text-gray-800 dark:text-gray-200 text-xl font-semibold pb-2 text-center "}>{dealer.name}</div>
                        <PanelMenu model={items} className="w-full md:w-20rem mt-2"/>
                    </div>
                    <div className={"sm:col-span-3 col-span-1 dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg py-4 px-4"}>
                        <BlockUI blocked={loading} template={<i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>}>
                            <Body/>
                        </BlockUI>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
export default Index;
