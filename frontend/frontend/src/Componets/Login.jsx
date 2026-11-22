import '../App.css'
import Box from '@mui/material/Box'
import MyTextFields from './Forms/MyTextField'
import MyPassField from './Forms/MyPassField'
import MyButtons from './Forms/MyButton'
import {Link} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { useNavigate } from 'react-router-dom'


const Login = () => {
    const navigate = useNavigate()
    const { handleSubmit, control } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const submission = (data) => {
        AxiosInstance.post('login/', {
            email: data.email,
            password: data.password,
        })
        .then((response) => {
            localStorage.setItem('Token', response.data.token)
            navigate('/home')
        })
        .catch((error) => {
            console.error(error.response?.data || error.message)
            alert('Login failed. Check your email and password.')
        })
    }

    return(
        <div className={"myBackground"}> 
        <form onSubmit={handleSubmit(submission)}> 
        <Box className={"Whitebox"}>
            <Box className={"itembox"}>
                <Box className={"title"}> Login 

                </Box>
            </Box>
            <Box className={"itembox"}> 
                <MyTextFields
                    label={"Email"}
                    name="email"
                    control={control}
                />
            </Box>
            <Box className={"itembox"}>
                <MyPassField 
                    label={"Password"}
                    name="password"
                    control={control}
                /> 

            </Box>
            <Box className={"itembox"}>
                <MyButtons
                    label={"Login"}
                    type="submit"
                />

            </Box>
            <Box className={"itembox"} sx= {{flexDirection:'column'}}>
                <Link to="/register"> No account yet </Link>
                <Link to="/request/password_reset">Forgotten your password? click here </Link>

            </Box>

        </Box>
        </form>

        </div>
    )
}

export default Login