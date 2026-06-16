import AxiosInstance from "./AxiosInstance"
import {React, useEffect, useMemo, useState} from 'react'
import Box from '@mui/material/Box'



const Home = () =>{
    const [myData, setmyData] = useState([])
    const [loading, setloading] = useState(true)
    const GetData = ()=> {
        AxiosInstance.get(`users/`).then((res)=>{
            setmyData(res.data)
            setloading(false)
        })
    }

    useEffect(()=>{
        GetData()
    },[])

    return(
        <div>
            { loading ? <p>Loading data.... </p> : 
            <div>
              {myData.map((item, index)=>(
                <Box key={index}  sx={{ borderBottom: '5px solid #ccc', p: 1, my: 1 }}>
                    <div> ID: {item.id}</div>
                    <div> EMAIL: {item.email}</div>

                </Box>
              )
              )}  
            </div>
            }
        </div>
            
    )
}

export default Home