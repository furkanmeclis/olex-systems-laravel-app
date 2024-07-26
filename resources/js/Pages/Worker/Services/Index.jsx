import {Head, router} from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

import React, {useState, useRef, useEffect} from 'react';
import {classNames} from 'primereact/utils';
import {FilterMatchMode, FilterOperator} from 'primereact/api';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {InputText} from 'primereact/inputtext';
import {Image} from 'primereact/image';
import {Button} from 'primereact/button';
import {Tooltip} from "primereact/tooltip";
import {ConfirmPopup, confirmPopup} from 'primereact/confirmpopup';
import {Toolbar} from 'primereact/toolbar';
import {Dialog} from 'primereact/dialog';
import {Toast} from 'primereact/toast';
import {OverlayPanel} from 'primereact/overlaypanel';
import {Checkbox} from 'primereact/checkbox';
import Create from "@/Pages/Worker/Customers/Create.jsx";
import Update from "@/Pages/Worker/Customers/Update.jsx";
import {Avatar} from "primereact/avatar";
import {useLocalStorage} from "primereact/hooks"

export default function Index({auth, servicesAll, csrf_token, page = true}) {
    const toast = useRef(null);
    const op = useRef(null);
    const [filters, setFilters] = useState({
        global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const [loading, setLoading] = useState(false);
    const [loadingX, setLoadingX] = useState(false);
    const [loadingC, setLoadingC] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [updateWorker, setUpdateWorker] = useState({});
    const formRef = useRef();
    const formRefCreate = useRef();
    const [services, setServices] = useState(servicesAll);
    const columns = [
        'id',
        'service_no',
        'customer_name',
        'worker_name',
        'status',
        'car',
        'updated_at',
        'created_at',
        'actions'
    ];
    const columnsTurkishNames = {
        'id': 'ID',
        'service_no':'Hizmet Numarası',
        'customer_name': 'Müşteri Adı',
        'worker_name': 'Ekleyen Çalışan',
        'status': 'Durumu',
        'car': 'Araç',
        'updated_at': 'Güncellenme Tarihi',
        'created_at': 'Eklenme Tarihi',
        'actions': 'İşlemler'
    }
    const LocalStorageName = page === true ? "worker-services-table-columns" : "worker-services-table-columns-2";
    const [selectedColumns, setSelectedColumns] = useLocalStorage([
        'id',
        'service_no',
        'customer_name',
        'worker_name',
        'status',
        'car',
        'created_at',
        'actions'
    ], LocalStorageName)
    const [updateModal, setUpdateModal] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const onGlobalFilterChange = (e, action = false) => {
        const value = action ? e : e.target.value;
        let _filters = {...filters};

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const handleCloseModal = () => {
        if (updateModal) {
            setUpdateModal(false);
        }
        if (createModal) {
            setCreateModal(false);
        }
    };
    const renderHeader = () => {
        return (
            <>
                <Toolbar start={() => <>
                    <Button icon="pi pi-plus" size={"small"} severity={"success"}
                            tooltip={"Yeni Hizmet Ekle"}
                            tooltipOptions={{
                                position: 'top'
                            }} onClick={() => {
                        router.visit(route('worker.services.create'));
                    }} className="mr-2"/>
                    <Button icon="pi pi-bars" size={"small"} severity={"info"} tooltip={"Kolonları Yönet"}
                            tooltipOptions={{
                                position: 'top'
                            }} onClick={(event) => {
                        op.current.toggle(event);
                    }} className="mr-2"/>
                    {/*<Button icon="pi pi-print" size={"small"} className="mr-2"/>*/}
                </>}
                         end={() => <>

                    <span className="p-input-icon-left">
                            <i className="pi pi-search"/>
                            <InputText size={"small"} value={globalFilterValue} onChange={onGlobalFilterChange}
                                       placeholder="Hizmetlerde Arama Yapın"/>
                    </span>{globalFilterValue !== '' && (<Button size={"small"}
                                                                 icon="pi pi-times" className="p-button-info ml-2"
                                                                 onClick={() => onGlobalFilterChange('', true)}
                                                                 tooltip={"Filtreyi Temizle"} tooltipOptions={{
                             position: 'top'
                         }}/>)}
                         </>}/>
            </>
        );
    };
    const header = renderHeader();
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formSubmittedCreate, setFormSubmittedCreate] = useState(false);
    const updateWorkerPrepare = (user) => {
        if (!updateModal) {
            setUpdateWorker(user);
            setUpdateModal(true);
        }
    };

    const TableContent = () => {
        return <>
            <Tooltip target=".custom-target-icon"/>
            <ConfirmPopup/>
            <Toast ref={toast}/>
            <OverlayPanel ref={op}>
                <div className="flex flex-col">
                    <div className="flex justify-between items-center">
                        <h3>Kolonları Yönet</h3>
                    </div>
                    <div className="flex flex-col">
                        {columns.map((column, index) => {
                            return <div key={index} className="flex my-1 items-center">
                                <Checkbox inputId={column} checked={selectedColumns.includes(column)} onChange={(e) => {
                                    let _selectedColumns = [...selectedColumns];
                                    if (e.checked) {
                                        _selectedColumns.push(column);
                                    } else {
                                        _selectedColumns = _selectedColumns.filter(col => col !== column);
                                    }
                                    setSelectedColumns(_selectedColumns);
                                }}/>
                                <label htmlFor={column} className="ml-2">{columnsTurkishNames[column]}</label>
                            </div>
                        })}
                        <div className="flex justify-end mt-4">
                            <Button label="Kaydet" severity={"success"} size={"small"} onClick={() => {
                                op.current.hide();
                            }}/>
                        </div>
                    </div>
                </div>
            </OverlayPanel>
            <DataTable value={services} removableSort paginator
                       paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                       rowsPerPageOptions={[5, 10, 25, 50]} rows={10} dataKey="id" filters={filters}
                       loading={false}
                       globalFilterFields={['service_no', 'worker_name', 'car', 'customer_name', 'status']}
                       header={header}
                       emptyMessage="Hizmet bulunamadı."
                       currentPageReportTemplate="{first}. ile {last}. arası toplam {totalRecords} kayıttan">

                {selectedColumns.includes('id') && <Column field="id" sortable header="#"/>}
                {selectedColumns.includes('service_no') && <Column field="service_no" sortable header="Hizmet Numarası"/>}
                {selectedColumns.includes('customer_name') && <Column field="name" sortable header="Müşteri Adı"/>}
                {selectedColumns.includes('worker_name') && <Column field="worker.name" sortable header="Ekleyen Çalışan" />}
                {selectedColumns.includes('status') && <Column field="status" sortable header="Durumu" />}
                {selectedColumns.includes('car') && <Column field="car" sortable header="Araç"/>}
                {selectedColumns.includes('created_at') &&
                    <Column field="created_at" sortable header="Eklenme Tarihi"
                            body={(rowData) => new Date(rowData.created_at).toLocaleString()}/>}
                {selectedColumns.includes('updated_at') &&
                    <Column field="updated_at" sortable header="Güncellenme Tarihi"
                            body={(rowData) => new Date(rowData.updated_at).toLocaleString()}/>}
                {selectedColumns.includes('actions') && <Column header="İşlemler" body={(user) => {
                    return <div className={"flex justify-center gap-x-2"}>
                        <Button icon="pi pi-pencil" size={"small"} tooltip={"Müşteriyi Düzenle"}
                                tooltipOptions={{
                                    position: 'top'
                                }} severity={"warning"} onClick={() => {
                            updateWorkerPrepare(user);
                        }}/>
                    </div>
                }}/>}
            </DataTable>
            <Dialog header="Müşteriyi Düzenle" style={{width: '50vw'}} breakpoints={{'960px': '75vw', '641px': '100vw'}}
                    onHide={handleCloseModal} maximizable visible={updateModal} footer={<>
                <Button label="Vazgeç" icon="pi pi-times" size={"small"} link onClick={handleCloseModal}
                        loading={loadingX}/>
                <Button label="Kaydet" icon="pi pi-save" size={"small"} className="p-button-success" loading={loadingX}
                        onClick={() => {
                            setFormSubmitted(true);
                            formRef.current.click();
                        }}/>
            </>}>
                <Update updateModal={updateModal} user={updateWorker} csrf_token={csrf_token} toast={toast}
                        onHide={handleCloseModal} setServices={setServices} formRef={formRef}
                        setFormSubmitted={setFormSubmitted}
                        formSubmitted={formSubmitted} loading={loadingX} setLoading={setLoadingX} page={page}/>
            </Dialog>
            <Dialog header="Müşteri Ekle" style={{width: '50vw'}} breakpoints={{'960px': '75vw', '641px': '100vw'}}
                    onHide={handleCloseModal} maximizable visible={createModal} footer={<>
                <Button label="Vazgeç" icon="pi pi-times" size={"small"} link onClick={handleCloseModal}
                        loading={loadingC}/>
                <Button label="Kaydet" icon="pi pi-save" size={"small"} className="p-button-success" loading={loadingC}
                        onClick={() => {
                            setFormSubmittedCreate(true);
                            formRefCreate.current.click();
                        }}/>
            </>}>
                <Create createModal={createModal} csrf_token={csrf_token} toast={toast}
                        onHide={handleCloseModal} setServices={setServices} formRef={formRefCreate}
                        setFormSubmitted={setFormSubmittedCreate}
                        formSubmitted={formSubmittedCreate} loading={loadingC} setLoading={setLoadingC} page={page}/>
            </Dialog>
        </>
    }
    return page === true ? (<AuthenticatedLayout
        user={auth.user}
        header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Hizmet Kayıtları</h2>}
    >
        <Head title="Hizmet Kayıtları"/>

        <div className="py-6">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <TableContent/>
                </div>
            </div>
        </div>

    </AuthenticatedLayout>) : (<TableContent/>);
}
