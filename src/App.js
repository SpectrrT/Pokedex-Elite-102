import './App.css';
import { useJson } from './hooks';
import React, {useState} from "react"

const Data = ({ pokemonChar }) => {
  const BASE_URL = `https://pokeapi.co/api/v2/pokemon/${pokemonChar}`;
  const { response, error } = useJson(BASE_URL);
  console.warn(error)
  return (<>
    {pokemonChar && JSON.stringify(response)}
  </>)
}

const App = () => {
  const [userInput, setUserInput] = useState("")
  const [submitValue, setSubmitValue] = useState("")
  const handleChange = (event) => {
    setUserInput(event.target.value)
  }
  const handleSubmit = (event) => {
    event.preventDefault();
   // alert(`The Pokemon you entered was: ${userInput}`)
    setSubmitValue(userInput)
  }
  
  return (
    <div className="App">
      <p>Pokedex</p>
      <form onSubmit={handleSubmit}>
        <label>
          Pokemon Name:
          <input type="text" name="name" onChange={handleChange} value={userInput}/>
        </label>
        <input type="submit" value="Submit" />
      </form>
      <Data pokemonChar={submitValue}/>
    </div>
  );
}

export default App;
