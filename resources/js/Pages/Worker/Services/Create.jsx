import {Head} from "@inertiajs/react";
import {Checkbox} from "primereact/checkbox";
import CarBody from "@/Components/CarBody.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import React, {useRef, useState, useEffect} from "react";
import {Stepper} from 'primereact/stepper';
import {StepperPanel} from 'primereact/stepperpanel';
import {Button} from "primereact/button";
import CarSelect from "@/Components/CarSelect.jsx";
import {Dropdown} from "primereact/dropdown";
import {FloatLabel} from "primereact/floatlabel";
import {Toast} from "primereact/toast";
import {InputText} from "primereact/inputtext";
import {OrderList} from 'primereact/orderlist';
import {DataView, DataViewLayoutOptions} from 'primereact/dataview';
import {Editor} from 'primereact/editor';
import {InputNumber} from "primereact/inputnumber";

const Create = ({auth, csrf_token}) => {
    const toast = useRef(null);
    const stepperRef = useRef(null);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [serviceNo, setServiceNo] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([]);
    const getCustomers = () => {
        setLoading(true)
        fetch(route('worker.customers.getAll'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf_token
            },
        }).then(r => r.json()).then(response => {
            setCustomers(response.customers);
        }).catch((err) => {
            console.log(err);
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Müşteriler getirilirken bir hata oluştu.'
            });
        }).finally(() => {
            setLoading(false);
        });
    }
    useEffect(() => {
        getCustomers();
    }, []);
    const [value, setValue] = useState([]);
    const [carData, setCarData] = useState({
        brand: null,
        model: null,
        generation: null,
        year: null,
    });
    const [selectedCar, setSelectedCar] = useState(null);
    const [carSelected, setCarSelected] = useState(false);
    const [prouctCode, setProductCode] = useState("Ab7hD4Fz");
    const [plate, setPlate] = useState("");
    const [kilometer, setKilometer] = useState(null);
    const [images, setImages] = useState(false);
    const onProductCodeAdd = () => {
        if (prouctCode === "") {
            toast.current.show({severity: 'warn', summary: 'Hata', detail: 'Ürün kodu boş olamaz.'});
            return;
        } else {
            let controlLength = selectedProducts.filter(product => product.code === prouctCode).length;
            if (controlLength > 0) {
                toast.current.show({severity: 'warn', summary: 'Hata', detail: 'Ürün zaten ekli.'});
                return;
            }
        }

        let formData = new FormData();
        formData.append('code', prouctCode);
        fetch(route('worker.products.checkProduct'), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrf_token,
            },
            body: formData
        }).then(r => r.json()).then(data => {
            if (data.status) {
                toast.current.show({severity: 'success', summary: 'Başarılı', detail: "Ürün başarıyla eklendi."});
                setSelectedProducts(prevState => {
                    return [...prevState, {...data.product, code: data.code.code}];
                });
                setProductCode("");
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
    const [text, setText] = useState('');
    const handleSave = () => {
        let formData = new FormData();
        formData.append('customer_id', selectedCustomer.id);
        formData.append("car_brand", selectedCar.brand.name);
        formData.append("car_model", selectedCar.model.name);
        formData.append("car_generation", selectedCar.generation.name);
        formData.append("car_year", selectedCar.year.name);
        formData.append("car_plate", plate);
        formData.append("car_kilometer", kilometer);
        formData.append("service_no", serviceNo);
        formData.append("notes", text);
        //add body[] to formdata
        value.forEach((item, index) => {
            formData.append(`body[${index}]`, item);
        });
        selectedProducts.map(product => ({id:product.id,code:product.code})).map((product, index) => {
            formData.append(`products[${index}][id]`, product.id);
            formData.append(`products[${index}][code]`, product.code);
        });
        formData.append("brand_logo", selectedCar.brandLogo);
        fetch(route('worker.services.store'), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrf_token,
            },
            body: formData
        }).then(r => r.json()).then(data => {
            if (data.status) {
                toast.current.show({severity: 'success', summary: 'Başarılı', detail: data.message});

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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Hizmet Kaydı
                Ekle</h2>}
        >
            <Head title="Hizmet Kaydı Ekle"/>
            <Toast ref={toast}/>
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-3">
                        <Stepper ref={stepperRef} style={{flexBasis: '50rem'}} orientation="vertical" linear>
                            <StepperPanel header="Müşteri Seçimi">
                                <div className="flex flex-column h-12rem">
                                    <FloatLabel className="w-full md:w-14rem">
                                        <Dropdown value={selectedCustomer} filter showClear
                                                  emptyFilterMessage={"Müşteri Bulunamadı"}
                                                  filterBy={"name,email,phone"}
                                                  onChange={(e) => setSelectedCustomer(e.value)} options={customers}
                                                  optionLabel="name"
                                                  className="w-full"/>
                                        <label htmlFor="dd-city">Müşteri Seçiniz</label>
                                    </FloatLabel>
                                </div>
                                <div className="flex py-4">
                                    <Button label="İleri" icon="pi pi-arrow-right" size={"small"} iconPos="right"
                                            disabled={selectedCustomer === null}
                                            onClick={() => stepperRef.current.nextCallback()}/>
                                </div>
                            </StepperPanel>
                            <StepperPanel header="Araç Bilgileri">
                                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                                    <CarSelect
                                        onComplete={(data) => {
                                            setCarSelected(true);
                                            setSelectedCar(data);
                                        }}
                                        onChange={(data, completed) => {
                                            setCarSelected(completed);
                                            setSelectedCar(data);
                                        }}
                                        selectedBrand={carData.brand}
                                        setSelectedBrand={(data) => setCarData(prevState => {
                                            return {...prevState, brand: data};
                                        })}
                                        selectedModel={carData.model}
                                        setSelectedModel={(data) => setCarData(prevState => {
                                            return {...prevState, model: data};
                                        })}
                                        selectedGeneration={carData.generation}
                                        setSelectedGeneration={(data) => setCarData(prevState => {
                                            return {...prevState, generation: data};
                                        })}
                                        selectedYear={carData.year}
                                        setSelectedYear={(data) => setCarData(prevState => {
                                            return {...prevState, year: data};
                                        })}
                                    />
                                </div>
                                <div className="flex py-4 gap-2">
                                    <Button label="Geri" severity="secondary" size={"small"} icon="pi pi-arrow-left"
                                            onClick={() => stepperRef.current.prevCallback()}/>
                                    <Button label="İleri" icon="pi pi-arrow-right" size={"small"}
                                            disabled={!carSelected} iconPos="right"
                                            onClick={() => stepperRef.current.nextCallback()}/>
                                </div>
                            </StepperPanel>
                            <StepperPanel header="Ürün Seçimi">
                                <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
                                    <div className={"col-span-2 lg:col-span-4"}>
                                        <InputText value={prouctCode} onChange={e => setProductCode(e.target.value)}
                                                   className={"w-full"} placeholder={"Ürün Kodu Giriniz"}/>
                                    </div>

                                    <div>
                                        <Button onClick={onProductCodeAdd} label={"Ekle"} icon={"pi pi-plus"}/>
                                    </div>
                                </div>
                                <DataView dataKey="id" value={selectedProducts}
                                          onChange={(e) => setSelectedProducts(e.value)} itemTemplate={item => <div
                                    className="flex flex-wrap p-2 align-items-center gap-3">
                                    <img className="w-[4rem] shadow-lg flex-shrink-0 rounded" src={`${item.image}`}
                                         alt={item.name}/>
                                    <div className="flex-1 flex flex-col gap-2 xl:mr-8">
                                        <span className="font-bold">{item.name}</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span>#</span>
                                                <span>{item.sku}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <i className="pi pi-tag"></i>
                                                <span>{item.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-rows-2">
                                        <span
                                            className="font-bold text-900 flex items-center justify-end">₺{item.price}</span>
                                        <div className={"flex justify-end"}><Button severity={"danger"}
                                                                                    tooltip={"Listeden Çıkar"}
                                                                                    onClick={() => setSelectedProducts(prevState => {
                                                                                        return prevState.filter(product => product.id !== item.id);
                                                                                    })}
                                                                                    icon={"pi pi-trash"}/></div>
                                    </div>
                                </div>} header="Eklenen Ürünler"
                                          emptyMessage={"Ürün Bulunamadı Lütfen Üstteki Alandan Ürün Ekleyiniz."}
                                ></DataView>
                                <div className="flex py-4 gap-2">
                                    <Button label="Geri" severity="secondary" size={"small"} icon="pi pi-arrow-left"
                                            onClick={() => stepperRef.current.prevCallback()}/>
                                    <Button label="İleri" icon="pi pi-arrow-right" size={"small"} iconPos="right"
                                            disabled={selectedProducts.length === 0}
                                            onClick={() => stepperRef.current.nextCallback()}/>
                                </div>
                            </StepperPanel>
                            <StepperPanel header="Gövde Seçimi">
                                <div>
                                    <div className="flex flex-column">
                                        <CarBody editable={true} onChange={(data) => {
                                            setValue(data);
                                        }} value={value}/>
                                    </div>
                                    <div className="flex py-4 gap-2">
                                        <Button label="Geri" size={"small"} severity="secondary" icon="pi pi-arrow-left"
                                                onClick={() => stepperRef.current.prevCallback()}/>
                                        <Button label="İleri" icon="pi pi-arrow-right" size={"small"} iconPos="right"
                                                disabled={value.length === 0}
                                                onClick={() => stepperRef.current.nextCallback()}/>
                                    </div>
                                </div>
                            </StepperPanel>
                            <StepperPanel header="Notlar">
                                <div>
                                    <div>
                                        <div className={"my-4 mb-6"}>
                                            <FloatLabel>
                                                <InputText className={"w-full"} id="plate-input" value={plate}
                                                           onChange={(e) => setPlate(e.target.value)}/>
                                                <label htmlFor="plate-input">Araç Plakası</label>
                                            </FloatLabel>
                                        </div>
                                        <div className={"mb-6"}>
                                            <FloatLabel>
                                                <InputNumber className={"w-full"} id="kilometer-input" value={kilometer}
                                                             onChange={(e) => setKilometer(e.value)}/>
                                                <label htmlFor="kilometer-input">Araç Kilometresi</label>
                                            </FloatLabel>
                                        </div>
                                        <div className={"mb-6"}>
                                            <FloatLabel>
                                                <InputText className={"w-full"} id="service-number-input" value={serviceNo}
                                                             onChange={(e) => setServiceNo(e.target.value)}/>
                                                <label htmlFor="service-number-input">Hizmet Numarası</label>
                                            </FloatLabel>
                                        </div>
                                        <label htmlFor="editor-notes" className={"font-semibold "}>Hizmet
                                            Notları</label>
                                        <Editor className={"mt-3"} itemID={"editor-notes"} value={text}
                                                onTextChange={(e) => setText(e.htmlValue)} style={{height: '320px'}}/>
                                    </div>
                                    <div className="flex py-4 gap-2">
                                        <Button label="Geri" size={"small"} severity="secondary" icon="pi pi-arrow-left"
                                                onClick={() => stepperRef.current.prevCallback()}/>
                                        <Button label="İleri" icon="pi pi-arrow-right" size={"small"} iconPos="right"
                                                disabled={text === "" || plate === "" || kilometer === null || serviceNo === ""}
                                                onClick={() => stepperRef.current.nextCallback()}/>
                                    </div>
                                </div>
                            </StepperPanel>
                            <StepperPanel header="Özet">
                                <div>
                                    <div>
                                        <div className="grid grid-cols-1 gap-2 lg:gap-3 lg:grid-cols-2">


                                            <div className={"grid grid-rows-1 lg:grid-rows-3 gap-y-1 "}>
                                                <div>
                                                    <label className="font-semibold">Müşteri</label>
                                                    <div className="flex items-center gap-2">
                                                        <span>{selectedCustomer?.name}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="font-semibold">Ürünler</label>
                                                    <ul>
                                                        {selectedProducts.map(product => {
                                                            return <li key={product.id}
                                                                       className="flex items-center gap-2 even:my-1">
                                                                <img className="w-8 h-8 rounded-full"
                                                                     src={product.image}
                                                                     alt={product.name}/>
                                                                <span>{product.name} #{product.code}</span>
                                                            </li>
                                                        })}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <label className="font-semibold">Notlar</label>
                                                    <div dangerouslySetInnerHTML={{__html: text}}></div>
                                                </div>
                                                <div>
                                                    <label className="font-semibold">Araç</label>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <img className="w-8 h-8 rounded-full"
                                                             src={selectedCar?.brandLogo}
                                                             alt={selectedCar?.brand?.name}/>
                                                        <span>{selectedCar?.brand?.name} >> {selectedCar?.model?.name} >> {selectedCar?.generation?.name} ({selectedCar?.year?.name})</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span>{plate} - {Number(kilometer).toLocaleString()}km</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="font-semibold">Gövde</label>
                                                <CarBody editable={false} value={value} onChange={() => {
                                                }}/>
                                            </div>

                                        </div>
                                    </div>
                                    <div className="flex py-4 gap-2">
                                        <Button label="Geri" size={"small"} severity="secondary" icon="pi pi-arrow-left"
                                                onClick={() => stepperRef.current.prevCallback()}/>
                                        <Button label="Kaydet" icon="pi pi-save" severity={"success"} size={"small"}
                                                iconPos="right"
                                                disabled={text === "" || plate === "" || kilometer === null || serviceNo === ""}
                                                onClick={handleSave}/>
                                    </div>
                                </div>
                            </StepperPanel>
                        </Stepper>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
export default Create;
