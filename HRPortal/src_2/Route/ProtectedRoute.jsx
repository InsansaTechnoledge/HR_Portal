import { useContext } from 'react';
import { Navigate, useLocation} from 'react-router-dom';
import { userContext } from '../Context/userContext';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const {user, setUser} = useContext(userContext);

    console.log("PROT",user);
    return (user ? children : <Navigate to='/' replace state={{ from: location }}/>)

}
export default ProtectedRoute;