import carData from '@/car_data.json';
import {Dropdown} from 'primereact/dropdown';
import {useEffect, useState} from "react";
import {FloatLabel} from 'primereact/floatlabel';
import {InputText} from "primereact/inputtext";

const CarSelect = ({
                       selectedBrand,
                       setSelectedBrand,
                       selectedModel,
                       setSelectedModel,
                       selectedGeneration,
                       setSelectedGeneration,
                       selectedYear,
                       setSelectedYear,
                       onChange,
                       onComplete,
                   }) => {
    const brands = carData.brands.brand;
    const [generationText, setGenerationText] = useState("");
    useEffect(() => {
        if(selectedGeneration && selectedGeneration.non){
            setGenerationText(selectedGeneration.name);
            setSelectedGeneration({
                name:"Listede Bulamadım",
                modelYear:"",
                non:true
            })
        }
    },[]);
    const getBrandLogoUrl = (brand) => {
        if (brand === undefined || brand === null) {
            return "";
        }
        return "https://www.auto-data.net/img/logos/{brand_name}.png".replace("{brand_name}", brand.replaceAll(' ', '_').replaceAll('&amp;', '&'));
    }
    useEffect(() => {
        if (selectedYear !== null && onComplete !== undefined) {
            let props = {
                brand: selectedBrand,
                model: selectedModel,
                generation: selectedGeneration,
                brandLogo: getBrandLogoUrl(selectedBrand.name),
                year: selectedYear,
            }
            if (selectedGeneration?.non) {
                props.generation = {
                    name: generationText,
                    modelYear: "",
                    non: true
                };
                setSelectedGeneration({
                    name: generationText,
                    modelYear: "",
                    non: true
                });
            }
            onComplete(selectedGeneration);
        }
    }, [selectedYear]);
    useEffect(() => {
        if (onChange !== undefined) {
            let props = {
                brand: selectedBrand,
                model: selectedModel,
                generation: selectedGeneration,
                brandLogo: getBrandLogoUrl(selectedBrand?.name),
                year: selectedYear,
            }
            if (selectedGeneration?.non) {
                props.generation = {
                    name: generationText,
                    modelYear: "",
                    non: true
                };
            }
            onChange(props, selectedYear !== null);
        }
    }, [
        selectedBrand,
        selectedModel,
        selectedGeneration,
        selectedYear,
        generationText
    ])

    async function generateYearsArray(generation) {
        let years = [];
        if (!generation?.non) {
            let maxYear;
            let minYear;
            let modifications = generation.modifications.modification;

            modifications.forEach((modification) => {
                if (minYear === undefined || parseInt(modification.yearstart) < minYear) {
                    minYear = parseInt(modification.yearstart);
                }
                if (maxYear === undefined || parseInt(modification.yearstop) > maxYear) {
                    maxYear = parseInt(modification.yearstop);
                }
            });
            for (let i = minYear; i <= maxYear; i++) {
                years.push({
                    name: i
                });
            }
        }
        if (years.length > 0) {
            return years;
        } else {
            let years = [];
            for (let i = 1975; i <= Number(new Date().getFullYear()); i++) {
                years.push({
                    name: i
                });
            }
            years.sort((a, b) => b.name - a.name);
            return years;
        }
    }

    const selectedOptionTemplate = (option,props) => {
        if (option) {

            return <div className="flex items-center">
                <img src={getBrandLogoUrl(selectedBrand?.name)} alt={option.name} className="w-6 h-6 mr-2"/>
                <span>{option.name}</span>
            </div>;
        }else{
            return <span>{props.placeholder}</span>
        }
    }
    const [years, setYears] = useState([]);
    useEffect(() => {
        if (selectedGeneration) {
            generateYearsArray(selectedGeneration).then(setYears);
        }
    }, [selectedGeneration]);
    return <>
        <FloatLabel className="w-full md:w-14rem mt-4">
            <Dropdown
                inputId={"dd-brand"}
                value={selectedBrand}
                valueTemplate={selectedOptionTemplate}
                onChange={(e) => {
                    setSelectedBrand(e.value);
                    setSelectedModel(null);
                    setSelectedGeneration(null);
                    setSelectedYear(null);
                }}
                options={brands} optionLabel="name"
                placeholder="Araç Markası Seçiniz"
                virtualScrollerOptions={{itemSize: 38}}
                checkmark={true}
                filter
                showFilterClear={true}
                highlightOnSelect={false}
                className="w-full md:w-14rem"
                itemTemplate={(option) => (
                    <div className="flex items-center">
                        <img src={getBrandLogoUrl(option.name)} alt={option.name} className="w-8 h-8 mr-2"/>
                        <span>{option.name}</span>
                    </div>
                )}
            />
            <label htmlFor="dd-brand">Araç Markası</label>
        </FloatLabel>

        {selectedBrand && <FloatLabel className="w-full md:w-14rem mt-4">
            <Dropdown
                inputId={"dd-model"}
                value={selectedModel}
                onChange={(e) => {
                    setSelectedModel(e.value);
                    setSelectedGeneration(null);
                    setSelectedYear(null);
                }}
                options={selectedBrand.models.model} optionLabel="name"
                placeholder="Araç Modelini Seçiniz"
                valueTemplate={selectedOptionTemplate}
                virtualScrollerOptions={{itemSize: 38}}
                checkmark={true}
                filter
                showFilterClear={true}
                highlightOnSelect={false}
                className="w-full md:w-14rem"
                itemTemplate={(option) => (
                    <div className="flex items-center">
                        <img src={getBrandLogoUrl(selectedBrand.name)} alt={option.name} className="w-8 h-8 mr-2"/>
                        <span>{option.name}</span>
                    </div>
                )}
            />
            <label htmlFor="dd-model">Araç Modeli</label>
        </FloatLabel>}
        {selectedModel && <FloatLabel className="w-full md:w-14rem mt-4">
            <Dropdown
                inputId={"dd-generation"}
                value={selectedGeneration}
                onChange={(e) => {
                    setSelectedGeneration(e.value);
                    setSelectedYear(null);
                }}
                options={[{
                    name: "Listede Bulamadım",
                    modelYear: "",
                    non: true
                }, ...selectedModel.generations.generation]} optionLabel="name"
                placeholder="Araç Serisini Seçiniz"
                virtualScrollerOptions={{itemSize: 38}}
                checkmark={true}
                filter
                showFilterClear={true}
                valueTemplate={selectedOptionTemplate}
                highlightOnSelect={false}
                className="w-full md:w-14rem"
                itemTemplate={(option) => (
                    <div className="flex items-center">
                        <img src={getBrandLogoUrl(selectedBrand.name)} alt={option.name} className="w-8 h-8 mr-2"/>
                        <span>{option.name} {option.modelYear}</span>
                    </div>
                )}
            />
            <label htmlFor="dd-generation">Araç Serisi</label>
        </FloatLabel>}
        {selectedGeneration && selectedGeneration?.non && <FloatLabel className="w-full md:w-14rem mt-4">
            <InputText id="dd-generation-text" value={generationText} onChange={e => setGenerationText(e.target.value)}
                       className="w-full md:w-14rem"/>
            <label htmlFor="dd-generation-text">Araç Serisi</label>
        </FloatLabel>}
        {selectedGeneration && <FloatLabel className="w-full md:w-14rem mt-4">
            <Dropdown
                inputId={"dd-year"}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.value)}
                options={years}
                placeholder="Araç Yılı Seçiniz"
                virtualScrollerOptions={{itemSize: 38}}
                valueTemplate={selectedOptionTemplate}
                checkmark={true}
                optionLabel={"name"}
                filter
                showFilterClear={true}
                highlightOnSelect={false}
                className="w-full md:w-14rem"
                itemTemplate={(option) => (
                    <div className="flex items-center">
                        <img src={getBrandLogoUrl(selectedBrand.name)} alt={option + " .yıl"} className="w-8 h-8 mr-2"/>
                        <span>{option.name}</span>
                    </div>
                )}
            />
            <label htmlFor="dd-year">Araç Yılı</label>
        </FloatLabel>}
    </>
}
export default CarSelect;
