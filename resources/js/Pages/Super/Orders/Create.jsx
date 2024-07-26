
import { Steps } from 'primereact/steps';
import {useEffect, useState} from "react";
import { Divider } from 'primereact/divider';
import { AutoComplete } from 'primereact/autocomplete';
import { Dropdown } from 'primereact/dropdown';
import { FloatLabel } from 'primereact/floatlabel';
import {Button} from "primereact/button";
import { MultiSelect } from 'primereact/multiselect';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
export default function Create({dealers,addModal,setAddModalFooter,onHide,products,csrf_token,toast,setRecords}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedDealer, setSelectedDealer] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [note,setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    let items = [
        {
            label:"Bayi Seçimi",
        },
        {
            label:"Ürün Seçimi",
        },
        {
            label:"Adet Girimi",
        },
        {
            label:"Ek Bilgiler",
        }
    ];
    const nextStep = (action=false) => {
        if(activeIndex === 0){
            if(selectedDealer === null || selectedDealer === undefined){
                setDisabled(true);
            }else{
                setDisabled(false)
                if(action) setActiveIndex(activeIndex + 1)
            }
        }else if(activeIndex === 1){
            if(selectedProducts.length > 0) {
                setDisabled(false)
                if(action) setActiveIndex(activeIndex + 1)
            }else{
                setDisabled(true);
            }
        }else if(activeIndex === 2) {
            let control = true;
            selectedProducts.forEach((item) => {
                if(item.quantity === null || item.quantity === undefined || item.quantity === 0){
                    control = false;
                }
            });
            if(control){
                setDisabled(false);
                if (action) setActiveIndex(activeIndex + 1)
            }else{
                setDisabled(true);
            }
        }

    }
    const handleSubmit = () => {
        let formData = new FormData();
        formData.append("dealer_id",selectedDealer.id);
        formData.append("note",note);
        let productData = selectedProducts.map((item) => {
            return {
                product_id:item.id,
                quantity:item.quantity
            }
        });
        formData.append("products",JSON.stringify(productData));
        setLoading(true);
        fetch(route('super.orders.store'), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrf_token
            },
            body: formData
        }).then(r  =>r.json()).then(data => {
            if(data.status){
                setRecords(data.orders);
                toast.current.show({severity: 'success', summary: 'İşlem Başarılı', detail: data.message});
                onHide();
            }else{
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
        setAddModalFooter(() => {
            nextStep();
            return (
                <>
                    <Button label="Vazgeç" icon="pi pi-times" size="small" link onClick={onHide} loading={loading} />
                    {activeIndex !== 0 && (
                        <Button label="Geri" icon="pi pi-arrow-left" size="small" className="p-button-warning" onClick={() => setActiveIndex(activeIndex - 1)} loading={loading}/>
                    )}
                    {activeIndex === items.length - 1 ? (
                        <Button label="Kaydet" icon="pi pi-save" onClick={handleSubmit} disabled={disabled} size="small" className="p-button-success" loading={loading}/>
                    ) : (
                        <Button label="İleri" icon="pi pi-arrow-right" disabled={disabled} size="small" className="p-button-success" onClick={() => nextStep(true)} loading={loading}/>
                    )}
                </>
            );
        });
    }, [addModal, activeIndex, selectedDealer, loading, disabled,selectedProducts]);
    const handleNumberChange = (event,item) => {
        let value = event.value;
        let updatedProducts = [...selectedProducts];
        let updatedProduct = {...item};
        updatedProduct.quantity = value;
        updatedProduct.total = Math.round(value * item.price * 100) / 100;
        updatedProducts[selectedProducts.indexOf(item)] = updatedProduct;
        setSelectedProducts(updatedProducts);
    }

    return <>
        <Steps model={items} onSelect={(e) => setActiveIndex(e.index)} activeIndex={activeIndex} className={"mb-10"} />
        <div>
            {activeIndex === 0 && <>
                {/*  Dealer Select  */}
                <FloatLabel className="w-full md:w-14rem">
                    <Dropdown value={selectedDealer} filter showClear emptyFilterMessage={"Bayi Bulunamadı"} filterBy={"name,email,phone"} onChange={(e) => setSelectedDealer(e.value)} options={dealers} optionLabel="name"
                               className="w-full" />
                    <label htmlFor="dd-city">Bayi Seçiniz</label>
                </FloatLabel>

            </>}
            {activeIndex === 1 && <>
                <FloatLabel className="w-full">
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
                    }} value={selectedProducts} emptyFilterMessage={"Ürün Bulunamadı"} filterBy={"name,sku,price"} onChange={(e) => setSelectedProducts(e.value)} options={products} optionLabel="name" className="w-full" />
                    <label htmlFor="ms-cities">Ürünleri Seçiniz</label>
                </FloatLabel>
            </>}
            {activeIndex === 2 && <>
                <DataTable value={selectedProducts} showGridlines >
                    <Column field="id" header="#ID"></Column>
                    <Column field="name" header="Ürün Adı"></Column>
                    <Column field="sku" header="Ürün Stok kodu"></Column>
                    <Column field="price" header="Ürün Fiyatı"></Column>
                    <Column header="Adet" align={"center"} body={(rowData) => <InputNumber showButtons suffix={" Adet"} value={rowData.quantity} onChange={e => handleNumberChange(e,rowData)} />}></Column>
                    <Column field={"total"} header="Tutar" body={(rowData) => <span>
                        {rowData.total} TL
                    </span>}></Column>
                </DataTable>
                <Divider />
                <div>
                    <h3>Toplam Tutar: {selectedProducts.reduce((acc, item) => acc + item.total, 0)} TL</h3>
                </div>
            </>}
            {activeIndex === 3 && <>
                {/*    Only Order Note */}
                <FloatLabel>
                    <InputTextarea id="order_note" value={note} onChange={(e) => setNote(e.target.value)} rows={5} className={"w-full"} />
                    <label htmlFor="order_note">Sipariş Notu</label>
                </FloatLabel>
            </>}
        </div>
    </>
}
