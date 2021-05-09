//import styles from './NavBar.module.css';
import './NavBar.css';
import logo from '../../Images/PRYAC_logo-reversed.png';
import {Link} from 'react-router-dom'

const NavBar = (props) => {
  const { user } = props;
  return (
      <header className="navbar">
        <Link className="logo" to="/anonDashboard">
          <img src={logo} width= "auto" height="45" alt=""></img>
        </Link>
        <nav>
            <ul className="navlinks">
              <li><Link to="/authDashboard">Dashboard</Link></li>
              <li><Link to="/opportunities" >Opportunities</Link></li>
              <li><Link to="/Calendar">Calendar</Link></li>
              <li><Link to="/Reports">Reports</Link></li>
              {user && user.admin !== null && user.admin === true ? <li><a href={`${process.env.REACT_APP_CLIENT_URL}/directory`}>Directory</a></li> : null}
              <li><Link to="/FAQ">FAQ</Link></li>
              <li><Link to="/OpportunityCheckout">Cart</Link></li>
              {user && user.boardMember !== null && user.boardMember === true ? <li><a href={`${process.env.REACT_APP_CLIENT_URL}/logHours`}>Log Hours</a></li> : null}
              { user ? (
                <li><a href={`${process.env.REACT_APP_SERVER_URL}/auth/logout`}>Log Out</a></li>
              ) : 
                <li><Link to="/Login">Login</Link></li>
              }
            </ul>
        </nav>
      </header>
  );
}

export default NavBar;