import {useEffect, useRef, useState} from "react";
import {TreeTable} from 'primereact/treetable';
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import {useFormik} from "formik";

const ProductCodes = ({csrf_token, order, productCodesModal, setFooter, onHide, toast,setRecords}) => {
    useEffect(() => {
        console.log('mounted')
    },[])
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [availableCodes, setAvailableCodes] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [productCodes, setProductCodes] = useState([]);
    const [postData, setPostData] = useState([]);
    let {values,setFieldValue,handleSubmit} = useFormik({
        initialValues: {
            postData: []
        },
        onSubmit: (values) => {
            let postDatJson = JSON.stringify({codes: values.postData.join(","),_method:'PUT'});
            fetch(route('super.orders.updateProductCodes', order?.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf_token
                },
                body: postDatJson
            }).then(r => r.json()).then(response => {
                if (response.status) {
                    setRecords(response.records);
                    toast.current.show({severity: 'success', summary: 'Başarılı', detail: response.message});
                    onHide();
                } else {
                    toast.current.show({severity: 'error', summary: 'Hata', detail: response.message});
                }
            }).catch((err) => {
                console.log(err);
                toast.current.show({
                    severity: 'error',
                    summary: 'Hata',
                    detail: "CSRF Token Hatası Lütfen Sayfayı Yenileyiniz.."
                });
            }).finally(() => {
                setLoading(false);
            });
        }
    });
    const getProductCodes = () => {
        setLoading(true)
        fetch(route('super.orders.listProductCodes', order?.id), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf_token
            },
        }).then(r => r.json()).then(response => {
            if (response.status) {
                setCodes(response.codes);
                setAvailableCodes(response.availableCodes);
            } else {
                toast.current.show({severity: 'error', summary: 'Hata', detail: response.message});
            }
        }).catch((err) => {
            console.log(err);
            toast.current.show({severity: 'error', summary: 'Hata', detail: 'Ürünler getirilirken bir hata oluştu.'});
        }).finally(() => {
            setLoading(false);
        });
    }
    useEffect(() => {
        getProductCodes();
    }, [order]);
    useEffect(() => {
        setTableData(() => {
            setProductCodes([]);
            return Object.entries(availableCodes).map(([product_id, product]) => {
                setProductCodes((prev) => {
                    let _productCodes = {};
                    _productCodes.codes = product.codes.map((code) => {
                        return 'code_' + code.code;
                    });
                    _productCodes.product_id = product.id;
                    _productCodes.maksimum = order.products.find(p => p.product_id === product.id)?.quantity;
                    return [...prev, _productCodes];
                })
                return {
                    key: 'product_' + product_id,
                    data: {
                        ...product,
                        name: '#' + product.id + " " + product.name + " (" + order.products.find(p => p.product_id === product.id)?.quantity + " Adet) ",
                        maxSelect: order.products.find(p => p.product_id === product.id)?.quantity
                    },
                    selectable: false,
                    children: product.codes.map((code) => {
                        setSelectedCodes((prev) => ({
                            ...prev,
                            ['code_' + code.code]: {checked: (order.id === code.order_id), partialChecked: false}
                        }))
                        return {
                            key: 'code_' + code.code,
                            data: {
                                name: "Ürün Kodu:  " + code.code,
                                sku: "",
                                ...code

                            },
                            selected: true
                        }
                    })
                }
            });
        })
    }, [codes, availableCodes]);
    const onSelectionChange = (e) => {
        let value = e.value;
        let differendValue = Object.keys(selectedCodes).filter(v => {
            if (!String(v).includes('product_')) {
                return !Object.keys(value).includes(v) || value[v].checked !== selectedCodes[v].checked || value[v].partialChecked !== selectedCodes[v].partialChecked;
            } else {
                return false;
            }
        });
        let codeKey = differendValue[0];
        differendValue = value[differendValue[0]];
        if (differendValue !== undefined && differendValue.checked) {
            let response = productCodes.map((productCode) => {
                if (productCode.codes.includes(codeKey)) {
                    let totalSelected = Object.keys(selectedCodes).filter((code) => {
                        if (productCode.codes.includes(code)) {
                            return selectedCodes[code].checked;
                        }
                    }).length + 1;
                    if (productCode.maksimum < totalSelected) {
                        toast.current.show({
                            severity: 'error',
                            summary: 'Hata',
                            detail: 'Bu ürüne başka ürün kodu tanımlayamazsınız,stok adedi artırabilirsiniz.'
                        });
                        return "notupdate";
                    } else {
                        return "update";
                    }
                }
            });
            if (!response.includes("notupdate")) {
                setSelectedCodes(value);
            }
        } else {
            setSelectedCodes(value);
        }
    }
    const btnRef = useRef();
    useEffect(() => {
        const handleClick = () => {
            btnRef.current.click();
        }
        setFooter(<>
            <Button label="Vazgeç" icon="pi pi-times" size={"small"} link onClick={onHide} loading={loading}/>
            <Button label="Kaydet" icon="pi pi-save" size={"small"} className="p-button-success" loading={loading}
                    onClick={handleClick}/>
        </>)
    }, [productCodesModal]);
    useEffect(() => {
        setFieldValue('postData',Object.entries(selectedCodes).map(([key, value]) => {
            if (key.includes('code_') && value.checked) {
                return key.replace('code_','');
            }else{
                return false;
            }
        }).filter(Boolean))
    },[selectedCodes]);
    return (
        <form onSubmit={handleSubmit}>
            <TreeTable value={tableData} paginator showGridlines rows={5} rowsPerPageOptions={[5, 10, 25]}
                       selectionMode="checkbox" selectionKeys={selectedCodes} onSelectionChange={onSelectionChange}
                       tableStyle={{minWidth: '50rem'}}>
                <Column field="name" header="Ürün Adı" expander></Column>
                <Column field="sku" header="Ürün Stok Kodu"></Column>
            </TreeTable>
            <button type={"submit"} ref={btnRef} className={"hidden"}></button>
        </form>
    );
}
export default ProductCodes;
