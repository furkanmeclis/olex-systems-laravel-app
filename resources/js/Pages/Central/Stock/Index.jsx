import {Head, router} from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import React, {useState, useRef, useEffect} from 'react';
import {FilterMatchMode, FilterOperator} from 'primereact/api';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {InputText} from 'primereact/inputtext';
import {Button} from 'primereact/button';
import {Tooltip} from "primereact/tooltip";
import {ConfirmPopup, confirmPopup} from 'primereact/confirmpopup';
import {Toolbar} from 'primereact/toolbar';
import {Dialog} from 'primereact/dialog';
import {Toast} from 'primereact/toast';
import {Tag} from "primereact/tag";
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';

export default function Index({auth, recordsAll, csrf_token,statuses}) {
    const toast = useRef(null);
    const [filters, setFilters] = useState({
        global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [records, setRecords] = useState(recordsAll);
    const onGlobalFilterChange = (e, action = false) => {
        const value = action ? e : e.target.value;
        let _filters = {...filters};

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };
    const statusEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={statuses}
                onChange={(e) => options.editorCallback(e.value)}
                optionLabel={"label"}
                optionValue={"value"}
                placeholder="Select a Status"
                itemTemplate={(option) => {
                    return (
                        <Tag value={option.label} severity={option.severity} />
                    );
                }}
            />
        );
    }
    const quantityEditor = (option) => {
        return <InputNumber value={option.value} onValueChange={(e) => option.editorCallback(e.value)} showButtons min={0} />
    }
    const renderHeader = () => {
        return (
            <>
                <Toolbar
                         end={() => <>

                    <span className="p-input-icon-left">
                            <i className="pi pi-search"/>
                            <InputText size={"small"} value={globalFilterValue} onChange={onGlobalFilterChange}
                                       placeholder="Stok Kayıtlarında Arama Yapın"/>
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
    const verifiedBodyTemplate = (rowData) => {
        return <Tag value={rowData.status_label} severity={rowData.status_severity}/>;
    };
    const header = renderHeader();
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Stok Kayıtları</h2>}
        >
            <Head title="Stok Kayıtları"/>
            <Tooltip target=".custom-target-icon"/>
            <ConfirmPopup/>
            <Toast ref={toast}/>
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <DataTable dragSelection value={records} removableSort paginator
                                   paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                                   rowsPerPageOptions={[5, 10, 25, 50]} rows={10} filters={filters}
                                   loading={loading}
                                   globalFilterFields={['product.name', 'dealer.name', 'status', 'quantity']}
                                   header={header}
                                   rowClassName={(rowData) => "cursor-pointer"}
                                   emptyMessage="Kayıt bulunamadı."
                                   rowHover dataKey="id"
                                   currentPageReportTemplate="{first}. ile {last}. arası toplam {totalRecords} kayıttan">
                            <Column field="id" sortable header="#"/>
                            <Column field="dealer.name" sortable header="Bayi Adı"/>
                            <Column field="product.name" sortable header="Ürün Adı"/>
                            <Column field="quantity" sortable header="Ürün Adedi"/>
                            <Column field="status" header="Durumu" body={verifiedBodyTemplate}/>
                            <Column field="note" header="Not"/>
                            <Column field="updated_at" sortable header="Son Değişiklik Tarihi" body={(rowData) => new Date(rowData.updated_at).toLocaleString()}/>
                         </DataTable>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
