import './App.css';
import About from './components/About';
import Home from './components/Home';
import NavBar from './components/NavBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Notestate from './context/notes/NoteState';
import AlertBox from './components/AlertBox';
function App() {
  return (
    <>
      <Notestate>
        <Router>
          <NavBar />
          <AlertBox message={"Success can't be taken "}/>
          <div className='container my-3'>
            <Routes>
              <Route exact path='/home' element={<Home homeHeading={"This is Home"} />} />
              <Route exact path='/about' element={<About title={"This is about page"} />} />
            </Routes>
          </div>
        </Router>
      </Notestate>
    </>
  );
}

export default App;
