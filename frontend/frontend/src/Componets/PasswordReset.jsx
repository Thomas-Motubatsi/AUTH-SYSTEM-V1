import '../App.css'
import React, { useState } from 'react' 
import Box from '@mui/material/Box'
import MyPassField from './Forms/MyPassField'
import MyButtons from './Forms/MyButton'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import Message from './Message' 
import { useNavigate, useParams } from 'react-router-dom'

const PasswordReset = () => {
    const [showMessage, setShowMessage] = useState(false)
    const [messageText, setMessageText] = useState('')
    const { token } = useParams()
    const navigate = useNavigate()

    const { handleSubmit, control, watch } = useForm({
        defaultValues: {
            password: '',
            password2: '',
        },
    })

    const submission = (data) => {
        if (!token) {
            setMessageText('Reset token missing from URL.')
            setShowMessage(true)
            return
        }

        if (data.password !== data.password2) {
            setMessageText('Passwords do not match.')
            setShowMessage(true)
            return
        }

        AxiosInstance.post('api/password_reset/confirm/', {
            password: data.password,
            token: token,
        })
        .then((response) => {
            setMessageText('Your password has been reset. Redirecting to the login page...')
            setShowMessage(true)
            setTimeout(() => {
                navigate('/')
            }, 2000)
        })
        .catch((error) => {
            console.error('Password reset error: ', error)
            const errorMessage = error.response?.data?.detail || error.response?.data || error.message
            setMessageText(`Password reset failed. ${errorMessage}`)
            setShowMessage(true)
        })
    }

    return (
        <div className="myBackground"> 
            <form onSubmit={handleSubmit(submission)}> 
                {showMessage && (
                    <Message text={messageText} />
                )}

                <Box className="Whitebox">
                    <Box className="itembox">
                        <Box className="title">
                            Password reset
                        </Box>
                    </Box>

                    <Box className="itembox"> 
                        <MyPassField 
                            label="Password"
                            name="password"
                            control={control}
                        /> 
                        <MyPassField 
                            label="Confirm Password"
                            name="password2"
                            control={control}
                        />
                    </Box>

                    <Box className="itembox">
                        <MyButtons
                            label="Reset password"
                            type="submit"
                        />
                    </Box>
                </Box>
            </form>
        </div>
    )
}

export default PasswordReset;