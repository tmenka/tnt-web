"use client";

import { useState } from "react";

export default function Homepage() {
  const [x, setX] = useState<number>(0); // Set initial value for x
  const [y, setY] = useState<number>(0); // Set initial value for y
  const [result, setResult] = useState<number | null>(null);

  const handleChangeX = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update x state with the parsed integer value of the input
    setX(parseInt(event.target.value));
  };

  const handleChangeY = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update y state with the parsed integer value of the input
    setY(parseInt(event.target.value));
  };

  const Addition = () => {
    setResult (x+y);
  }

  return (
    <div className="h-screen w-screen">
      <div className="flex justify-center items-center text-center">
        <h1 className="text-green-500 text-3xl">TONKO PEDER</h1>
      </div>
      <div>
        <p className="text-blue-500 text-5xl">Livaja ima malog pisu</p>
      </div>
      <div>
        <label htmlFor="numberInput_X">Enter a number for X:</label>
        <input
          type="number"
          id="numberInput_X"
          value={x}
          onChange={handleChangeX}
        />
        <p>You entered for X: {x}</p>
      </div>
      <div>
        <label htmlFor="numberInput_Y">Enter a number for Y:</label>
        <input
          type="number"
          id="numberInput_Y"
          value={y}
          onChange={handleChangeY}
        />
        <p>You entered for Y: {y}</p>
      </div>
      <div>
        <button onClick={Addition}>Zbroji</button>
        {result !== null && <p>Result: {result}</p>}
      </div>
    </div>
  );
}