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
import Create from "@/Pages/Super/Central/Create.jsx";
import Update from "@/Pages/Super/Central/Update.jsx";
import {Avatar} from "primereact/avatar";
import {useLocalStorage} from "primereact/hooks"
export default function Index({auth, usersAll, csrf_token,roles}) {
    const toast = useRef(null);
    const op = useRef(null);
    const [filters, setFilters] = useState({
        global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [updateWorker, setUpdateWorker] = useState({});
    const [users, setUsers] = useState(usersAll);
    const columns = [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'avatar',
        'active',
        'updated_at',
        'created_at',
        'actions'
    ];
    const columnsTurkishNames = {
        'id': 'ID',
        'name': 'Üye Adı',
        'avatar': 'Avatar Resmi',
        'active': 'Üyelik Durumu',
        'phone': 'Telefon',
        'role': 'Rolü',
        'email': 'Email',
        'updated_at': 'Güncellenme Tarihi',
        'created_at': 'Eklenme Tarihi',
        'actions': 'İşlemler'
    }
    const [selectedColumns, setSelectedColumns] = useLocalStorage(columns,'super-central-users-table-columns')
    const [addModal, setAddModal] = useState(false);
    const [updateModal, setUpdateModal] = useState(false);
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
                    <Button icon="pi pi-plus" size={"small"} severity={"success"} tooltip={"Yeni Merkez Üyesi Ekle"}
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
                    {selectedUsers.length > 0 && (<>
                        <Button size={"small"}
                                icon="pi pi-times" className="p-button-warning mr-2"
                                onClick={() => setSelectedUsers([])} tooltip={"Seçimi Temizle"} tooltipOptions={{
                            position: 'top'
                        }}/>
                        <Button size={"small"}
                                onClick={(event) => {
                                    confirmPopup({
                                        target: event.currentTarget,
                                        message: `Seçilen ${selectedUsers.length} Merkez Üyelerini silmek istediğinize emin misiniz?`,
                                        icon: 'pi pi-info-circle',
                                        defaultFocus: 'reject',
                                        acceptClassName: 'p-button-danger',
                                        accept: () => {
                                            let url = route('super.central.multipleDestroy');
                                            fetch(url, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'X-CSRF-TOKEN': csrf_token
                                                },
                                                body: JSON.stringify({
                                                    workerIds: selectedUsers.map(user => user.id)
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
                                                    setUsers(users.map(produc => {
                                                        if (!selectedUsers.map(user => user.id).includes(produc.id)) {
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
                                                setSelectedUsers([]);
                                            });
                                        },
                                        acceptLabel: 'Sil',
                                        rejectLabel: 'Vazgeç'
                                    });
                                }}
                                icon="pi pi-trash" className="p-button-danger"
                                tooltip={"Seçilen " + `${selectedUsers.length}` + " Merkez Üyesini Sil"} tooltipOptions={{
                            position: 'top'
                        }}/>
                    </>)}
                </>}
                         center={() => <>
                             {selectedUsers.length > 0 && (<p>
                                 <span>{selectedUsers.length} merkez üyesi seçildi.</span>
                             </p>)}
                         </>}
                         end={() => <>

                    <span className="p-input-icon-left">
                            <i className="pi pi-search"/>
                            <InputText size={"small"} value={globalFilterValue} onChange={onGlobalFilterChange}
                                       placeholder="Merkez Üyelerinde Arama Yapın"/>
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
    const confirmPopupForUserDelete = (event, itemId) => {
        const deleteFunction = () => {
            fetch(route('super.central.destroy', itemId), {
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
                    toast.current.show({severity: 'success', summary: 'Başarılı', detail: data.message});
                    setUsers(users.map(user => user.id !== itemId ? user : null).filter(Boolean));
                }
            }).catch((error) => {
                console.log(error)
                toast.current.show({
                    severity: 'error',
                    summary: 'Hata',
                    detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
                });
            }).finally(() => {
                setSelectedUsers(selectedUsers.filter(user => user.id !== itemId ? user : null).filter(Boolean));
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
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Merkez Üyeleri</h2>}
        >
            <Head title="Merkez Üyeleri"/>
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
                        <DataTable dragSelection value={users} removableSort paginator
                                   paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                                   rowsPerPageOptions={[5, 10, 25, 50]} rows={10} dataKey="id" filters={filters}
                                   loading={false}
                                   selectionMode={null} selection={selectedUsers}
                                   onSelectionChange={(e) => setSelectedUsers(e.value)}
                                   globalFilterFields={['name', 'email', 'phone']}
                                   header={header}
                                   emptyMessage="Merkez Üyesi bulunamadı."
                                   currentPageReportTemplate="{first}. ile {last}. arası toplam {totalRecords} kayıttan">
                            <Column selectionMode="multiple" headerStyle={{width: '3rem'}}></Column>
                            {selectedColumns.includes('id') && <Column field="id" sortable header="#"/>}
                            {selectedColumns.includes('name') && <Column field="name" sortable header="Üye Adı"/>}
                            {selectedColumns.includes('email') && <Column field="email" sortable header="Email"/>}
                            {selectedColumns.includes('phone') && <Column field="phone" sortable header="Telefon No"/>}
                            {selectedColumns.includes('role') && <Column field="role_label" sortable header="Rolü"/>}
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
                                    <Button icon="pi pi-pencil" size={"small"} tooltip={"Hızlı Düzenle"}
                                            tooltipOptions={{
                                                position: 'top'
                                            }} severity={"warning"} onClick={() => {
                                        updateWorkerPrepare(user);
                                    }}/>
                                    <Button icon="pi pi-times" tooltip={"Merkez Üyesini Sil"}
                                            tooltipOptions={{
                                                position: 'top',
                                            }} size={"small"} onClick={(event) => {
                                        confirmPopupForUserDelete(event, user.id);
                                    }} severity={"danger"}/>
                                </div>
                            }}/>}
                        </DataTable>
                        <Dialog header="Yeni Merkez Üyesi Ekle" style={{ width: '50vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }} onHide={() => setAddModal(false)} maximizable visible={addModal} footer={addModalFooter}>
                            <Create addModal={addModal} csrf_token={csrf_token} toast={toast} onHide={() => setAddModal(false)} roles={roles} setUsers={setUsers} setAddModalFooter={setAddModalFooter}/>
                        </Dialog>
                        <Dialog header="Merkez Üyesini Düzenle" style={{ width: '50vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }} onHide={() => setUpdateModal(false)} maximizable visible={updateModal} footer={updateModalFooter}>
                            <Update updateModal={updateModal} user={updateWorker} csrf_token={csrf_token} toast={toast} roles={roles} onHide={() => setUpdateModal(false)} setUsers={setUsers} setUpdateModalFooter={setUpdateModalFooter}/>
                        </Dialog>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
