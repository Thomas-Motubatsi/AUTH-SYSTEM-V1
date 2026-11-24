import '../App.css'
import React, { useState } from 'react' 
import Box from '@mui/material/Box'
import MyTextFields from './Forms/MyTextField'
import MyButtons from './Forms/MyButton'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import Message from './Message' 

const PasswordResetRequest = () => {
    const [messageText, setMessageText] = useState('')

    const { handleSubmit, control } = useForm({
        defaultValues: {
            email: '',
        },
    })

    const submission = (data) => {
        AxiosInstance.post('api/password_reset/', {
            email: data.email,
        })
        .then(() => {
            setMessageText(
                'If your email exists, you will receive instructions to reset your password.'
            )
        })
        .catch((error) => {
            console.error('Password reset error:', error)
            setMessageText(
                'Unable to request a password reset right now. Please try again later.'
            )
        })
    }

    return (
        <div className={"myBackground"}> 
            <form onSubmit={handleSubmit(submission)}> 
                
                {messageText && (
                    <Message text={messageText} />
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