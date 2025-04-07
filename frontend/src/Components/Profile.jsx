import { useState } from 'react';
import '../styles/Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

export default function Profile() {
    const [toggle, setToggle] = useState(false);
    const handleToggle=()=>{

        setToggle(!toggle);

    }

    const stopclickpropagesion =(e)=>{
        e.stopPropagation();
    }

    

    return (
        <>
        <div className='circle' >
        <FontAwesomeIcon icon={faUserCircle} size="2x" className='user' onClick={handleToggle} />
            
           {toggle ? 
            <div className='togglelayout' onClick={stopclickpropagesion}>

                <h4>Welcome Mairandii </h4>
                <p> Joined at 12.30 </p>
                <p className='log'> logout</p>


            </div>
                : <div>  
                    
                    
                    


                </div> }

        </div>
        </>
      
    );
  }
  