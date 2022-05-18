import './App.css';
import { useEffect } from 'react';
import { useJson } from './hooks';

const Data = () => {
  const BASE_URL = 'https://pokeapi.co/api/v2/pokemon/pikachu';
  const { response, setUrl } = useJson();

  useEffect(() => {
      setUrl(BASE_URL)
  }, [setUrl])

  return (<>
    {JSON.stringify(response)}
  </>)
}

const App = () => {
  return (
    <div className="App">
      <p>Hello world</p>
      {/* <Data /> */}
    </div>
  );
}

export default App;
