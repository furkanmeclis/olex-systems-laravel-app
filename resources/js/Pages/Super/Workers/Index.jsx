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
import {Avatar} from "primereact/avatar";
import {useLocalStorage} from "primereact/hooks";
import Create from "@/Pages/Super/Workers/Create.jsx";
import Update from "@/Pages/Super/Workers/Update.jsx";
import {ButtonGroup} from "primereact/buttongroup";

export default function Workers({auth, workersAll, csrf_token, dealer}) {
    const toast = useRef(null);
    const op = useRef(null);
    const [filters, setFilters] = useState({
        global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const [workers, setWorkers] = useState(workersAll);
    const [dealers, setDealers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const [updateWorker, setUpdateWorker] = useState({});
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
    useEffect(() => {
        getDealers();
    }, [])
    const columns = [
        'id',
        'name',
        'dealer_name',
        'email',
        'phone',
        'avatar',
        'active',
        'updated_at',
        'created_at',
        'actions'
    ];
    const columnsTurkishNames = {
        'id': 'ID',
        'name': 'Çalışan Adı',
        'avatar': 'Avatar Resmi',
        'dealer_name': 'Bayi Adı',
        'active': 'Üyelik Durumu',
        'phone': 'Telefon',
        'role': 'Rol',
        'email': 'Email',
        'updated_at': 'Güncellenme Tarihi',
        'created_at': 'Eklenme Tarihi',
        'actions': 'İşlemler'
    }
    const [selectedColumns, setSelectedColumns] = useLocalStorage(columns, 'super-workers-table-columns');
    const [addModal, setAddModal] = useState(false);
    const [updateModal, setUpdateModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [viewWorker, setViewWorker] = useState({});
    const onGlobalFilterChange = (e, action = false) => {
        const value = action ? e : e.target.value;
        let _filters = {...filters};

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };
    const renderHeader = () => {
        return (
            <>
                <Toolbar start={() => <>
                    <Button icon="pi pi-plus" size={"small"} severity={"success"} tooltip={"Yeni Çalışan Ekle"}
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
                    {/*<Button icon="pi pi-print" size={"small"} className="mr-2"/>*/}
                    {selectedWorkers.length > 0 && (<>
                        <Button size={"small"}
                                icon="pi pi-times" className="p-button-warning mr-2"
                                onClick={() => setSelectedWorkers([])} tooltip={"Seçimi Temizle"} tooltipOptions={{
                            position: 'top'
                        }}/>
                        <Button size={"small"}
                                onClick={(event) => {
                                    confirmPopup({
                                        target: event.currentTarget,
                                        message: `Seçilen ${selectedWorkers.length} çalışanı silmek istediğinize emin misiniz?`,
                                        icon: 'pi pi-info-circle',
                                        defaultFocus: 'reject',
                                        acceptClassName: 'p-button-danger',
                                        accept: () => {
                                            let url = route('super.workers.multipleDestroy');
                                            fetch(url, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'X-CSRF-TOKEN': csrf_token
                                                },
                                                body: JSON.stringify({
                                                    workerIds: selectedWorkers.map(worker => worker.id),
                                                    dealerId: dealer.id
                                                })
                                            }).then(async response => {
                                                let data = await response.json();
                                                if (response.status === 404) {
                                                    toast.current.show({
                                                        severity: 'error',
                                                        summary: 'Hata',
                                                        detail: data.message
                                                    });
                                                } else if (response.status === 500) {
                                                    toast.current.show({
                                                        severity: 'warning',
                                                        summary: 'Hata',
                                                        detail: data.message
                                                    });
                                                } else if (response.status === 200) {
                                                    toast.current.show({
                                                        severity: 'success',
                                                        summary: 'Başarılı',
                                                        detail: data.message
                                                    });
                                                    setWorkers(workers.map(produc => {
                                                        if (!selectedWorkers.map(worker => worker.id).includes(produc.id)) {
                                                            return produc
                                                        } else {
                                                            return null
                                                        }
                                                    }).filter(Boolean));
                                                }
                                            }).catch((error) => {
                                                console.log(error)
                                                toast.current.show({
                                                    severity: 'error',
                                                    summary: 'Hata',
                                                    detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
                                                });
                                            }).finally(() => {
                                                setSelectedWorkers([]);
                                            });
                                        },
                                        acceptLabel: 'Sil',
                                        rejectLabel: 'Vazgeç'
                                    });
                                }}
                                icon="pi pi-trash" className="p-button-danger"
                                tooltip={"Seçilen " + `${selectedWorkers.length}` + " çalışanı Sil"} tooltipOptions={{
                            position: 'top'
                        }}/>
                    </>)}
                </>}
                         center={() => <>
                             <div className={"flex flex-col items-center justify-center"}>
                                 {selectedWorkers.length > 0 && (
                                     <span>{selectedWorkers.length} çalışan seçildi.</span>
                                 )}</div>
                         </>}
                         end={() => <>

                    <span className="p-input-icon-left">
                            <i className="pi pi-search"/>
                            <InputText size={"small"} value={globalFilterValue} onChange={onGlobalFilterChange}
                                       placeholder="Çalışanlarda Arama Yapın"/>
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
        return <Button className={"flex justify-center"}
                       tooltip={Boolean(rowData.active) === true ? "Aktif" : "DeAktif"} tooltipOptions={{
            position: 'top',
            mouseTrack: true
        }} unstyled>
            <i className={classNames('pi ', {
                'true-icon pi-check-circle text-green-400': Boolean(rowData.active),
                'false-icon pi-times-circle text-red-400': !Boolean(rowData.active)
            })}></i>
        </Button>;
    };
    const header = renderHeader();
    const confirmPopupForDealerDelete = (event, itemId, callback = () => {
    }) => {
        const deleteFunction = () => {
            fetch(route('super.workers.destroy', itemId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf_token
                }
            }).then(async response => {
                let data = await response.json();
                if (response.status === 404) {
                    toast.current.show({severity: 'error', summary: 'Hata', detail: data.message});
                } else if (response.status === 500) {
                    toast.current.show({severity: 'warning', summary: 'Hata', detail: data.message});
                } else if (response.status === 200) {
                    callback();
                    toast.current.show({severity: 'success', summary: 'Başarılı', detail: data.message});
                    setWorkers(workers.map(worker => worker.id !== itemId ? worker : null).filter(Boolean));
                }
            }).catch((error) => {
                console.log(error)
                toast.current.show({
                    severity: 'error',
                    summary: 'Hata',
                    detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
                });
            }).finally(() => {
                setSelectedWorkers(selectedWorkers.filter(dealer => dealer.id !== itemId ? dealer : null).filter(Boolean));
            });

        };

        confirmPopup({
            target: event.currentTarget,
            message: 'Bu işlemi gerçekleştirmek istediğinize emin misiniz?',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: deleteFunction,
            acceptLabel: 'Sil',
            rejectLabel: 'Vazgeç'
        });
    };
    const [addModalFooter, setAddModalFooter] = useState(<></>);
    const [updateModalFooter, setUpdateModalFooter] = useState(<></>);
    const updateWorkerPrepare = (user) => {
        setUpdateWorker(user);
        setUpdateModal(true);
    }
    const viewWorkerPrepare = (user) => {
        setViewWorker(user);
        setViewModal(true);
    }
    return (<AuthenticatedLayout
            user={auth.user}
            header={<h2
                className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Çalışanlar</h2>}
        >
            <Head title="Çalışanlar"/>

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <>
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
                                                <Checkbox inputId={column} checked={selectedColumns.includes(column)}
                                                          onChange={(e) => {
                                                              let _selectedColumns = [...selectedColumns];
                                                              if (e.checked) {
                                                                  _selectedColumns.push(column);
                                                              } else {
                                                                  _selectedColumns = _selectedColumns.filter(col => col !== column);
                                                              }
                                                              setSelectedColumns(_selectedColumns);
                                                          }}/>
                                                <label htmlFor={column}
                                                       className="ml-2">{columnsTurkishNames[column]}</label>
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
                            <DataTable dragSelection value={workers} removableSort paginator
                                       paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                                       rowsPerPageOptions={[5, 10, 25, 50]} rows={10} dataKey="id" filters={filters}
                                       loading={false}
                                       selectionMode={null} selection={selectedWorkers}
                                       onSelectionChange={(e) => setSelectedWorkers(e.value)}
                                       globalFilterFields={['name', 'email', 'phone']}
                                       header={header}
                                       emptyMessage="Çalışan bulunamadı."
                                       currentPageReportTemplate="{first}. ile {last}. arası toplam {totalRecords} kayıttan">
                                <Column selectionMode="multiple" headerStyle={{width: '3rem'}}></Column>
                                {selectedColumns.includes('id') && <Column field="id" sortable header="#"/>}
                                {selectedColumns.includes('name') &&
                                    <Column field="name" sortable header="Çalışan Adı"/>}
                                {selectedColumns.includes('dealer_name') &&
                                    <Column field="dealer.company.company_name" sortable header="Bayi Adı"
                                            body={(rowData) => {
                                                return <Button label={rowData.dealer.name} link size={"small"}
                                                               onClick={() => {
                                                                   router.visit(route('super.dealers.show', rowData.dealer.id));
                                                               }}/>
                                            }}/>}
                                {selectedColumns.includes('email') && <Column field="email" sortable header="Email"/>}
                                {selectedColumns.includes('phone') &&
                                    <Column field="phone" sortable header="Telefon No"/>}
                                {selectedColumns.includes('avatar') &&
                                    <Column field="image" header="Avatar" body={(user) => {
                                        return <Avatar image={user.avatar} shape="circle" size={"large"}/>
                                    }}/>}
                                {selectedColumns.includes('active') &&
                                    <Column field="active" header="Durumu" dataType="boolean"
                                            body={verifiedBodyTemplate}/>}
                                {selectedColumns.includes('created_at') &&
                                    <Column field="created_at" sortable header="Eklenme Tarihi"
                                            body={(rowData) => new Date(rowData.created_at).toLocaleString()}/>}
                                {selectedColumns.includes('updated_at') &&
                                    <Column field="updated_at" sortable header="Güncellenme Tarihi"
                                            body={(rowData) => new Date(rowData.updated_at).toLocaleString()}/>}
                                {selectedColumns.includes('actions') && <Column header="İşlemler" body={(user) => {
                                    return <div className={"flex justify-center gap-x-2"}>
                                        <Button icon="pi pi-eye" size={"small"} tooltip={"Çalışanı Görüntüle"}
                                                tooltipOptions={{
                                                    position: 'top'
                                                }} severity={"info"} onClick={() => {
                                            viewWorkerPrepare(user);
                                        }}/>
                                        <Button icon="pi pi-pencil" size={"small"} tooltip={"Çalışanı Düzenle"}
                                                tooltipOptions={{
                                                    position: 'top'
                                                }} severity={"warning"} onClick={() => {
                                            updateWorkerPrepare(user);
                                        }}/>
                                        <Button icon="pi pi-times" tooltip={"Çalışanı Sil"}
                                                tooltipOptions={{
                                                    position: 'top',
                                                }} size={"small"} onClick={(event) => {
                                            confirmPopupForDealerDelete(event, user.id);
                                        }} severity={"danger"}/>
                                    </div>
                                }}/>}
                            </DataTable>
                            <Dialog header="Yeni Çalışan Ekle" style={{width: '50vw'}}
                                    breakpoints={{'960px': '75vw', '641px': '100vw'}} onHide={() => setAddModal(false)}
                                    maximizable visible={addModal} footer={addModalFooter}>
                                <Create dealerId={1} dealers={dealers} onHide={() => setAddModal(false)}
                                        csrf_token={csrf_token} toast={toast} setWorkers={setWorkers}
                                        addModal={addModal} setAddModalFooter={setAddModalFooter}/>
                            </Dialog>
                            <Dialog header="Çalışanı Düzenle" style={{width: '50vw'}}
                                    breakpoints={{'960px': '75vw', '641px': '100vw'}}
                                    onHide={() => setUpdateModal(false)} maximizable visible={updateModal}
                                    footer={updateModalFooter}>
                                <Update updateModal={updateModal} dealers={dealers} worker={updateWorker}
                                        csrf_token={csrf_token} toast={toast} onHide={() => setUpdateModal(false)}
                                        setWorkers={setWorkers} setUpdateModalFooter={setUpdateModalFooter}/>
                            </Dialog>
                            <Dialog header="Çalışanı Görüntüle" style={{width: '40vw'}}
                                    breakpoints={{'960px': '75vw', '641px': '100vw'}} onHide={() => setViewModal(false)}
                                    maximizable visible={viewModal}>
                                {viewWorker && <div className="flex flex-col gap-y-2">
                                    <div className="flex flex-col gap-y-2">
                                        <div className="flex justify-between items-center">
                                            <h3 className={"text-lg text-white font-semibold border-b pb-2"}>Çalışan
                                                Bilgileri</h3>
                                        </div>
                                        <div className="flex flex-col gap-y-2 mb-3">
                                            <div className="flex flex-col gap-y-1">
                                                <div className="flex justify-between items-center">
                                                    <label>Çalışan Adı:</label>
                                                    <span>{viewWorker.name}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label>Email:</label>
                                                    <span>{viewWorker.email}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label>Telefon:</label>
                                                    <span>{viewWorker.phone}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label>Üyelik Durumu:</label>
                                                    <span>{Boolean(viewWorker.active) ? "Aktif" : "DeAktif"}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label>Eklenme Tarihi:</label>
                                                    <span>{new Date(viewWorker.created_at).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label>Güncellenme Tarihi:</label>
                                                    <span>{new Date(viewWorker.updated_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <hr/>
                                        <div className="flex justify-between items-center mt-1">
                                            <h3 className={"text-lg text-white font-semibold border-b pb-2"}>Bayi
                                                Bilgileri</h3>
                                        </div>
                                        <div className="flex flex-col gap-y-2 mb-3">
                                            <div className="flex flex-col gap-y-1">
                                                <div className="flex justify-between items-center">
                                                    <label>Bayi Adı:</label>
                                                    <span>{viewWorker.dealer?.company?.company_name}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label>Bayi Email:</label>
                                                    <span>{viewWorker.dealer?.company?.company_email}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label>Bayi Telefon:</label>
                                                    <span>{viewWorker.dealer?.company?.company_phone}</span>
                                                </div>
                                                <hr/>
                                                <div className="flex justify-between items-center">
                                                    <label>Bayi Yönetici Adı:</label>
                                                    <span>{viewWorker.dealer?.name}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label>Bayi Yönetici Email:</label>
                                                    <span>{viewWorker.dealer?.email}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label>Bayi Yönetici Telefon:</label>
                                                    <span>{viewWorker.dealer?.phone}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label>Bayi Yönetici Üyelik Durumu:</label>
                                                    <span>{Boolean(viewWorker.dealer?.active) ? "Aktif" : "DeAktif"}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label>Eklenme Tarihi:</label>
                                                    <span>{new Date(viewWorker?.dealer?.created_at).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label>Güncellenme Tarihi:</label>
                                                    <span>{new Date(viewWorker?.dealer?.updated_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={"text-center mt-3"}>
                                            <ButtonGroup>
                                                <Button label="Kapat" icon="pi pi-times" severity={"info"} size={"small"}
                                                        onClick={() => {
                                                            setViewModal(false);
                                                            setViewWorker({});
                                                        }}/>
                                                <Button label="Hizmet Kayıtları" icon="pi pi-file" size={"small"} severity={"help"}
                                                        onClick={() => {
                                                            // TODO: Hizmet Kayıtları
                                                        }}/>
                                                <Button label="Düzenle" icon="pi pi-pencil" size={"small"} severity={"warning"}
                                                        onClick={(e) => {
                                                            setViewModal(false);
                                                            setViewWorker({});
                                                            updateWorkerPrepare(viewWorker);
                                                        }}/>
                                                <Button label="Sil" icon="pi pi-trash" size={"small"} severity={"danger"}
                                                        onClick={(event) => {
                                                            confirmPopupForDealerDelete(event, viewWorker.id, () => {
                                                                setViewModal(false);
                                                                setViewWorker({});
                                                            });
                                                        }}/>
                                            </ButtonGroup>
                                        </div>
                                    </div>
                                </div>}
                            </Dialog>

                        </>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>

    );
}
