import {InputTextarea} from "primereact/inputtextarea";
import {InputText} from "primereact/inputtext";
import {InputNumber} from "primereact/inputnumber";
import {useEffect, useRef, useState} from "react";
import {Dropdown} from "primereact/dropdown";
import {classNames} from 'primereact/utils';
import {Button} from "primereact/button";
import {BlockUI} from 'primereact/blockui';
import {useFormik} from "formik";
import * as Yup from "yup";
import {Message} from "primereact/message";
import { InputSwitch } from 'primereact/inputswitch';
export default function Update({
                                   categories,
                                   csrf_token,
                                   toast,
                                   onHide,
                                   setProducts,
                                   setUpdateModalFooter,
                                   updateModal,
                                   product
                               }) {
    const fileInput = useRef(null);
    const [selectedCategory, setSelectedCategory] = useState(categories.map((category) => (product.category === category.name ? category : false)).filter(Boolean)[0]);
    const [skuCodeControl, setSkuCodeControl] = useState(false);
    const [skuCodeResponse, setSkuCodeResponse] = useState(false);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(false);
    const formRef = useRef();
    const [formSubmitted, setFormSubmitted] = useState(false);
    const {values ,handleSubmit, handleChange,setFieldValue,errors,setErrors} = useFormik({
        initialValues: {
            name: product.name,
            sku: product.sku,
            description: product.description,
            price: product.price,
            warranty: Number(String(product.warranty).split(' ')[0]),
            image: product.image,
            active: Boolean(product.active),
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().required('Ürün Adı Zorunludur.'),
            sku: Yup.string().required('Ürün Stok Kodu Zorunludur.'),
            price: Yup.number().required('Ürün Fiyatı Zorunludur.').min(1,'Ürün Fiyatı 1 TL\'den Az Olamaz.'),
            warranty: Yup.number().required('Ürün Garanti Süresi Zorunludur.').min(1,'Ürün Garanti Süresi 1 Yıl\'dan Az Olamaz.'),
        }),
        onSubmit: values => {
            if (skuCodeResponse && !skuCodeResponse.status) {
                setErrors({
                    sku: "Stok Kodu Daha Önce Kullanılmış.\nLütfen Başka Bir Stok Kodu Giriniz."
                });
                return false;
            }else{
                setLoading(true);
                let formData = new FormData();
                formData.append('name', values.name);
                formData.append('sku', values.sku);
                formData.append('description', values.description);
                formData.append('price', values.price);
                formData.append('quantity', values.quantity);
                formData.append('warranty', values.warranty);
                formData.append('category', selectedCategory.name);
                formData.append('image', file);
                formData.append('active', values.active);
                formData.append('_method', 'PUT');
                fetch(route('central..products.update',product.id), {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrf_token
                    },
                    body: formData

                }).then(response => response.json()).then(data => {
                    if (data.status) {
                        toast.current.show({
                            severity: 'success',
                            summary: 'Başarılı',
                            detail: data.message
                        });
                        setProducts(data.products);
                        onHide();
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
            }
        }
    })
    const controlSkuCode = (e) => {
        if (e.target.value.length < 5) {
            setSkuCodeControl(false);
            setSkuCodeResponse(false);
            return false;
        }
        if (e.target.value === skuCodeResponse.sku || e.target.value === product.sku) {
            return false;
        }
        setSkuCodeControl(true);
        fetch(route('central..products.controlSku'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf_token
            },
            body: JSON.stringify({sku: e.target.value})

        }).then(response => response.json()).then(data => {
            setSkuCodeResponse({
                status: data.status,
                message: data.message,
                sku: data.sku
            })
        }).catch((error) => {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
            });
        }).finally(() => {
            setSkuCodeControl(false);
        })
    }
    const handleFileChange = (e) => {
        if (e.target.files.length === 0) {
            setFile(false);
            return false;
        }
        const file = e.target.files[0];
        if (file.size > 1024 * 1024 * 32) {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: "Dosya Boyut 32MB'dan büyük olamaz."
            });
            return false;
        }
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: "Dosya Tipi Sadece JPG, JPEG, PNG olabilir."
            });
            return false;
        }
        setFile(file);
    }
    useEffect(() => {

        setUpdateModalFooter(<>
            <Button label="Vazgeç" icon="pi pi-times" size={"small"} link onClick={onHide} loading={loading}/>
            <Button label="Kaydet" icon="pi pi-save" size={"small"} className="p-button-success" loading={loading}
                    onClick={() => {
                        setFormSubmitted(true);
                        formRef.current.click();
                    }} />
        </>)
    }, [updateModal])

    return (<BlockUI blocked={loading} template={<i className="pi pi-spin pi-spinner" style={{fontSize: '3rem'}}></i>}>
        <form className="p-fluid" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-x-3 mb-3">
                <div className={"col-span-2 grid gap-y-2"}>
                    {formSubmitted && Object.keys(errors).length > 0 && <>
                        {Object.entries(errors).map(([key, value]) => (<Message severity="warn" key={key} text={value}/>) )}
                    </>}
                </div>
                <div>
                    <label htmlFor="name" className="font-bold">
                        Ürün Adı <span className={"font-semibold text-red-400"}>*</span>
                    </label>
                    <InputText id="name" name={"name"} onChange={handleChange} value={values.name} autoFocus/>

                </div>
                <div>
                    <label htmlFor="sku" className="font-bold">
                        Ürün Stok Kodu <span className={"font-semibold text-red-400"}>*</span>
                    </label>
                    <div className="p-inputgroup flex-1">
                    <span className="p-inputgroup-addon">
                        <i className={classNames('pi pi-barcode', {
                            'text-green-400': skuCodeResponse && skuCodeResponse.status,
                            'text-red-400': skuCodeResponse && !skuCodeResponse.status
                        })}></i>
                    </span>
                        <InputText name={"sku"} onChange={handleChange} value={values.sku} id="sku"
                                   tooltip={skuCodeResponse && skuCodeResponse.message} tooltipOptions={{
                            position: 'bottom'
                        }} onBlur={(e) => controlSkuCode(e)}/>
                        {skuCodeControl && <span className="p-inputgroup-addon">
                        <i className="pi pi-spin pi-spinner"></i>
                    </span>}
                        {skuCodeResponse && skuCodeResponse.status && <span className="p-inputgroup-addon">
                        <i className="pi pi-check text-green-400"></i>
                    </span>}
                        {skuCodeResponse && !skuCodeResponse.status && <span className="p-inputgroup-addon">
                        <i className="pi pi-times text-red-400"></i>
                    </span>}
                    </div>

                </div>
            </div>
            <div className="mb-3">
                <label htmlFor="description" className="font-bold">
                    Ürün Açıklaması
                </label>
                <InputTextarea id="description" name={"description"} onChange={handleChange} value={values.description}

                               rows={3} cols={20}/>
            </div>
            <div className="mb-3 flex justify-start items-center gap-x-2">

                <InputSwitch checked={values.active} inputId={"productActive"} onChange={(e) => setFieldValue('active',e.value)} />
                <label htmlFor="productActive" className="font-bold">
                    Ürün Aktifliği ({values.active ? "Aktif" : "Pasif"})
                </label>
            </div>

            <div className="grid grid-cols-2 gap-x-3 mb-3">
                <div className="field col">
                    <label className="font-bold">
                        Ürün Garanti Süresi (Yıl) <span className={"font-semibold text-red-400"}>*</span>
                    </label>
                    <InputNumber name={"warranty"} value={values.warranty} onChange={(e) => {
                        setFieldValue('warranty',e.value)
                    }} min={0} max={100}
                                 suffix={" Yıl"}/>
                </div>
                <div className="field col">
                    <label htmlFor="quantity" className="font-bold">
                        Ürün Kategorisi
                    </label>
                    <Dropdown value={selectedCategory} onChange={(e) => setSelectedCategory(e.value)}
                              options={categories} optionLabel="name"
                              placeholder="Kategori Seçin" className="w-full md:w-14rem"/>
                </div>
            </div>
            <div className="mb-3">
                <div className="field">
                    <label htmlFor="price" className="font-bold">
                        Ürün Fiyatı <span className={"font-semibold text-red-400"}>*</span>
                    </label>
                    <InputNumber id="price" mode="currency" value={values.price} name={"price"} onChange={(e) => {
                        setFieldValue('price',e.value)
                    }}
                                 currency="TRY"
                                 locale="tr-TR"/>
                </div>
            </div>
            <label className="font-bold " htmlFor={"image"}>
                Ürün Resmi
            </label>
            <div className={"grid grid-cols-2 gap-x-3 my-3"}>
                <div className={"flex justify-center"}>
                    <input id={"image"} ref={fileInput} type="file" className={"hidden"} accept={"image/*"}
                           onChange={handleFileChange}/>
                    <div
                        className={classNames("w-44 border-dashed border  h-44 cursor-pointer bg-gray-600/30 rounded-full flex justify-center items-center", {
                            "border-orange-400": file === false,
                            "border-green-400": file !== false
                        })} onClick={() => {
                        fileInput.current.click();
                    }}>
                        {file === false && <i className="pi pi-camera text-2xl text-orange-400"></i>}
                        {file !== false && <i className="pi pi-check text-2xl text-green-400"></i>}

                    </div>
                </div>
                <div>
                    <img src={file !== false ? URL.createObjectURL(file) : values.image} alt={file.name}
                         className={classNames("w-full h-full max-h-44 bg-gray-300/10 border border-dashed object-contain rounded-lg", {
                             "border-orange-400": file === false,
                             "border-green-400": file !== false
                         })}/>
                </div>
            </div>
            <button type={"submit"} style={{display:"none"}} ref={formRef}></button>
        </form>
    </BlockUI>);
}
