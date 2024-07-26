import {Fieldset} from 'primereact/fieldset';

import {FloatLabel} from 'primereact/floatlabel';
import {InputText} from 'primereact/inputtext';
import {SelectButton} from "primereact/selectbutton";
import {Badge} from "primereact/badge";
import {useEffect, useRef, useState} from "react";
import {Button} from "primereact/button";
import {getToken} from "firebase/messaging";
import {messaging} from "@/firebase/index.js";
import {Toast} from 'primereact/toast';
import {Head} from "@inertiajs/react";


const Index = ({customerB, csrf_token, hash}) => {
    const [customer, setCustomer] = useState(customerB);
    const toast = useRef(null);
    const [opened, setOpened] = useState(customer.player_id !== null);
    const {VITE_APP_VAPID_KEY} = import.meta.env;
    const [contact, setContact] = useState(Object.entries(JSON.parse(customer.notification_settings)).map(([key, value]) => {
        if (value) {
            return key;
        } else {
            return null;
        }
    }).filter((item) => item !== null));
    const [unSaved, setUnSaved] = useState(false);
    useEffect(() => {
        let oldContact = Object.entries(JSON.parse(customer.notification_settings)).map(([key, value]) => {
            if (value) {
                return key;
            } else {
                return null;
            }
        }).filter((item) => item !== null);
        oldContact.sort();
        contact.sort();
        if (JSON.stringify(oldContact) !== JSON.stringify(contact)) {
            setUnSaved(true);
        } else {
            setUnSaved(false);
        }
    }, [contact]);

    async function requestPermission() {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            const token = await getToken(messaging, {
                vapidKey: VITE_APP_VAPID_KEY,
            });
            let formdata = new FormData();
            formdata.append('player_id', token);
            formdata.append('action', 'token');
            fetch(route('customer.notifyUpdate', hash), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrf_token
                },
                body: formdata

            }).then(response => response.json()).then(data => {
                if (data.status) {
                    toast.current.show({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: data.message,
                        life: 3000
                    });
                    setOpened(true);
                    setCustomer(data.customer);
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
            });

        } else if (permission === "denied") {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Bildirimler Engellendi',
                life: 3000
            });
            setContact(contact.filter((item) => item !== 'push'));
        }
    }

    const openBrowserNotifications = () => {
        if ([
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)) {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Bildirimleri Açmak İçin Uygulamayı Ana Ekrana Ekleyiniz Paylaş Butonu Üzerinden',
                life: 10000
            });
        } else {
            requestPermission().then(r => console.log());
        }

    }
    return (
        <div className={"p-4"}>
            <Head title={"Müşteri Bilgileri"}/>
            <Toast ref={toast}/>
            <div>
                <img className={"mx-auto"} src={"/storage/olex-logo-yatay.svg"} alt="OLEX® Films"/>
            </div>
            <Fieldset legend="İletişim Bilgileri" className={"mt-4"} toggleable>
                <div className={"mt-4 gap-y-8 grid"}>
                    <FloatLabel>
                        <InputText id="username" className={"w-full"} value={customer.name} readOnly/>
                        <label htmlFor="username">Müşteri Adı</label>
                    </FloatLabel><FloatLabel>
                    <InputText id="email" className={"w-full"} value={customer.email} readOnly/>
                    <label htmlFor="email">Müşteri Mail Adresi</label>
                </FloatLabel><FloatLabel>
                    <InputText id="username" className={"w-full"} value={customer.phone} readOnly/>
                    <label htmlFor="username">Müşteri Telefon Numarası</label>
                </FloatLabel>
                </div>
            </Fieldset>
            <Fieldset legend="İletişim Tercihleri" className={"mt-4"} toggleable>
                <div className={"gap-y-8 grid"}>
                    <SelectButton multiple value={contact} onChange={(e) => setContact(e.value)}
                                  itemTemplate={(option) => {
                                      let isSelected = contact && contact.includes(option.value);
                                      return <div className={"w-full text-center"}><i
                                          className={option.icon + " p-overlay-badge"} style={{fontSize: '1.5rem'}}>
                                          {isSelected &&
                                              <Badge severity="success" value={<i className={"pi pi-check"}></i>}
                                                     style={{fontSize: '1px'}}></Badge>}
                                      </i></div>
                                  }}
                                  optionLabel="value"
                                  options={[
                                      {icon: 'pi pi-envelope', value: 'email'},
                                      {icon: 'pi pi-phone', value: 'sms'},
                                      {icon: 'pi pi-bell', value: 'push'},
                                  ]}/>
                    {unSaved && <div><Button label={"Tercihleri Kaydet"} icon={"pi pi-save"} onClick={() => {
                        let formdata = new FormData();
                        formdata.append('settings', JSON.stringify(contact));
                        formdata.append('action', 'settings');
                        fetch(route('customer.notifyUpdate', hash), {
                            method: 'POST',
                            headers: {
                                'X-CSRF-TOKEN': csrf_token
                            },
                            body: formdata

                        }).then(response => response.json()).then(data => {
                            if (data.status) {
                                toast.current.show({
                                    severity: 'success',
                                    summary: 'Başarılı',
                                    detail: data.message,
                                    life: 3000
                                });
                                setContact(Object.entries(JSON.parse(data.customer.notification_settings)).map(([key, value]) => {
                                    if (value) {
                                        return key;
                                    } else {
                                        return null;
                                    }
                                }).filter((item) => item !== null));
                                setCustomer(data.customer);
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
                        });
                    }} severity={"success"}/></div>}
                </div>
            </Fieldset>
            {contact && contact.includes('push') &&
                <Fieldset legend={"Mobil Bildirim Ayarları"} className={"mt-4"} toggleable>
                    <div className={"gap-y-8 grid"}>
                        {opened === false &&
                            <div><Button label={"Tarayıcı Bildirimlerini Aç"} onClick={openBrowserNotifications}
                                         icon={"pi pi-bell"} className={"p-button-success"}/></div>}
                        <p>
                            {opened ? "Tarayıcı Bildirimleriniz Açık Durumda" : "Tarayıcı Bildirimleri Kapalı Durumda"}
                        </p>
                    </div>
                </Fieldset>}

        </div>
    );
}
export default Index;
