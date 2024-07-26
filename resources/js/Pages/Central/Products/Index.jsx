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
import Create from "@/Pages/Central/Products/Create.jsx";
import Update from "@/Pages/Central/Products/Update.jsx";

export default function Index({auth, productsAll, categoriesAll, csrf_token}) {
    const toast = useRef(null);
    const op = useRef(null);
    const [filters, setFilters] = useState({
        global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [updateProduct, setUpdateProduct] = useState({});
    const [categoryDialog, setCategoryDialog] = useState(false);
    const [categories, setCategories] = useState(categoriesAll);
    const [products, setProducts] = useState(productsAll);
    const [newCategoryName, setNewCategoryName] = useState('');
    const columns = [
        'id',
        'sku',
        'name',
        'image',
        'price',
        'category',
        'warranty',
        'active',
        'updated_at',
        'created_at',
        'actions'
    ];
    const columnsTurkishNames = {
        'id': 'ID',
        'sku': 'Stok Kodu',
        'name': 'Ürün Adı',
        'image': 'Ürün Resmi',
        'price': 'Ürün Fiyatı',
        'category': 'Kategori',
        'warranty': 'Garanti Süresi',
        'active': 'Ürün Durumu',
        'updated_at': 'Güncellenme Tarihi',
        'created_at': 'Eklenme Tarihi',
        'actions': 'İşlemler'
    }
    const [selectedColumns, setSelectedColumns] = useState(localStorage.getItem('selectedColumnsForProductsTable') ? JSON.parse(localStorage.getItem('selectedColumnsForProductsTable')) : columns);
    const [addModal, setAddModal] = useState(false);
    const [updateModal, setUpdateModal] = useState(false);
    useEffect(() => {
        localStorage.setItem('selectedColumnsForProductsTable', JSON.stringify(selectedColumns));
    }, [selectedColumns]);
    const onGlobalFilterChange = (e , action = false) => {
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
                    <Button icon="pi pi-plus" size={"small"} severity={"success"} tooltip={"Yeni Ürün Ekle"}
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
                    <Button icon="pi pi-sitemap" size={"small"} severity={"help"} tooltip={"Kategoriler"}
                            tooltipOptions={{
                                position: 'top'
                            }} onClick={() => {
                        setCategoryDialog(true);
                    }} className="mr-2"/>
                    {/*<Button icon="pi pi-print" size={"small"} className="mr-2"/>*/}
                    {selectedProducts.length > 0 && (<>
                        <Button size={"small"}
                                icon="pi pi-times" className="p-button-warning mr-2"
                                onClick={() => setSelectedProducts([])} tooltip={"Seçimi Temizle"} tooltipOptions={{
                            position: 'top'
                        }}/>
                        <Button size={"small"}
                                onClick={(event) => {
                                    confirmPopup({
                                        target: event.currentTarget,
                                        message: `Seçilen ${selectedProducts.length} ürünü silmek istediğinize emin misiniz?`,
                                        icon: 'pi pi-info-circle',
                                        defaultFocus: 'reject',
                                        acceptClassName: 'p-button-danger',
                                        accept: () => {
                                            let url = route('central.products.multipleDestroy');
                                            fetch(url, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'X-CSRF-TOKEN': csrf_token
                                                },
                                                body: JSON.stringify({
                                                    productIds: selectedProducts.map(product => product.id)
                                                })
                                            }).then(async response => {
                                                let data = await response.json();
                                                if (response.status === 404) {
                                                    toast.current.show({severity: 'error', summary: 'Hata', detail: data.message});
                                                } else if (response.status === 500) {
                                                    toast.current.show({severity: 'warning', summary: 'Hata', detail: data.message});
                                                } else if (response.status === 200) {
                                                    toast.current.show({severity: 'success', summary: 'Başarılı', detail: data.message});
                                                    setProducts(products.map(produc => {
                                                        if (!selectedProducts.map(product => product.id).includes(produc.id)) {
                                                            return produc
                                                        }else{
                                                            return null
                                                        }
                                                    }).filter(Boolean));
                                                }
                                            }).catch((error) => {
                                                toast.current.show({
                                                    severity: 'error',
                                                    summary: 'Hata',
                                                    detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
                                                });
                                            }).finally(() => {
                                                setSelectedProducts([]);
                                            });
                                        },
                                        acceptLabel: 'Sil',
                                        rejectLabel: 'Vazgeç'
                                    });
                                }}
                                icon="pi pi-trash" className="p-button-danger"
                                tooltip={"Seçilen " + `${selectedProducts.length}` + " Ürünü Sil"} tooltipOptions={{
                            position: 'top'
                        }}/>
                    </>)}
                </>}
                         center={() => <>
                             {selectedProducts.length > 0 && (<p>
                                 <span>{selectedProducts.length} ürün seçildi.</span>
                             </p>)}
                         </>}
                         end={() => <>

                    <span className="p-input-icon-left">
                            <i className="pi pi-search"/>
                            <InputText size={"small"} value={globalFilterValue} onChange={onGlobalFilterChange}
                                       placeholder="Ürünlerde Arama Yapın"/>
                    </span>{globalFilterValue !== '' && (<Button size={"small"}
                                                                 icon="pi pi-times" className="p-button-info ml-2"
                                                                 onClick={() => onGlobalFilterChange('',true)} tooltip={"Filtreyi Temizle"} tooltipOptions={{
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
    const confirmPopupForProductDelete = (event, itemId, item = "product") => {
        let isCategory = item === 'category';
        const deleteFunction = () => {
            if (isCategory) {
                fetch(route('central.categories.delete', itemId), {
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
                        setProducts(data.products);
                        setCategories(data.categories)
                    }
                }).catch((error) => {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Hata',
                        detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
                    });
                }).finally(() => {

                });
            } else {
                fetch(route('central.products.destroy', itemId), {
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
                        setProducts(products.map(product => product.id !== itemId ? product : null).filter(Boolean));
                    }
                }).catch((error) => {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Hata',
                        detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
                    });
                }).finally(() => {
                    setSelectedProducts(selectedProducts.filter(product => product.id !== itemId ? product : null).filter(Boolean));
                });
            }
        };

        confirmPopup({
            target: event.currentTarget,
            message: isCategory ? `Kategoriyi silmek istediğinize emin misiniz?` : `Ürünü silmek istediğinize emin misiniz?`,
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: deleteFunction,
            acceptLabel: 'Sil',
            rejectLabel: 'Vazgeç'
        });
    };
    const storeCategory = () => {
        fetch(route('central.categories.store'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf_token
            },
            body: JSON.stringify({
                name: newCategoryName
            })
        }).then(async response => {
            let data = await response.json();
            if (response.status === 404) {
                toast.current.show({severity: 'error', summary: 'Hata', detail: data.message});
            } else if (response.status === 500) {
                toast.current.show({severity: 'warning', summary: 'Hata', detail: data.message});
            } else if (response.status === 200) {
                toast.current.show({severity: 'success', summary: 'Başarılı', detail: data.message});
                setCategories(data.categories)

            }
        }).catch((error) => {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
            });
        }).finally(() => {
            setNewCategoryName('')
        });
    }
    const updateCategory = (category) => {
        fetch(route('central.categories.update', category.id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf_token
            },
            body: JSON.stringify({
                name: category.name
            })
        }).then(async response => {
            let data = await response.json();
            if (response.status === 404) {
                toast.current.show({severity: 'error', summary: 'Hata', detail: data.message});
            } else if (response.status === 500) {
                toast.current.show({severity: 'warning', summary: 'Hata', detail: data.message});
            } else if (response.status === 200) {
                toast.current.show({severity: 'success', summary: 'Başarılı', detail: data.message});
                setProducts(data.products);
                setCategories(data.categories)
            }
        }).catch((error) => {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
            });
        }).finally(() => {
            setCategoryDialog(false)
        });
    }
    const [addModalFooter, setAddModalFooter] = useState(<></>);
    const [updateModalFooter, setUpdateModalFooter] = useState(<></>);
    const updateProductPrepare = (product) => {
        setUpdateProduct(product);
        setUpdateModal(true);
    }
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Ürünler</h2>}
        >
            <Head title="Ürünler"/>
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
                        <DataTable value={products} removableSort paginator
                                   paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                                   rowsPerPageOptions={[5, 10, 25, 50]} rows={10} dataKey="id" filters={filters}
                                   loading={false}
                                   selectionMode={null} selection={selectedProducts}
                                   onSelectionChange={(e) => setSelectedProducts(e.value)}
                                   globalFilterFields={['name', 'category', 'warranty']} header={header}
                                   emptyMessage="Ürün bulunamadı."
                                   currentPageReportTemplate="{first}. ile {last}. arası toplam {totalRecords} kayıttan">
                            <Column selectionMode="multiple" headerStyle={{width: '3rem'}}></Column>
                            {selectedColumns.includes('id') && <Column field="id" sortable header="#"/>}
                            {selectedColumns.includes('sku') && <Column field="sku" sortable header="SKU"/>}
                            {selectedColumns.includes('name') && <Column field="name" header="Ürün Adı"/>}
                            {selectedColumns.includes('image') &&
                                <Column field="image" header="Ürün Resmi" body={(product) => {
                                    return <Image src={`${product.image}`} preview style={{
                                        width: '6rem',
                                        borderRadius: '1rem'
                                    }} alt={product.image} className="w-[6rem] shadow-2 rounded-lg"/>;
                                }}/>}
                            {selectedColumns.includes('price') &&
                                <Column field="price" sortable header="Ürün Fiyatı" body={(product) => {
                                    return <span>{product.price} TL</span>;
                                }}/>}
                            {selectedColumns.includes('category') && <Column field="category" header="Kategori"/>}
                            {selectedColumns.includes('warranty') && <Column field="warranty" header="Garanti Süresi"/>}
                            {selectedColumns.includes('active') &&
                                <Column field="active" header="Ürün Durumu" dataType="boolean"
                                        body={verifiedBodyTemplate}/>}
                            {selectedColumns.includes('created_at') &&
                                <Column field="created_at" sortable header="Eklenme Tarihi"
                                        body={(rowData) => new Date(rowData.created_at).toLocaleString()}/>}
                            {selectedColumns.includes('updated_at') &&
                                <Column field="updated_at" sortable header="Güncellenme Tarihi"
                                        body={(rowData) => new Date(rowData.updated_at).toLocaleString()}/>}
                            {selectedColumns.includes('actions') && <Column header="İşlemler" body={(product) => {
                                return <div className={"flex justify-center gap-x-2"}>
                                    <Button icon="pi pi-pencil" size={"small"} tooltip={"Ürünü Düzenle"}
                                            onClick={() => {
                                                updateProductPrepare(product);
                                            }}
                                            tooltipOptions={{
                                                position: 'top'
                                            }} severity={"warning"}/>
                                    <Button icon="pi pi-times" tooltip={"Ürünü Sil"}
                                            tooltipOptions={{
                                                position: 'top',
                                            }} size={"small"} onClick={(event) => {
                                        confirmPopupForProductDelete(event, product.id);
                                    }} severity={"danger"}/>
                                </div>
                            }}/>}
                        </DataTable>
                        <Dialog header="Kategoriler" maximizable position={"top"} visible={categoryDialog}
                                style={{width: '50vw'}} onHide={() => setCategoryDialog(false)}
                        >
                            <Toolbar start={() => (<p>
                                Yeni Kategori Ekle
                            </p>)} center={() => <>
                                <InputText size={"small"} placeholder="Yeni Kategori Adı" value={newCategoryName}
                                           onChange={(e) => setNewCategoryName(e.target.value)}/>
                            </>} end={() => <>
                                <Button icon="pi pi-save" onClick={() => {
                                    storeCategory();
                                }} size={"small"} severity={"success"} tooltip={"Yeni Kategori Ekle"}/>
                            </>}/>
                            <DataTable value={categories} removableSort editMode="row" onRowEditComplete={(e) => {
                                let _categories = [...categories];
                                let {newData, index} = e;
                                updateCategory(newData);
                                _categories[index] = newData;

                                setCategories(_categories);
                            }}>
                                <Column field="id" sortable header="ID"/>
                                <Column field="name" sortable header="Kategori Adı"
                                        editor={(options) => <InputText type="text" size={"small"} value={options.value}
                                                                        onChange={(e) => options.editorCallback(e.target.value)}/>}/>
                                <Column header={"Ürün Sayısı"} body={(category) => {
                                    const productCount = products.filter(product => product.category === category.name).length;
                                    return <Button label={productCount+" Ürün"} link onClick={() => {
                                        onGlobalFilterChange(category.name, true);
                                        setCategoryDialog(false)
                                    }} />;
                                }} />
                                <Column header="Düzenle" rowEditor={true}/>
                                <Column header="Sil" body={(category) => <>
                                    {category.id !== 0 &&
                                        <Button icon="pi pi-times" className={"ml-2"} tooltip={"Kategoriyi Sil"}
                                                tooltipOptions={{
                                                    position: 'top',
                                                }} size={"small"} onClick={(event) => {
                                            confirmPopupForProductDelete(event, category.id, 'category');
                                        }} severity={"danger"}/>}
                                </>}/>

                            </DataTable>
                        </Dialog>
                        <Dialog header="Yeni Ürün Ekle" style={{ width: '50vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }} onHide={() => setAddModal(false)} maximizable visible={addModal} footer={addModalFooter}>
                            <Create addModal={addModal} categories={categories} csrf_token={csrf_token} toast={toast} onHide={() => setAddModal(false)} setProducts={setProducts} setAddModalFooter={setAddModalFooter}/>
                        </Dialog>
                        <Dialog header="Ürünü Düzenle" style={{ width: '50vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }} onHide={() => setUpdateModal(false)} maximizable visible={updateModal} footer={updateModalFooter}>
                            <Update updateModal={updateModal} categories={categories} product={updateProduct} csrf_token={csrf_token} toast={toast} onHide={() => setUpdateModal(false)} setProducts={setProducts} setUpdateModalFooter={setUpdateModalFooter}/>
                        </Dialog>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
