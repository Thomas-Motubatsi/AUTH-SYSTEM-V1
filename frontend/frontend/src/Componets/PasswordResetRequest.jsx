import '../App.css'
import React, { useState } from 'react' 
import Box from '@mui/material/Box'
import MyTextFields from './Forms/MyTextField'
import MyButtons from './Forms/MyButton'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import Message from './Message' 

const PasswordResetRequest = () => {
    const [showmessage, setShowmessage] = useState(false)

    const { handleSubmit, control } = useForm({
        defaultValues: {
            email: '',
        },
    })

    const submission = (data) => {
        
        AxiosInstance.post('api/password_reset/', {
            email: data.email,
        })
        .then((response) => {
            setShowmessage(true)
        })
        .catch((error) => {
            console.error("Password reset error: ", error)
            
            setShowmessage(true) 
        })
    }

    return (
        <div className={"myBackground"}> 
            <form onSubmit={handleSubmit(submission)}> 
                
                {showmessage && (
                    <Message text={"If your email exists, you got an email with instructions to reset password"} 
                    />
                )}

                <Box className={"Whitebox"}>
                    <Box className={"itembox"}>
                        <Box className={"title"}>
                            Password reset Request
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
                        <MyButtons
                            label={"Request password reset"}
                            type="submit"
                        />
                    </Box>
                </Box>
            </form>
        </div>
    )
}

export default PasswordResetRequest;