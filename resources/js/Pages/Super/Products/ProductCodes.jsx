import React, {useEffect, useState} from "react";
import {Toolbar} from "primereact/toolbar";
import {Chips} from 'primereact/chips';
import {Button} from "primereact/button";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {InputTextarea} from "primereact/inputtextarea";
import {InputText} from "primereact/inputtext";
import {Divider} from "primereact/divider";
import {classNames} from "primereact/utils";
import {confirmPopup} from "primereact/confirmpopup";
import {router} from "@inertiajs/react";

const ProductCodes = ({csrf_token, product, productCodesModal, setFooter, onHide, toast}) => {
    const [codes, setCodes] = useState([]);
    const [value, setValue] = useState([]);
    const [loading, setLoading] = useState(false);
    const getCodes = () => {
        if (product) {
            setLoading(true)
            fetch(route('super.products.listCodes', product.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf_token
                },
            }).then(r => r.json()).then(response => {
                setCodes(response.codes);
            }).catch((err) => {
                toast.current.show({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Ürün kodları getirilirken bir hata oluştu.'
                });
            }).finally(() => {
                setLoading(false);
            });

        }
    }
    useEffect(() => {
        getCodes();
    }, [product]);
    const addCodes = () => {
        if (value.length > 0) {
            setLoading(true)
            fetch(route('super.products.addCode', product.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf_token
                },
                body: JSON.stringify({codes: value.join(",")})
            }).then(r => r.json()).then(response => {
                if (response.status) {
                    setValue([]);
                    toast.current.show({severity: 'success', summary: 'Başarılı', detail: response.message});
                    setCodes(response.codes)
                } else {
                    toast.current.show({severity: 'error', summary: 'Hata', detail: response.message});
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
        } else {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Ürün kodu eklemek için en az bir ürün kodu girmelisiniz.'
            });
        }
    }
    return <>
        <div className="mb-3">
            <label htmlFor="description" className="font-bold">
                Ürün Kodları (Virgül ile ayırarak yazınız)
            </label>
            <Chips value={value} className={"block"} onChange={(e) => setValue(e.value)} separator=","/>
        </div>
        <Button label="Ürün Kodlarını Ekle" onClick={addCodes} loading={loading} className={"mb-3"}/>
        <Divider/>
        <DataTable value={codes} removableSort paginator emptyMessage="Ürün kodu bulunamadı."
                   currentPageReportTemplate="{first}. ile {last}. arası toplam {totalRecords} kayıttan"
                   paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                   rowsPerPageOptions={[5, 10, 25, 50]} rows={10} dataKey="id" loading={loading} editMode="row"
                   onRowEditComplete={(e) => {
                        let {code,id,product_id} = e.newData;
                        setLoading(true);
                        if(e.data.code !== code){
                            fetch(route('super.products.updateCode',product_id), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': csrf_token
                                },
                                body: JSON.stringify({
                                    code_id: id,
                                    code,
                                    _method: 'put'
                                })
                            }).then(r => r.json()).then(response => {
                                if (response.status) {
                                    toast.current.show({severity: 'success', summary: 'Başarılı', detail: response.message});
                                    setCodes(response.codes);
                                } else {
                                    toast.current.show({severity: 'error', summary: 'Hata', detail: response.message});
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
                        }else{
                            setLoading(false);
                        }
                   }}>
            <Column field="code" sortable header="Ürün Kodu"
                    editor={(options) => <InputText type="text" size={"small"} value={options.value}
                                                    onChange={(e) => options.editorCallback(e.target.value)}/>}/>
            <Column field="used" sortable header="Durumu" body={(rowData) => {
                return <Button className={"flex justify-center"}
                               tooltip={Boolean(rowData.used) === false ? "Kullanılmamış" : "Kullanılmış"}
                               tooltipOptions={{
                                   position: 'top',
                               }} unstyled>
                    <i className={classNames('pi ', {
                        'true-icon pi-check-circle text-green-400': !Boolean(rowData.used),
                        'false-icon pi-times-circle text-red-400': Boolean(rowData.used)
                    })}></i>
                </Button>;
            }}/>
            <Column sortable header="Konumu" body={(rowData) => {
                if (rowData.location !== "central") {
                    return <Button label={rowData.dealer.name} link size={"small"} tooltip={"Bayiyi Görüntüle"} onClick={() => {
                        router.visit(route('super.dealers.show', rowData.dealer.id));
                    }}/>
                } else {
                    return "Merkez";
                }
            }}/>

            <Column field="used_at" sortable header="Kullanılma Tarihi" body={(rowData) => {
                if(rowData.used_at !== null){
                    return new Date(rowData.used_at).toLocaleString();
                }else{
                    return "...";
                }
            }}/>
            <Column field="updated_at" sortable header="Değişiklik Tarihi" body={(rowData) => {
                return new Date(rowData.updated_at).toLocaleString();
            }}/>
            <Column header="Düzenle" rowEditor={(rowData) => {
                if (rowData.used) {
                    return false;
                } else {
                    return true;
                }

            }}/>
            <Column header="Sil" body={(rowData) => <>
                {Boolean(rowData.used) === false &&
                    <Button icon="pi pi-times" className={"ml-2"} tooltip={"Ürün Kodunu Sil"}
                            tooltipOptions={{
                                position: 'top',
                            }} size={"small"} onClick={(event) => {
                        confirmPopup({
                            target: event.currentTarget,
                            message: 'Ürün kodunu silmek istediğinize emin misiniz?',
                            icon: 'pi pi-info-circle',
                            defaultFocus: 'reject',
                            acceptClassName: 'p-button-danger',
                            accept: () => {
                                setLoading(true)
                                fetch(route('super.products.deleteCode', rowData.id), {
                                    method: 'DELETE',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-CSRF-TOKEN': csrf_token
                                    },
                                }).then(r => r.json()).then(response => {
                                    if (response.status) {
                                        toast.current.show({
                                            severity: 'success',
                                            summary: 'Başarılı',
                                            detail: response.message
                                        });
                                        setCodes(prevCodes => {
                                            return prevCodes.filter((code) => code.id !== rowData.id);
                                        })
                                    } else {
                                        toast.current.show({
                                            severity: 'error',
                                            summary: 'Hata',
                                            detail: response.message
                                        });
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

                            },
                            acceptLabel: 'Sil',
                            rejectLabel: 'Vazgeç'
                        });
                    }} severity={"danger"}/>}
            </>}/>

        </DataTable>
    </>
}
export default ProductCodes;
