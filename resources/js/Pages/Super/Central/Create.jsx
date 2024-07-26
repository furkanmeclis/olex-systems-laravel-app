import {InputTextarea} from "primereact/inputtextarea";
import {InputText} from "primereact/inputtext";
import {RadioButton} from "primereact/radiobutton";
import {InputNumber} from "primereact/inputnumber";
import {useEffect, useRef, useState} from "react";
import {Dropdown} from "primereact/dropdown";
import {classNames} from 'primereact/utils';
import {Divider} from "primereact/divider";
import {Button} from "primereact/button";
import {BlockUI} from 'primereact/blockui';
import {useFormik, useFormikContext} from "formik";
import * as Yup from 'yup';
import { Message } from 'primereact/message';
import {InputSwitch} from "primereact/inputswitch";
import {Password} from "primereact/password";
import {FloatLabel} from "primereact/floatlabel";
export default function Create({ csrf_token, toast, onHide, setUsers, setAddModalFooter,addModal,roles}) {
    const fileInput = useRef(null);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(false);
    const formRef = useRef();
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [activeRole, setActiveRole] = useState(roles[0]);
    const {values ,handleSubmit, handleChange,setFieldValue,errors,setErrors} = useFormik({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            active: true,
            password: '',
            password_confirmation: '',
            role:'central'
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().required('Merkez Üyesi Adı Zorunludur'),
            email: Yup.string().email('Geçerli Bir E-Posta Adresi Giriniz').required('E-Posta Adresi Zorunludur'),
            phone: Yup.string().required('Telefon Numarası Zorunludur'),
            password: Yup.string().required('Şifre Zorunludur').min(6,'Şifre En Az 6 Karakter Olmalıdır'),
            password_confirmation: Yup.string().required('Şifre Onayı Zorunludur').oneOf([Yup.ref('password'), null], 'Şifreler Eşleşmiyor'),
        }),
        onSubmit: values => {
            setLoading(true);
            let formData = new FormData();
            formData.append('name', values.name);
            formData.append('email', values.email);
            formData.append('phone', values.phone);
            formData.append('role',activeRole.role);
            formData.append('active', values.active);
            formData.append('password', values.password);
            formData.append('password_confirmation', values.password_confirmation);
            formData.append('image', file);
            fetch(route('super.central.store'), {
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
                    setUsers(data.users);
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
    })
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
        setAddModalFooter(<>
            <Button label="Vazgeç" icon="pi pi-times" size={"small"} link onClick={onHide} loading={loading}/>
            <Button label="Kaydet" icon="pi pi-save" type={"button"} size={"small"} className="p-button-success" loading={loading}
                    onClick={() => {
                        setFormSubmitted(true);
                        formRef.current.click();
                    }} />
        </>)
    },[addModal])

    return (<BlockUI blocked={loading} template={<i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>}>
        <form className="p-fluid"  onSubmit={handleSubmit}>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3">
                <div className={"col-span-2 grid gap-y-2"}>
                    {formSubmitted && Object.keys(errors).length > 0 && <>
                        {Object.entries(errors).map(([key, value]) => (<Message severity="warn" key={key} text={value}/>) )}
                    </>}
                </div>
                <div className={"col-span-2"}>
                    <label htmlFor="name" className="font-bold">
                        Merkez Üyesi Adı <span className={"font-semibold text-red-400"}>*</span>
                    </label>
                    <InputText id="name" name={"name"} onChange={handleChange} value={values.name} autoFocus/>

                </div>
            </div>
            <div className={"mb-3"}>
                <label htmlFor="email" className="font-bold">
                    Merkez Üyesi E-Posta Adresi <span className={"font-semibold text-red-400"}>*</span>
                </label>
                <InputText id="email" type={"email"} name={"email"} onChange={handleChange} value={values.email}/>
            </div>
            <div className={"mb-3"}>
                <label htmlFor="phone" className="font-bold">
                    Merkez Üyesi Telefon No <span className={"font-semibold text-red-400"}>*</span>
                </label>
                <InputText id="phone" type={"tel"} name={"phone"} onChange={handleChange} value={values.phone}/>
            </div>
            <div className={"mb-3"}>
                <label htmlFor="email" className="font-bold">
                    Merkez Üyesi Rolü <span className={"font-semibold text-red-400"}>*</span>
                </label>
                <Dropdown value={activeRole} onChange={(e) => setActiveRole(e.value)} options={roles}
                          optionLabel="label"
                          className="w-full"/>
            </div>
            <div className="mb-3 flex justify-start items-center gap-x-2">
                <InputSwitch checked={values.active} inputId={"Merkezuyesiactive"} onChange={(e) => setFieldValue('active',e.value)} />
                <label htmlFor="Merkezuyesiactive" className="font-bold">
                    Üye Aktifliği ({values.active ? "Aktif" : "Pasif"})
                </label>
            </div>
            <div className={"mb-3 grid grid-cols-2 gap-x-3"}>
                <div>
                    <label htmlFor="password" className="font-bold">
                        Merkez Üyesi Şifre <span className={"font-semibold text-red-400"}>*</span>
                    </label>
                    <Password id={"password"} name={"password"} value={values.password} onChange={handleChange} feedback={false} toggleMask/>
                </div>
                <div>
                    <label htmlFor="password_confirmation" className="font-bold">
                        Merkez Üyesi Şifre Onayla<span className={"font-semibold text-red-400"}>*</span>
                    </label>
                    <Password id={"password_confirmation"} name={"password_confirmation"} value={values.password_confirmation} onChange={handleChange} feedback={false} toggleMask/>
                </div>
            </div>


            <label className="font-bold " htmlFor={"image"}>
                Merkez Üyesi Avatar
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
                    {file !== false && <img src={URL.createObjectURL(file)} alt={file.name}
                                            className="w-full h-full max-h-44 bg-gray-300/10 border border-dashed object-contain rounded-lg"/>}
                </div>
            </div>
            <button type={"submit"} style={{display:"none"}} ref={formRef}></button>
        </form>
    </BlockUI>);
}
