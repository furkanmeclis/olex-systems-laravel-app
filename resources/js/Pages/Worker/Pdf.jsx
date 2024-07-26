import React from 'react';
import { useReactToPrint } from 'react-to-print';
import { ContextMenu } from 'primereact/contextmenu';
import { Toast } from 'primereact/toast';
import html2canvas from "html2canvas";
import CarBody from "@/Components/CarBody.jsx";
import {classNames} from "primereact/utils";
const useServiceTemplate = (data={},options={}) => {
    const ref = React.useRef(null);
    const ref2 = React.useRef(null);
    const toast = React.useRef(null);
    const savelableRef = React.useRef(null);
    const [hidden, setHidden] = React.useState(false);
    const [imageMode, setImageMode] = React.useState(false);
    const handlePrint = useReactToPrint({
        documentTitle: "OLEX HİZMET BELGESİ",
        onBeforePrint: () => {
            toast.current.show({severity: 'warn', summary: 'Yazdırma Başlatıldı', detail: 'Belge yazdırılıyor...',icon:'pi pi-spin pi-spinner'});
        },
        onAfterPrint: () => {
            if(data.onAfterPrint && typeof data.onAfterPrint === "function") data.onAfterPrint();
            toast.current.clear();
            toast.current.show({severity: 'success', summary: 'Yazdırma Başarılı', detail: 'Belge yazdırma ekranı açıldı.',onHide:() => console.log("toast hidden")});
        },
        removeAfterPrint: true,
        content: () => ref.current
    });

    const Logo = ({text= false,dark=false,title=true}) => {
        return <svg className={"logo"} xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 511 440">
            <defs>
                <linearGradient id="linear-gradient" x1="2523.5" y1="544.344" x2="2523.5" y2="284"
                                gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#cd9a47"/>
                    <stop offset="0.017" stopColor="#cf9d4a"/>
                    <stop offset="0.337" stopColor="#fbd07a"/>
                    <stop offset="0.46" stopColor="#eabe67"/>
                    <stop offset="0.663" stopColor="#cd9f47"/>
                    <stop offset="1" stopColor="#fbd07a"/>
                </linearGradient>
            </defs>
            <g>
                <path id="Layer_11" data-name="Layer 11"  className={"cls-1 OLEXTEXT" + (dark ? " dark" : "")}
                      d="M2284.69,629.48c0,16.517,12.76,28.379,39.56,28.379,26.92,0,39.68-11.862,39.68-28.379,0-16.634-12.76-28.5-39.68-28.5-26.8,0-39.56,11.863-39.56,28.5m-16.69,0c0-24.79,19.31-43.5,56.37-43.5s56.36,18.711,56.36,43.5-19.3,43.5-56.36,43.5S2268,654.271,2268,629.48m226.06,42.429V655.455h-72.8V587.293h-16.55v84.616h89.35Zm118.24,0V655.455h-78.56V637.7h68.6V621.256h-68.6V603.742h78.56V587.293h-95.11v84.616h95.11Zm127.21-84.617h-23.78l-32.06,30.926-32.07-30.926h-23.78l43.96,42.392L2628,671.908h23.77l31.9-30.759,31.89,30.759h23.77l-43.78-42.224Z"
                      transform="translate(-2268 -284)"/>
                <path id="Layer_13" data-name="Layer 13" className={"cls-1 OLEXTEXT" + (dark ? " dark" : "")}
                      d="M2764.81,598.069h2.3a2.175,2.175,0,0,0,1.04-.23,1.735,1.735,0,0,0,.68-0.65,1.881,1.881,0,0,0,.23-0.961,1.839,1.839,0,0,0-.23-0.966,1.772,1.772,0,0,0-.68-0.645,2.187,2.187,0,0,0-1.04-.23h-2.3v3.682Zm-2.19,6.328V592.466h4.47a5.008,5.008,0,0,1,2.16.44,3.442,3.442,0,0,1,1.48,1.277,3.806,3.806,0,0,1,.53,2.045,3.628,3.628,0,0,1-.59,2.1,3.508,3.508,0,0,1-1.59,1.283l2.76,4.791h-2.48l-2.95-5.238,1.42,0.831h-3.02V604.4h-2.19Zm4.16-16.168a10.27,10.27,0,1,0,10.34,10.269,10.308,10.308,0,0,0-10.34-10.269m0,22.417A12.148,12.148,0,1,1,2779,598.5a12.2,12.2,0,0,1-12.22,12.148"
                      transform="translate(-2268 -284)"/>
                {text === true &&  <path id="PPF_WINDOW_FILM" data-name="PPF &amp; WINDOW FILM" className="cls-1"
                                d="M2343.38,704.22v19.77h2.22v-7.479a10.454,10.454,0,0,0,1.07.11h13.19a3.285,3.285,0,0,0,3.29-3.3v-5.8a3.285,3.285,0,0,0-3.29-3.3h-16.48Zm17.55,9.1a1.071,1.071,0,0,1-1.07,1.045h-13.19a1.071,1.071,0,0,1-1.07-1.045v-5.8a1.1,1.1,0,0,1,1.07-1.073h13.19a1.1,1.1,0,0,1,1.07,1.073v5.8Zm4.17-9.1v19.77h2.23v-7.479a9.931,9.931,0,0,0,1.07.11h13.18a3.285,3.285,0,0,0,3.29-3.3v-5.8a3.285,3.285,0,0,0-3.29-3.3H2365.1Zm17.55,9.1a1.071,1.071,0,0,1-1.07,1.045H2368.4a1.064,1.064,0,0,1-1.07-1.045v-5.8a1.088,1.088,0,0,1,1.07-1.073h13.18a1.1,1.1,0,0,1,1.07,1.073v5.8Zm4.23-9.129v19.8h2.22v-8.772h12.72v-2.254H2389.1v-6.545h15.82v-2.227h-18.04Zm47.15,15.206v-4.565h-2.25v3.823l-14.31-7.232V707.6a1.089,1.089,0,0,1,1.07-1.073h11.29a1.076,1.076,0,0,1,1.07,1.073v0.934h2.28v-1.511a3.845,3.845,0,0,0-3.35-2.8h-11.29a3.323,3.323,0,0,0-3.32,3.355v2.749a3.164,3.164,0,0,0,1.56,2.64c-1.81,0-2.72,1.127-2.72,1.787v5.912a3.325,3.325,0,0,0,3.33,3.327h13.32a3.692,3.692,0,0,0,3.24-2.558l3.76,2.118v-1.98Zm-16.64,2.337a1.088,1.088,0,0,1-1.07-1.072v-5.912a1.088,1.088,0,0,1,1.07-1.072h0.41l14,7.066a1.459,1.459,0,0,1-1.09.99h-13.32Zm57.56-17.543c-1.76,4.922-4.01,11.026-5.74,15.893l-5.8-15.893h-2.69c-1.78,4.922-4.01,11.026-5.77,15.893l-5.79-15.893h-2.36l7.19,19.8h1.93l6.15-16.91,6.15,16.91h1.95l7.19-19.8h-2.41Zm4.83,19.8H2482v-19.8h-2.22v19.8Zm23.56-2.53-14.5-17.268h-3.05v19.8h2.23V706.722l14.5,17.268h3.05v-19.8h-2.23V721.46Zm5.36-17.268v19.8h16.47a3.276,3.276,0,0,0,3.3-3.3v-13.2a3.277,3.277,0,0,0-3.3-3.3H2508.7Zm17.54,16.5a1.087,1.087,0,0,1-1.07,1.072h-13.18a1.087,1.087,0,0,1-1.07-1.072v-13.2a1.088,1.088,0,0,1,1.07-1.073h13.18a1.088,1.088,0,0,1,1.07,1.073v13.2Zm8.54-16.5a3.268,3.268,0,0,0-3.29,3.3v13.2a3.268,3.268,0,0,0,3.29,3.3h13.19a3.268,3.268,0,0,0,3.29-3.3v-13.2a3.268,3.268,0,0,0-3.29-3.3h-13.19Zm0,17.57a1.094,1.094,0,0,1-1.07-1.072v-13.2a1.1,1.1,0,0,1,1.07-1.073h13.19a1.1,1.1,0,0,1,1.07,1.073v13.2a1.094,1.094,0,0,1-1.07,1.072h-13.19Zm46.33-17.57c-1.76,4.922-4.01,11.026-5.74,15.893l-5.79-15.893h-2.69c-1.79,4.922-4.01,11.026-5.77,15.893l-5.79-15.893h-2.37l7.2,19.8h1.92l6.15-16.91,6.15,16.91h1.95l7.2-19.8h-2.42Zm12.33,0v19.8h2.23v-8.772h12.71v-2.254h-12.71v-6.545h15.81v-2.227h-18.04Zm19.83,19.8h2.22v-19.8h-2.22v19.8Zm6.04,0h19.77v-2.228h-17.55v-17.6h-2.22V723.99Zm32.62-10.009-8.21-9.789h-3.04v19.8h2.22V706.722l9.03,10.751,9.04-10.751V723.99h2.22v-19.8h-3.04Z"
                                transform="translate(-2268 -284)"/>}
            </g>
            <path id="Layer_7" data-name="Layer 7" className="cls-2"
                  d="M2523.33,484.867c-23.45,0-45.56,2.588-62.27,7.287q-12.855,3.623-20.08,8.452l-12.72-87.723,33.36,29.309,7.61-65.075,30.9,54.865,23.38-77.118,23.38,77.118,30.89-54.865,7.62,65.075,33.36-29.309-12.75,87.954c-14.7-9.48-47.25-15.97-82.68-15.97m58.79,28.3c-14.4-6.539-40.42-7.927-53.24-8.2v-8.9c22.71,0.444,41.16,3.508,54.08,7.13Zm-58.79,20.043c-52.02,0-80.39-12.289-80.39-18.6,0-6.086,26.37-17.718,74.84-18.548V516.05h5.55c32.42,0,51.87,5.192,56.97,8.576-5.1,3.384-24.55,8.584-56.97,8.584m110.75-148.593-40.11,35.241-9.13-77.941-34.87,61.938-26.46-87.28-26.46,87.28-34.88-61.938-9.12,77.941-40.11-35.241,18.95,130.743c0.51,9.094,10.3,16.4,29.17,21.7,16.71,4.7,38.82,7.287,62.27,7.287,11.42,0,67.95-.945,68.91-19.256h0.03l1.53-18.244a161.563,161.563,0,0,1,21.04,10.49l0.28-1.931Zm-110.57-68.038-11.43-16.289L2523.51,284l11.43,16.29ZM2584.83,342l-7.09-16.142,12.76-12.141,7.1,16.142Zm49.29,42.541-1.83-15.748,14.17-7.031,1.83,15.747ZM2462.19,342l7.09-16.142-12.77-12.141-7.09,16.142Zm-49.29,42.541,1.82-15.748-14.16-7.031-1.83,15.747Z"
                  transform="translate(-2268 -284)"/>
        </svg>
    }
    const ServiceTemplate = (props) => {
        const items= [
            {
                label: 'Kaydet',
                icon: 'pi pi-image',
                command: () => {
                    setImageMode(true);
                    html2canvas(savelableRef.current,{allowTaint: true, useCORS: true, logging: true
                    }).then(canvas => {
                        const imgUrl = canvas.toDataURL("image/png");
                        const randomString = Math.random().toString(36).substring(7);
                        const link = document.createElement('a');
                        link.href = imgUrl;
                        link.download = randomString+'-service.png';
                        link.click();
                        setImageMode(false);
                    });
                }
            },
            {
                label: 'Yenile',
                icon: 'pi pi-refresh',
                command: () => {
                    setHidden(true);
                    setTimeout(() => {
                        setHidden(false);
                    }, 100);
                },
            },
            {
                label: 'Yazdır',
                icon: 'pi pi-print',
                command: () => handlePrint()
            }
        ]
        return <>
            <Toast ref={toast} />
            <ContextMenu ref={ref2} breakpoint="767px" model={items} />
            {hidden === false && data?.brand_logo && <div className={"servicePdf"} onContextMenu={(e) => ref2.current.show(e)} ref={ref}>
                <div className={"page1"}>
                    <Logo />
                    <h1 className={"title"}>Güven ve Kalitenin Belgesi:Sertifikalarımız</h1>
                    <p className={"description"}>OLEX olarak,araç koruma çözümlerinde mükemmelliği ve güvenilirliği taahhüt
                        ediyoruz.
                        Yüksek standartlarımızı koruma konusundaki kararlılığımızı,uluslararası tanınmış
                        sertifikalarımız ile kanıtlıyoruz.Aşağıda,sahip olduğumuz sertifikaları ve bu sertifikaların
                        sağladığı güvenceyi görebilirsiniz.</p>
                    <div className={"certificatesGrid"}>
                        <div className="certificate">
                            <img
                                src="https://d3v85gmohv94ja.cloudfront.net/images/mastertemplates/734/276_99097_image_p351_common.jpg"
                                alt="Sertifika"/>
                        </div>
                        <div className="certificate">
                            <img src="https://bthae.ankara.edu.tr/wp-content/uploads/sites/94/2016/05/sertifika-ornegi1.jpg"
                                 alt="Sertfika"/>
                        </div>
                        <div className="certificate">
                            <img src="https://kocegitimsertifika.com/wp-content/uploads/gedikornek.png" alt=""/>
                        </div>
                        <div className="certificate">
                            <img
                                src="https://marketplace.canva.com/EAFz4slU_SM/1/0/1600w/canva-mavi-klasik-kat%C4%B1l%C4%B1m-sertifikas%C4%B1-sertifika-YFgQcLPA-B0.jpg"
                                alt=""/>
                        </div>
                        <div className="certificate">
                            <img src="https://yusem.yalova.edu.tr/assets/images/yalova-universitesi-sertifika-ornegi.png"
                                 alt=""/>
                        </div>
                        <div className="certificate">
                            <img
                                src="https://bgcp.bionluk.com/images/portfolio/1400x788/6291b9f9-ad4b-44e6-8b31-059492a94d46.png"
                                alt=""/>
                        </div>
                    </div>
                </div>
                <div className="pageBreak"></div>
                <div className="page2" >
                    <Logo dark={true} />
                    <div className="carArea">
                        <div className="brand">
                            <img src={data.brand_logo} alt="" className="brandLogo"/>
                            <h1 className="brandName">{data.brand}</h1>
                        </div>
                        <div className="model">
                            {data.model} {data.generation} ({data.year})
                        </div>
                    </div>
                    <div className="carSvg">
                        <CarBody editable={false} value={data.body_data} pdfSource={true} onChange={() => {}} />
                    </div>
                    <div className={classNames("tableWrapper",{
                        "noRadius":imageMode
                    })} ref={savelableRef}>
                        <table className={classNames("appliedProducts",{
                            "noRadius":imageMode
                        })} >
                            <thead>
                            <tr>
                                <td colSpan={3} className={"tableHead"}>
                                    <div className="container"><Logo text={false} dark={true} title={false} />
                                        <span className={"title"}>
                                Applied Services
                            </span>
                                    </div>
                                </td>
                            </tr>
                            </thead>
                            <tbody>
                            {data.applied_services.map((service,index) => {
                                return <tr>
                                    <td>
                                        <div className={"tdWrapper"}>
                                            <div className="title">
                                                Category:
                                            </div>
                                            <div className="name">
                                                {service.category}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={"tdWrapper"}>
                                            <div className="title">
                                                Product: <span className="higlight">#{service.code}</span>
                                            </div>
                                            <div className="name">
                                                {service.name}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={"tdWrapper"}>
                                            <div className="title">
                                                Warranty:
                                            </div>
                                            <div className="warranty">
                                                {service.warranty} <span className="icon"><svg fill="none" height="32"
                                                                                           viewBox="0 0 32 32" width="32"
                                                                                           xmlns="http://www.w3.org/2000/svg"><g
                                                stroke="#1a8f14" strokeWidth="1.5"><path
                                                d="m14.4557 1.87651c.8-.972144 2.2886-.972144 3.0886 0l2.1871 2.65766c.4233.51427 1.0747.78412 1.7376.71974l3.4258-.3327c1.2532-.1217 2.3057.93083 2.184 2.18396l-.3327 3.42583c-.0644.6629.2055 1.3143.7197 1.7376l2.6577 2.1871c.9721.8.9721 2.2886 0 3.0886l-2.6577 2.1871c-.5142.4233-.7841 1.0747-.7197 1.7376l.3327 3.4258c.1217 1.2532-.9308 2.3057-2.184 2.184l-3.4258-.3327c-.6629-.0644-1.3143.2055-1.7376.7197l-2.1871 2.6577c-.8.9721-2.2886.9721-3.0886 0l-2.1871-2.6577c-.4233-.5142-1.0747-.7841-1.7376-.7197l-3.42583.3327c-1.25313.1217-2.30566-.9308-2.18396-2.184l.3327-3.4258c.06438-.6629-.20547-1.3143-.71974-1.7376l-2.65766-2.1871c-.972144-.8-.972144-2.2886 0-3.0886l2.65766-2.1871c.51427-.4233.78412-1.0747.71974-1.7376l-.3327-3.42583c-.1217-1.25313.93083-2.30566 2.18396-2.18396l3.42583.3327c.6629.06438 1.3143-.20547 1.7376-.71974z"/><path
                                                d="m11 17 3.1847 3.1847c.4303.4303 1.142.3797 1.5071-.1071l5.3082-7.0776"
                                                strokeLinecap="round"/></g></svg>
                                </span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="pageBreak"></div>
                <div className={"page3"}>

                    <Logo />
                    <p className="description center">
                        OLEX , araçlarınızın değerini ve görünümünü korumak için profesyonel
                        araç koruma çözümleri sunan lider bir markadır. Yüksek kaliteli PPF
                        (Paint Protection Film) ve cam filmleri ile araçlarınızı en iyi şekilde
                        koruma altına alıyoruz.
                    </p>
                    <h1 className={"title"}>OLEX Ürünlerinizi Nasıl Koruyabilirsiniz:</h1>
                    <p className={"description"}><b>İlk 7 Gün:</b> Araç Yıkama : Uygulamadan sonraki ilk 7 gün boyunca aracınızı
                        yıkamayın. Bu süre,filmin tamamen yapışması ve en yüksek koruma seviyesine
                        ulaşması için gereklidir.
                        <br/>
                        <b>Aşırı Hava Koşulları:</b> Mümkünse aracınızı aşırı güneş ışığından, yağmurdan ve
                        kirden koruyun.
                    </p>
                    <h1 className={"title"}>Araç Yıkama ve Temizlik:</h1>
                    <p className={"description"}>
                        <b>Elle Yıkama:</b> Aracınızı elle yıkamak en güvenli yöntemdir. Yumuşak bir sünger
                        veya mikrofiber bez kullanarak aracınızı nazikçe temizleyin. <br/>
                        <b>PH Dengelemiş Şampuan:</b> Asitli veya aşırı alkali temizleyicilerden kaçının. PH
                        dengeli araç şampuanları kullanarak filmin zarar görmesini önleyin. <br/>
                        <b>Basınçlı Su:</b> Basınçlı su kullanırken, su püskürtme ucunu filmden en az 30cm
                        uzakta tutun ve yüksek basınçlı suyu doğrudan kenarlara veya dikişlere
                        yöneltmeyin.
                    </p>
                    <h1 className={"title"}>Koruma ve Bakım:</h1>
                    <p className="description">
                        <b>Düzenli Bakım:</b> Aracınızı düzenli olarak yıkayarak ve kirden arındırarak filmin
                        ömrünü uzatabilirsiniz. <br/>
                        <b>Cila ve Kaplama:</b> OLEXPPF,ekstra koruma sağlamak için cilalanabilir veya
                        seramik kaplama uygulanabilir. Ancak,bu işlemler için OLEX onaylı ürünler
                        kullanmanız önerilir. <br/>
                        <b>Lekeler:</b> Kuş pisliği, ağaç reçinesi veya böcek kalıntıları gibi lekeleri hızlıca
                        temizleyin. Bu maddeler uzun süre kaldığında filmde leke veya zarar
                        oluşturabilir.
                    </p>
                </div>
                <div className="pageBreak"></div>
                <div className="page4">
                    <img className="absoluteBrandLogo" src={data.brand_logo} />

                    <Logo text={true} dark={true} />
                    <div className="carArea">
                        <div className="brand">
                            <img src={data.brand_logo} alt="" className="brandLogo"/>
                            <h1 className="brandName">{data.brand}</h1>
                        </div>
                        <div className="model">
                            {data.model} {data.generation} ({data.year})
                        </div>
                    </div>
                </div>

            </div>}
        </>;
    };
    return {handlePrint, ServiceTemplate};
};
export default useServiceTemplate;
