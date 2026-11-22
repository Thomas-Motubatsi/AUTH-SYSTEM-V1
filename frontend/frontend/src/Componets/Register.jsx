import '../App.css'
import React from 'react'
import Box from '@mui/material/Box'
import MyTextFields from './Forms/MyTextField'
import MyPassField from './Forms/MyPassField'
import MyButtons from './Forms/MyButton'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AxiosInstance from './AxiosInstance'
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"


const schema = yup.object({
    email: yup
        .string()
        .email('Field expects an email address')
        .required('Email is a required field'),
    password: yup
        .string()
        .required('Password is a required field')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    password2: yup
        .string()
        .required('Password confirmation is a required field')
        .oneOf([yup.ref('password'), null], 'Passwords must match')
}).required()

const Register = () => {
    const navigate = useNavigate()

    const { handleSubmit, control } = useForm({
        defaultValues: {
            email: '',
            password: '',
            password2: '',
        },
        resolver: yupResolver(schema) 
    })

    const submission = (data) => {
 
        AxiosInstance.post('register/', {
            email: data.email,
            password: data.password,
        })
        .then(() => {
            navigate('/')
        })
        .catch((error) => {
            console.error(error.response?.data || error.message)
            alert('Registration failed. Please check the information and try again.')
        })
    }

    return (
        <div className="myBackground">
            <form onSubmit={handleSubmit(submission)}>
                <Box className="Whitebox">
                    <Box className="itembox">
                        <Box className="title">Register </Box>
                    </Box>
                    <Box className="itembox">
                        <MyTextFields
                            label="Email"
                            name="email"
                            control={control}
                        />
                    </Box>
                    <Box className="itembox">
                        <MyPassField
                            label="Password"
                            name="password"
                            control={control}
                        />
                    </Box>
                    <Box className="itembox">
                        <MyPassField
                            label="Confirm Password"
                            name="password2"
                            control={control}
                        />
                    </Box>
                    <Box className="itembox">
                        <MyButtons
                            type="submit"
                            label="Register"
                        />
                    </Box>
                    <Box className="itembox">
                        <Link to="/">Already have an account? Login</Link>
                    </Box>
                </Box>
            </form>
        </div>
    )
}

export default Register;
