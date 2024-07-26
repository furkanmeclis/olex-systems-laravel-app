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
import {Image} from "primereact/image";
import {Divider} from "primereact/divider";

export default function Index({auth, recordsAll, csrf_token,statuses}) {
    const toast = useRef(null);
    const [filters, setFilters] = useState({
        global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const [productsModal, setProductsModal] = useState(false);
    const [productsModalData, setProductsModalData] = useState([]);

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
    const onRowEditComplete = async (e) => {
        const record = {
            id:e.newData.id,
            quantity:e.newData.quantity,
            status:e.newData.status
        }
        setLoading(true);
        fetch(route('super.stock-management.update', record.id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf_token
            },
            body: JSON.stringify(record)
        }).then(response => response.json()).then(data => {
            if (data.status) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: data.message
                });
                setRecords(data.records);
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Hata',
                    detail: data.message
                });
            }
        }).catch((error) => {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
            });
        }).finally(() => {
            setLoading(false);
        })
    };
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
                                   onRowEditComplete={onRowEditComplete}
                                   rowHover editMode="row" dataKey="id"
                                   currentPageReportTemplate="{first}. ile {last}. arası toplam {totalRecords} kayıttan">
                            <Column field="id" sortable header="#"/>
                            <Column field="dealer.name" sortable header="Bayi Adı"/>
                            <Column field="product.name" sortable header="Ürün Adı"/>
                            <Column field="quantity" sortable header="Ürün Adedi"/>
                            <Column field="status" editor={statusEditor} header="Durumu" body={verifiedBodyTemplate}/>
                            <Column field="note" header="Not"/>
                            <Column field="updated_at" sortable header="Son Değişiklik Tarihi" body={(rowData) => new Date(rowData.updated_at).toLocaleString()}/>
                            <Column sortable header="Ürün Kodları" body={(rowData) => <Button icon={"pi pi-qrcode"} tooltip={"Ürün Kodlarını Görüntüle"} onClick={() => {
                                setProductsModalData(rowData.product);
                                setProductsModal(true);
                            }}/>}/>
                            <Column rowEditor headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }}></Column>
                        </DataTable>
                    </div>
                </div>
            </div>
            <Dialog header="Ürünler" style={{width: '50vw'}} breakpoints={{'960px': '75vw', '641px': '100vw'}}
                    onHide={() => setProductsModal(false)} maximizable visible={productsModal} footer={() => {
                return <><Button label="Kapat" icon={"pi pi-times"} onClick={() => setProductsModal(false)} severity={"warning"}
                                 size={"small"}/>
                        <Button label={"Kaydet"} icon={"pi pi-cloud-download"} size={"small"} severity={"success"} onClick={() => {
                            if(productsModalData.codes.length === 0){
                                toast.current.show({
                                    severity: 'warn',
                                    summary: 'Hata',
                                    detail: "Ürün Kodu Bulunamadı"
                                });
                                return;
                            }else{
                                let _txtData = "";
                                productsModalData.codes.map(({code}) => {
                                    _txtData += code + "\n";
                                });
                                const blob = new Blob([_txtData], {type: 'text/plain'});
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = productsModalData.name + " Ürün Kodları.txt";
                                a.click();
                            }
                        }} />
                </>
            }}>
                {productsModal && <div className={"card flex flex-col"}>
                    <div>
                        <div className="flex p-2 items-center gap-3 ">
                            <span className="font-bold flex-1">
                                <span className={"border-b"}>Ürün Kodu</span>
                            </span>
                            <span>
                                <span className={"border-b"}>Son Değişiklik Tarihi</span>
                            </span>
                        </div>
                    </div>
                    {productsModalData.codes.length === 0 && <div className="flex p-2 items-center gap-3 ">
                        <span className="font-bold flex-1 border-b border-dashed ">Ürün Kodu Bulunamadı</span></div>}
                    {productsModalData.codes.map(({code,updated_at},key) => {
                        return <div key={key}>
                            <div className="flex p-2 items-center gap-3 ">
                                <span className="font-bold flex-1"><span className={"select-all"}>{code}</span></span>
                                <span>{new Date(updated_at).toLocaleString()}</span>
                            </div>
                            <Divider/>
                        </div>
                    })}
                </div>}
            </Dialog>
        </AuthenticatedLayout>
    );
}
