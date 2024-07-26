import Index from "@/Pages/Super/Customers/Index.jsx";
import {useEffect} from "react";

const Customers = (props) => {
    useEffect(() => {
        console.log('render CustomersController');
    },[])
    return (
        <div>
            <Index {...props} page={false} />
        </div>
    );
}
export default Customers;
