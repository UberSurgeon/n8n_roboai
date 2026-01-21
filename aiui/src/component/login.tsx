import { useState } from "react";
import { useLogin } from '../service/login'


const Loginform = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const login = useLogin();

    const onCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const credential = {
            "emailOrLdapLoginId": username,
            "password": password
        };
        console.log(credential);

        try{
            const data = await login(
                credential
            )
            console.log(data)
        } catch (exception) {
            console.error("error", exception);
        }
    }

    return (
        <>
            <div>
                <form onSubmit={onCreate}>
                    <input 
                    id="username"
                    type="text"
                    name="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                    id="password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type='submit'>login</button>
                </form>
            </div>
        </>
    )
}

export default Loginform
