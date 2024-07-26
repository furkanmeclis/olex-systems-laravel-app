import {FloatLabel} from 'primereact/floatlabel';
import {InputText} from 'primereact/inputtext';
import {Password} from "primereact/password";
import {useRef, useState} from "react";
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {InputMask} from "primereact/inputmask";
import {useFormik} from "formik";
import {Button} from "primereact/button";
import {router, useForm, usePage} from "@inertiajs/react";
import {Toast} from "primereact/toast";
import {Message} from "primereact/message";
import {TabView, TabPanel} from 'primereact/tabview';
import {Image} from 'primereact/image';
import {Avatar} from "primereact/avatar";
import {classNames} from "primereact/utils";
import {useSessionStorage} from 'primereact/hooks';

const Profile = ({dealer, detail, csrf_token, toast, setLoading, loading, setDetail}) => {
    const fileInput = useRef(null);
    const [file, setFile] = useState(false);
    const [activeIndex, setActiveIndex] = useSessionStorage(0, 'central-dealer-profile-tab');
    const [values, setValues] = useState({
        name: detail.company_name || '',
        email: detail.company_email || '',
        phone: detail.company_phone || '',
        country: detail.company_country || '',
        city: detail.company_city || '',
        district: detail.company_district || '',
        zip: detail.company_zip || '',
        address: detail.company_address || '',
        image: detail.company_logo || ''
    });
    const handleChange = (e) => {
        setValues(data => ({...data, [e.target.name]: e.target.value}));
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
    const handleSubmit = (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append('company_name', values.name);
        formData.append('company_email', values.email);
        formData.append('company_phone', values.phone);
        formData.append('company_country', values.country);
        formData.append('company_city', values.city);
        formData.append('company_district', values.district);
        formData.append('company_zip', values.zip);
        formData.append('company_address', values.address);
        formData.append('_method', 'PUT');
        setLoading(true);
        fetch(route('central.dealers.updateDetails', dealer.id), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrf_token
            },
            body: formData
        }).then(r => r.json()).then(data => {
            if (data.status) {
                setLoading(false);
                toast.current.show({severity: 'success', summary: 'İşlem Başarılı', detail: data.message});
                let details = data.details;
                setDetail(details);
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
    const handleFileSubmit = (e) => {
        e.preventDefault();
        if (file === false) {
            toast.current.show({severity: 'error', summary: 'Hata', detail: 'Lütfen Dosya Seçiniz.'});
            return false;
        }
        let formData = new FormData();
        formData.append('logo', file);
        formData.append('action', 'logo');
        formData.append('_method', 'PUT');
        setLoading(true);
        fetch(route('central.dealers.updateDetails', dealer.id), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrf_token
            },
            body: formData
        }).then(r => r.json()).then(data => {
            if (data.status) {
                let details = data.details;
                setDetail(details);
                toast.current.show({severity: 'success', summary: 'İşlem Başarılı', detail: data.message});
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
    return (<TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
            <TabPanel header="Bayi Bilgileri">
                <form onSubmit={handleSubmit} className={"m-0"}>
                    <label htmlFor="name">Bayi Adı</label>
                    <InputText className={"w-full mb-2"} value={values.name} id="name" name={"name"} type="text"
                               onChange={handleChange}/>

                    <label htmlFor="email">Bayi Mail Adresi</label>
                    <InputText className={"w-full"} id="email" value={values.email} type="email"
                               onChange={handleChange}
                               name={"email"}
                               keyfilter={"email"}/>

                    <label htmlFor="phone">Bayi Telefon Numarası</label>
                    <InputMask id="phone" mask="0(999) 999 99 99" placeholder="0(999) 999 99 99" value={values.phone}
                               onChange={handleChange}
                               name={"phone"}
                               className={"w-full"}></InputMask>

                    <label htmlFor="country">Ülke</label>
                    <InputText className={"w-full"} id="country" value={values.country} type="text"
                               onChange={handleChange}
                               name={"country"}
                               autoComplete={"country"}/>

                    <label htmlFor="city">Şehir</label>
                    <InputText className={"w-full"} id="city" value={values.city}
                               onChange={handleChange}
                               name={"city"}
                               type="text"/>

                    <label htmlFor="district">İlçe</label>
                    <InputText className={"w-full"} id="district" value={values.district}
                               onChange={handleChange}
                               name={"district"}
                               type="text"/>

                    <label htmlFor="zip">Posta Kodu</label>
                    <InputMask className={"w-full"} id="zip" value={values.zip}
                               onChange={handleChange}
                               name={"zip"}
                               placeholder={"99999"} mask={"99999"}/>

                    <label htmlFor="address">Adres</label>
                    <InputText className={"w-full"} id="address"
                               onChange={handleChange}
                               name={"address"}
                               value={values.address} type="text" autoComplete={"address"}/>

                    <Button type="submit" label="Kaydet" loading={loading} severity={"success"} size={"small"}
                            className={"mt-2"}/>

                </form>
            </TabPanel>
            <TabPanel header="Bayi Logo">
                <div className="m-0">
                    <div className={"grid grid-cols-3 gap-x-3 my-3"}>
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
                        <div className={"col-span-2"}>
                            <img src={file !== false ? URL.createObjectURL(file) : values.image} alt={file?.name}
                                 className={classNames("w-full h-full max-h-44 bg-gray-300/10 border border-dashed object-contain rounded-lg", {
                                     "border-orange-400": file === false,
                                     "border-green-400": file !== false
                                 })}/>
                        </div>
                    </div>
                    <Button label="Kaydet" loading={loading} onClick={handleFileSubmit} severity={"success"}
                            size={"small"} className={"mt-2"}/>
                </div>
            </TabPanel>

        </TabView>

    )
}
export default Profile;
