import {Steps} from 'primereact/steps';
import {useEffect, useState} from "react";
import {Divider} from 'primereact/divider';
import {AutoComplete} from 'primereact/autocomplete';
import {Dropdown} from 'primereact/dropdown';
import {FloatLabel} from 'primereact/floatlabel';
import {Button} from "primereact/button";
import {MultiSelect} from 'primereact/multiselect';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {InputNumber} from 'primereact/inputnumber';
import {InputTextarea} from 'primereact/inputtextarea';

export default function Update({
                                   dealers,
                                   addModal,
                                   record,
                                   setUpdateModalFooter,
                                   onHide,
                                   products,
                                   csrf_token,
                                   toast,
                                   setRecords,
                                   statuses,
                                   salesmans
                               }) {
    const [selectedDealer, setSelectedDealer] = useState({
        id: record.dealer.id,
        name: record.dealer.name,
        email: record.dealer.email,
        phone: record.dealer.phone
    });
    const [selectedOfficial, setSelectedOfficial] = useState({
        id: record.user_id,
        label: record.user_label
    });
    const recordProducts = record.products.map((item) => {
        let product = item.product;
        return {
            category: product.category,
            id: product.id,
            name: product.name,
            price: product.price,
            sku: product.sku,
            quantity: item.quantity,
            total: Math.round(item.quantity * product.price * 100) / 100
        }
    })
    const [selectedProducts, setSelectedProducts] = useState(recordProducts);
    const [note, setNote] = useState(record.note ? record.note : "");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [activeStatus, setActiveStatus] = useState(record.status);
    const [dirty, setDirty] = useState(false);
    useEffect(() => {
        let diff = false;
        selectedProducts.forEach((item) => {
            let product = record.products.find((p) => p.product_id === item.id);
            if (!product) {
                diff = true;
            }
        });
        record.products.forEach((item) => {
            let product = selectedProducts.find((p) => p.id === item.product_id);
            if (!product) {
                diff = true;
            }
        });
        if (
            selectedDealer?.id !== record.dealer.id ||
            note !== record.note ||
            activeStatus !== record.status ||
            selectedOfficial.id !== record.user_id ||
            diff
        ) {
            setDirty(true);
        } else {
            //control total_price for recordProducts
            let total = recordProducts.reduce((acc, item) => acc + item.total, 0);
            let totalSelected = selectedProducts.reduce((acc, item) => acc + item.total, 0);
            if (total !== totalSelected) {
                setDirty(true);
            } else {
                setDirty(false);
            }
        }
        setDisabled(!dirty);
    }, [selectedDealer, selectedProducts, note, activeStatus, selectedOfficial, record]);

    const handleSubmit = () => {
        let formData = new FormData();
        formData.append("dealer_id", selectedDealer.id);
        formData.append("note", note);
        let productData = selectedProducts.map((item) => {
            return {
                product_id: item.id,
                quantity: item.quantity
            }
        });
        formData.append("products", JSON.stringify(productData));
        formData.append('_method', 'PUT');
        formData.append("status", activeStatus);
        formData.append("user_id", selectedOfficial.id);
        setLoading(true);
        fetch(route('super.orders.update',record.id), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrf_token
            },
            body: formData
        }).then(r => r.json()).then(data => {
            if (data.status) {
                setRecords(data.orders);
                toast.current.show({severity: 'success', summary: 'İşlem Başarılı', detail: data.message});
                onHide();
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
    useEffect(() => {
        setUpdateModalFooter(() => {
            return (
                <>
                    <Button label="Vazgeç" icon="pi pi-times" size="small" link onClick={onHide} loading={loading}/>
                    <Button label="Kaydet" icon="pi pi-save" onClick={handleSubmit} disabled={!dirty} size="small"
                            className="p-button-success" loading={loading}/>
                </>
            );
        });
    }, [addModal, selectedDealer, loading, disabled,dirty]);
    const handleNumberChange = (event, item) => {
        let value = event.value;
        setSelectedProducts(prevState => {
            let products = [...prevState];
            let index = products.findIndex(p => p.id === item.id);
            products[index].quantity = value;
            products[index].total = Math.round(value * products[index].price * 100) / 100;
            return products;
        })
    }

    return <>
        <div className={"py-10"}>
            <FloatLabel className="w-full md:w-14rem mb-10">
                <Dropdown value={selectedDealer} filter showClear emptyFilterMessage={"Bayi Bulunamadı"}
                          filterBy={"name,email,phone"} onChange={(e) => setSelectedDealer(e.value)} options={dealers}
                          optionLabel="name"
                          className="w-full"/>
                <label htmlFor="dd-city">Bayi Seçiniz</label>
            </FloatLabel>
            <FloatLabel className="w-full mb-5">
                <MultiSelect panelFooterTemplate={() => {
                    const length = selectedProducts ? selectedProducts.length : 0;

                    return (
                        <div className="py-2 px-3">
                            <b>{length}</b> ürün seçili.
                        </div>
                    );
                }} filter showClear itemTemplate={(option) => {
                    return (
                        <span>
                                #{option.sku} - {option.name} - {option.price} TL
                            </span>
                    )
                }} virtualScrollerOptions={{itemSize:38}} value={selectedProducts} emptyFilterMessage={"Ürün Bulunamadı"} filterBy={"name,sku,price"}
                             onChange={(e) => setSelectedProducts(e.value)} options={products} optionLabel="name"
                             className="w-full"/>
                <label htmlFor="ms-cities">Ürünleri Seçiniz</label>
            </FloatLabel>

            <DataTable value={selectedProducts} showGridlines size={"small"}
                       className={selectedProducts.length > 0 ? "mx-auto" : "hidden"}>
                <Column field="id" header="#ID"></Column>
                <Column field="name" header="Ürün Adı"></Column>
                <Column field="sku" header="Ürün Stok kodu"></Column>
                <Column field="price" header="Ürün Fiyatı"></Column>
                <Column header="Adet" align={"center"}
                        body={(rowData) => <InputNumber showButtons suffix={" Adet"} value={rowData.quantity}
                                                        onChange={e => handleNumberChange(e, rowData)}/>}></Column>
                <Column field={"total"} header="Tutar" body={(rowData) => <span>
                        {rowData.total} TL
                    </span>}></Column>
            </DataTable>
            {selectedProducts.length > 0 && <div className={"my-5"}>
                <h3>Toplam Tutar: {selectedProducts.reduce((acc, item) => acc + item.total, 0)} TL</h3>
            </div>}
            <FloatLabel className={"mb-10"}>
                <InputTextarea id="order_note" value={note} onChange={(e) => setNote(e.target.value)} rows={5}
                               className={"w-full"}/>
                <label htmlFor="order_note">Sipariş Notu</label>
            </FloatLabel>
            <FloatLabel className="w-full mb-10">
                <Dropdown value={activeStatus} onChange={(e) => setActiveStatus(e.value)} options={statuses}
                          optionLabel="label"
                          className="w-full"/>
                <label htmlFor="dd-city">Sipariş Durumu</label>
            </FloatLabel>


            <FloatLabel className="w-full md:w-14rem mb-10">
                <Dropdown emptyFilterMessage={"Yetkili Bulunamadı"} value={selectedOfficial} filter
                          onChange={(e) => setSelectedOfficial(e.value)} options={salesmans}
                          optionLabel="label"
                          filterBy={"label"}
                          className="w-full"/>
                <label htmlFor="dd-city">Satış Yetkilisi</label>
            </FloatLabel>
        </div>
    </>
}
