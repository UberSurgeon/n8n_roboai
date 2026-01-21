import createApiService from '../service/internal/createapi'
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux'
import { initializeN8nApiKey } from "../reducer/apiKeyReducer";
import store from '../reducer/store';



const Createapi = () => {
    const auth = useSelector((store) => store.auth);
    const dispatch = useDispatch();
    

    const onClick = async (event) => {
        event.preventDefault()
        

        if (!auth){
            console.log("not login");
        }

        const n8nAuth = {
            "raw_cookie": auth
        };

        console.log(n8nAuth);

        try{
            const api = await createApiService.createapi(
                n8nAuth
            )
            console.log(api.data.rawApiKey)
            dispatch(initializeN8nApiKey(api.data.rawApiKey))

        } catch (exception) {
            console.error("error", exception);
        }
    }

    return (
        <>
            <div>
                <button onClick={onClick}>create api</button>
            </div>
        </>
    )
}

export default Createapi
