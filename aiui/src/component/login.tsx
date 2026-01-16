import { useState } from "react";
import loginService from '../service/login'


const Loginform = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const onCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const credential = {
            "emailOrLdapLoginId": username,
            "password": password
        };
        console.log(credential);

        try{
            const login = await loginService.login(
                credential
            )
            console.log(login)
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
                    <button type='submit'>create</button>
                </form>
            </div>
        </>
    )
}

export default Loginform
