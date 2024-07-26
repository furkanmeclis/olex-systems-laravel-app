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
import {Dropdown} from 'primereact/dropdown';
import {InputNumber} from 'primereact/inputnumber';
import {Checkbox} from "primereact/checkbox";
import {OverlayPanel} from "primereact/overlaypanel";
import Create from "@/Pages/Super/Orders/Create.jsx";
import Update from "@/Pages/Super/Orders/Update.jsx";
import {OrderList} from 'primereact/orderlist';
import {Image} from "primereact/image";
import {Divider} from "primereact/divider";
import {FloatLabel} from "primereact/floatlabel";
import ProductCodes from "@/Pages/Super/Orders/ProductCodes.jsx";

export default function Index({auth, ordersAll, csrf_token, statuses, salesmans}) {
    const toast = useRef(null);
    const op = useRef(null);
    const [filters, setFilters] = useState({
        global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [records, setRecords] = useState(ordersAll);
    const [dealers, setDealers] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeStatus, setActiveStatus] = useState(null);
    const [trash, setTrash] = useState([]);
    const [trashMode, setTrashMode] = useState(false);
    const [recordsX, setRecordsX] = useState([]);
    const columns = [
        'id',
        'dealer',
        'user',
        'status',
        'products_count',
        'price',
        'created_at',
        'updated_at',
        'actions',

    ];
    const [selectedColumns, setSelectedColumns] = useState(localStorage.getItem('selectedColumnsForOrdersTable') ? JSON.parse(localStorage.getItem('selectedColumnsForOrdersTable')) : columns);
    const columnsTurkishNames = {
        'id': 'ID',
        'price': 'Sipariş Tutarı',
        'dealer': 'Bayi',
        'user': 'Yetkili',
        'status': 'Durumu',
        'products_count': 'Ürün Adedi',
        'updated_at': 'Güncellenme Tarihi',
        'created_at': 'Eklenme Tarihi',
        'actions': 'İşlemler'
    }
    const getDealers = () => {
        setLoading(true)
        fetch(route('super.dealers.listAll'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf_token
            },
        }).then(r => r.json()).then(response => {
            setDealers(response.dealers);
        }).catch((err) => {
            console.log(err);
            toast.current.show({severity: 'error', summary: 'Hata', detail: 'Bayiler getirilirken bir hata oluştu.'});
        }).finally(() => {
            setLoading(false);
        });
    }
    const getProducts = () => {
        setLoading(true)
        fetch(route('super.products.listAll'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf_token
            },
        }).then(r => r.json()).then(response => {
            setProducts(response.products.map(product => {
                product.total = product.price;
                product.quantity = 1;
                return product;
            }));
        }).catch((err) => {
            console.log(err);
            toast.current.show({severity: 'error', summary: 'Hata', detail: 'Ürünler getirilirken bir hata oluştu.'});
        }).finally(() => {
            setLoading(false);
        });

    }
    const getTrashRecords = () => {
        setLoading(true)
        fetch(route('super.orders.trashAll'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf_token
            },
        }).then(r => r.json()).then(response => {
            setRecordsX(records);
            setRecords(response.records);
            setTrashMode(true);
        }).catch((err) => {
            console.log(err);
            toast.current.show({severity: 'error', summary: 'Hata', detail: 'Çöp sepetindeki siparişler getirilirken bir hata oluştu.'});
        }).finally(() => {
            setLoading(false);
        });
    }
    useEffect(() => {
        getDealers();
        getProducts();
    }, [])
    useEffect(() => {
        localStorage.setItem('selectedColumnsForOrdersTable', JSON.stringify(selectedColumns));
    }, [selectedColumns]);
    const onGlobalFilterChange = (e, action = false) => {
        const value = action ? e : e.target.value;
        let _filters = {...filters};

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };
    const [addModal, setAddModal] = useState(false);
    const [updateModal, setUpdateModal] = useState(false);
    const [productsModal, setProductsModal] = useState(false);
    const [productsModalData, setProductsModalData] = useState(false);
    const [updateModalData, setUpdateModalData] = useState(false);
    const [addModalFooter, setAddModalFooter] = useState(<></>);
    const [updateModalFooter, setUpdateModalFooter] = useState(<></>);
    const [selectedRows, setSelectedRows] = useState([]);
    const [productCodesModal, setProductCodesModal] = useState(false);
    const [productCodes, setProductCodes] = useState([]);
    const [productCodesFooter, setProductCodesFooter] = useState(<></>);
    const prepareShowCodes = (order) => {
        setProductCodesModal(true);
        setProductCodes(order);
    }
    const renderHeader = () => {
        return (
            <>
                <Toolbar
                    start={() => <><Button icon="pi pi-plus" size={"small"} severity={"success"}
                                           tooltip={"Yeni Sipariş Ekle"}
                                           tooltipOptions={{
                                               position: 'top'
                                           }} onClick={() => {
                        setAddModal(true);
                    }} className="mr-2"/>
                        <Button icon="pi pi-bars" size={"small"} severity={"info"} tooltip={"Kolonları Yönet"}
                                tooltipOptions={{
                                    position: 'top'
                                }} onClick={(event) => {
                            op.current.toggle(event);
                        }} className="mr-2"/>
                        <Button icon={trashMode ? "pi pi-folder-open":"pi pi-trash"} size={"small"} severity={"help"} tooltip={trashMode ? "Çöp Sepetini Kapat" : "Çöp Sepetini Görüntüle"}
                                tooltipOptions={{
                                    position: 'top'
                                }} onClick={(event) => {
                            if (trashMode) {
                                setRecords(recordsX);
                                setTrashMode(false);
                            }else{
                                getTrashRecords();
                            }
                        }} className="mr-2"/>
                        {selectedRows.length > 0 && (<>
                            <Button size={"small"}
                                    icon="pi pi-times" className="p-button-warning mr-2"
                                    onClick={() => setSelectedRows([])} tooltip={"Seçimi Temizle"} tooltipOptions={{
                                position: 'top'
                            }}/>
                            <Button size={"small"}
                                    onClick={(event) => {
                                        confirmPopup({
                                            target: event.currentTarget,
                                            message: trashMode ?`Seçilen ${setSelectedRows.length} siparişi geri yüklemek istediğinize emin misiniz?` :`Seçilen ${setSelectedRows.length} siparişi silmek istediğinize emin misiniz?`,
                                            icon: 'pi pi-exclamation-triangle',
                                            defaultFocus: 'reject',
                                            acceptClassName: 'p-button-danger',
                                            accept: () => {
                                                let url = trashMode ? route('super.orders.restore') : route('super.orders.multipleDestroy');
                                                fetch(url, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'X-CSRF-TOKEN': csrf_token
                                                    },
                                                    body: JSON.stringify({
                                                        recordIds: selectedRows.map(order => order.id)
                                                    })
                                                }).then(async response => {
                                                    let data = await response.json();
                                                    if (response.status === 404) {
                                                        toast.current.show({severity: 'error', summary: 'Hata', detail: data.message});
                                                    } else if (response.status === 500) {
                                                        toast.current.show({severity: 'warning', summary: 'Hata', detail: data.message});
                                                    } else if (response.status === 200) {
                                                        toast.current.show({severity: 'success', summary: 'Başarılı', detail: data.message});
                                                        setRecords(data.records);
                                                    }
                                                }).catch((error) => {
                                                    toast.current.show({
                                                        severity: 'error',
                                                        summary: 'Hata',
                                                        detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
                                                    });
                                                }).finally(() => {
                                                    setSelectedRows([]);
                                                });
                                            },
                                            acceptLabel: trashMode ? "Geri Yükle" : "Sil",
                                            rejectLabel: 'Vazgeç'
                                        });
                                    }}
                                    icon={trashMode ? "pi pi-sync":"pi pi-trash"} className={trashMode ? "p-button-success mr-2" : "p-button-danger mr-2"}
                                    tooltip={trashMode ? "Seçilen " + `${selectedRows.length}` + " siparişi geri yükle" :"Seçilen " + `${selectedRows.length}` + " siparişi Sil"} tooltipOptions={{
                                position: 'top'
                            }}/>
                        </>)}
                    </>}
                    center={() => <><p className={"flex flex-col items-center justify-center"}>
                        {trashMode && (<h3 className={"text-white font-semibold text-lg"}>Çöp Sepeti</h3>)}
                        {selectedRows.length > 0 && (
                            <span>{selectedRows.length} sipariş seçildi.</span>
                       )}</p>
                    </>}
                    end={() => <>
                        {!trashMode && <>
                    <span className="p-input-icon-left">
                            <i className="pi pi-search"/>
                            <InputText size={"small"} value={globalFilterValue} onChange={onGlobalFilterChange}
                                       placeholder="Stok Kayıtlarında Arama Yapın"/>
                    </span>{globalFilterValue !== '' && (<Button size={"small"}
                                                                 icon="pi pi-times" className="p-button-info ml-2"
                                                                 onClick={() => onGlobalFilterChange('', true)}
                                                                 tooltip={"Filtreyi Temizle"} tooltipOptions={{
                            position: 'top'
                        }}/>)}</>}
                    </>}/>
            </>
        );
    };
    const verifiedBodyTemplate = (rowData) => {
        return <Tag value={rowData.status_label} severity={rowData.status_severity}/>;
    };
    const header = renderHeader();
    const updatePreparation = (rowData) => {
        setUpdateModal(true);
        setUpdateModalData(rowData);
    }
    const changeStatus = (e) => {
        let newData = e.newRowData;
        let oldData = e.rowData;
        let RowIndex = e.rowIndex;
        let formData = new FormData();
        formData.append('status', newData.status);
        formData.append('_method', 'PUT');
        if (newData.status === oldData.status) return;
        setLoading(true)
        fetch(route('super.orders.statusUpdate', newData.id), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrf_token,
            },
            body: formData
        }).then(r => r.json()).then(data => {
            if (data.status) {
                if (data?.dirty !== false) {
                    setRecords(prevState => {
                        let _records = [...prevState];
                        _records[RowIndex]["status_severity"] = statuses.find(status => status.value === newData.status).severity;
                        _records[RowIndex]["status_label"] = statuses.find(status => status.value === newData.status).label;
                        _records[RowIndex]["status"] = newData.status;
                        _records[RowIndex]["updated_at"] = data.updated_at;
                        return _records;
                    });
                    toast.current.show({severity: 'success', summary: 'İşlem Başarılı', detail: data.message});
                }
            } else {
                toast.current.show({severity: 'error', summary: 'Hata', detail: data.message});
            }
        }).catch((err) => {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
            });
        }).finally(() => {
            setLoading(false);
        });
    }
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2
                className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Siparişler</h2>}
        >
            <Head title="Siparişler"/>
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
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <DataTable editMode="cell" dragSelection value={records} removableSort paginator
                                   paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                                   rowsPerPageOptions={[5, 10, 25, 50]} rows={10} filters={filters}
                                   loading={loading}
                                   globalFilterFields={[]}
                                   selectionMode={"checkbox"}
                                   selection={selectedRows}
                                   onSelectionChange={(e) => setSelectedRows(e.value)}
                                   header={header}
                                   rowClassName={(rowData) => rowData.deleted_at !== null ? 'blur-[.8px] hover:blur-none  ease-in duration-300' : ''}
                                   emptyMessage="Sipariş bulunamadı."
                                   rowHover dataKey="id"
                                   currentPageReportTemplate="{first}. ile {last}. arası toplam {totalRecords} kayıttan">
                            <Column selectionMode="multiple" headerStyle={{width: '3rem'}}></Column>
                            {selectedColumns.includes('id') && <Column field="id" header="ID" sortable/>}
                            {selectedColumns.includes('dealer') && <Column field="dealer.name" align={"center"}
                                                                           body={(rowData) => <Button link
                                                                                                      size={"small"}
                                                                                                      label={rowData.dealer.name}
                                                                                                      onClick={() => router.visit(route('super.dealers.show', rowData.dealer.id))}/>}
                                                                           sortable header="Bayi Adı"/>}
                            {selectedColumns.includes('user') && <Column field="user.name" sortable header="Yetkili"/>}
                            {selectedColumns.includes('status') && <Column
                                field="status"
                                header="Durumu"
                                body={verifiedBodyTemplate}
                                editor={trashMode ? null:(props) => {
                                    setActiveStatus(props.rowData.status);
                                    return <>
                                        <Dropdown value={activeStatus} onChange={(e) => props.editorCallback(e.value)}
                                                  options={statuses}
                                                  optionLabel="label"
                                                  className="w-full"/>
                                    </>
                                }}
                                onCellEditComplete={changeStatus}
                            />}
                            {selectedColumns.includes('products_count') &&
                                <Column field="products_count" body={(rowData) => <Button link onClick={() => {
                                    if(rowData.products_count === 0){
                                        toast.current.show({severity: 'info', summary: 'Bilgi', detail: 'Siparişte ürün bulunmamaktadır.'});
                                    }else{
                                        setProductsModal(true);
                                        setProductsModalData(rowData.products);
                                    }
                                }} tooltip={"Detayları Görmek İçin Tıklayınız."}
                                                                                          label={rowData.products_count + " Adet"}
                                                                                          size={"small"}/>} sortable
                                        header="Ürün Adedi"/>}
                            {selectedColumns.includes('price') &&
                                <Column field="price" header="Sipariş Tutarı" body={(rowData) => Number(rowData.price).toFixed(2) + " TL"}
                                        sortable/>}
                            {selectedColumns.includes('created_at') &&
                                <Column field="created_at" sortable header="Eklenme Tarihi"
                                        body={(rowData) => new Date(rowData.created_at).toLocaleString()}/>}
                            {selectedColumns.includes('updated_at') &&
                                <Column field="updated_at" sortable header="Güncellenme Tarihi"
                                        body={(rowData) => new Date(rowData.updated_at).toLocaleString()}/>}
                            {selectedColumns.includes('actions') && !trashMode && <Column field="actions" header="İşlemler" body={(rowData) => {
                                return <>
                                    <div className={"flex justify-center gap-x-2"}>
                                        <Button icon="pi pi-qrcode" size={"small"} tooltip={"Ürün Kodları"}
                                                onClick={() => {
                                                    prepareShowCodes(rowData);
                                                }}
                                                tooltipOptions={{
                                                    position: 'top'
                                                }} severity={"success"}/>
                                        <Button icon="pi pi-pencil" size={"small"} tooltip={"Siparişi Düzenle"}
                                                onClick={() => {
                                                    updatePreparation(rowData);
                                                }}
                                                tooltipOptions={{
                                                    position: 'top'
                                                }} severity={"warning"}/>
                                        <Button icon="pi pi-times" tooltip={"Siparişi Sil"}
                                                tooltipOptions={{
                                                    position: 'top',
                                                }} size={"small"} onClick={(event) => {
                                            confirmPopup({
                                                target: event.currentTarget,
                                                message: 'Siparişi silmek istediğinize emin misiniz?',
                                                icon: 'pi pi-exclamation-triangle',
                                                acceptClassName: 'p-button-danger',
                                                accept: () => {
                                                    fetch(route('super.orders.destroy', rowData.id), {
                                                        method: 'DELETE',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'X-CSRF-TOKEN': csrf_token
                                                        },
                                                    }).then(async response => {
                                                        let data = await response.json();
                                                        if (response.status === 404) {
                                                            toast.current.show({severity: 'error', summary: 'Hata', detail: data.message});
                                                        } else if (response.status === 500) {
                                                            toast.current.show({severity: 'warning', summary: 'Hata', detail: data.message});
                                                        } else if (response.status === 200) {
                                                            toast.current.show({severity: 'success', summary: 'Başarılı', detail: data.message});
                                                            setRecords(prevState => {
                                                                return prevState.filter(record => record.id !== rowData.id);
                                                            });
                                                        }
                                                    }).catch((error) => {
                                                        toast.current.show({
                                                            severity: 'error',
                                                            summary: 'Hata',
                                                            detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
                                                        });
                                                    });
                                                },
                                                acceptLabel: 'Sil',
                                                rejectLabel: 'Vazgeç',
                                            });
                                        }} severity={"danger"}/>
                                    </div>
                                </>
                            }}/>}
                        </DataTable>
                    </div>
                </div>
            </div>
            <Dialog header="Yeni Sipariş Ekle" style={{width: '70vw'}} breakpoints={{'960px': '75vw', '641px': '100vw'}}
                    onHide={() => setAddModal(false)} maximizable visible={addModal} footer={addModalFooter}>
                <Create addModal={addModal} csrf_token={csrf_token} dealers={dealers} products={products} toast={toast}
                        onHide={() => setAddModal(false)} setRecords={setRecords}
                        setAddModalFooter={setAddModalFooter}/>
            </Dialog>
            <Dialog header="Ürünler" style={{width: '50vw'}} breakpoints={{'960px': '75vw', '641px': '100vw'}}
                    onHide={() => setProductsModal(false)} maximizable visible={productsModal} footer={() => {
                return <Button label="Kapat" onClick={() => setProductsModal(false)} severity={"warning"}
                               size={"small"}/>
            }}>
                {productsModal && <div className={"card flex flex-col"}>
                    {productsModalData.map(item => {
                        let product = item.product;
                        return <>
                            <div className="flex p-2 items-center gap-3 ">
                                <Image className="w-[4rem] shadow-2 flex-shrink-0 border-round" preview
                                       src={product.image} alt={product.name}/>
                                <span className="font-bold flex-1">{item.quantity} Adet - {product.name} (#{product.sku})</span>
                                <span className="font-bold text-900">₺ {item.price}</span>
                            </div>
                            <Divider/>
                        </>
                    })}
                    <div className="flex p-2 items-center gap-3 ">
                        <span className="font-bold flex-1">Toplam</span>
                        <span className="font-bold text-900">₺ {
                            productsModalData.reduce((acc, item) => {
                                return acc + (item.price * item.quantity);
                            }, 0)
                        }</span>
                    </div>
                </div>}
            </Dialog>
            <Dialog header="Siparişi Düzenle" style={{width: '70vw'}} breakpoints={{'960px': '75vw', '641px': '100vw'}}
                    onHide={() => setUpdateModal(false)} maximizable visible={updateModal} footer={updateModalFooter}>
                <Update updateModal={updateModal} salesmans={salesmans} statuses={statuses} csrf_token={csrf_token}
                        dealers={dealers} products={products} record={updateModalData} toast={toast}
                        onHide={() => setUpdateModal(false)} setRecords={setRecords}
                        setUpdateModalFooter={setUpdateModalFooter}/>
            </Dialog>
            <Dialog header="Ürün Kodları" style={{ width: '70vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }} onHide={() => setProductCodesModal(false)} maximizable visible={productCodesModal} footer={productCodesFooter}>
                <ProductCodes productCodesModal={productCodesModal} order={productCodes} setRecords={setRecords} csrf_token={csrf_token} toast={toast} onHide={() => setProductCodesModal(false)} setFooter={setProductCodesFooter}/>
            </Dialog>
        </AuthenticatedLayout>
    );
}
