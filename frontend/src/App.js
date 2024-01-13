import './App.css';
import {Route,Routes} from 'react-router-dom'
import Homepage from './Pages/Homepage';
import Chatpage from './Pages/Chatpage';


function App() {
  return (
    <div className="App">
    <Routes>
        <Route path='/' Component={Homepage}></Route>
        <Route path='/chats' Component={Chatpage}></Route>
    </Routes>
    </div>
  );
}

export default App;
