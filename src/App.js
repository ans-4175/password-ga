import React, { useEffect, useState, useRef } from "react";
import { WiredButton, WiredCard, WiredInput } from "wired-elements-react";
import generatePasswords from "./libs/password-ga";

import "./App.css";

function App() {
  let textInput = useRef({});
  const [password, setPassword] = useState([]);
  const [passwordLoaded, setPasswordLoaded] = useState(false);

  // function handleClick(text) {
  //   // window.alert(`Hello ${textInput.current.value}!`);
  // }

  useEffect(() => {
    (async () => {
      setPasswordLoaded(false);
      let res = await generatePasswords({});
      if (res.length) {
        setPassword(res[0]);
        setPasswordLoaded(true);
      }
    })();
  }, []);

  return (
    <main>
      <WiredCard elevation={3}>
        <h1>Password Generator</h1>
        {!passwordLoaded ? 
        (<p>Loading</p>) : (
          <>
          <section>
          <WiredInput
            disabled={true}
            placeholder="password here"
            value={password}
            ref={textInput}
          />
          {/* <WiredButton elevation={2} onClick={handleClick('generate')}>
            Re-Gen
          </WiredButton> */}
          </section>
          <section>
            <WiredButton class="btn-copy" elevation={2}>
              Copy
            </WiredButton>          
          </section>
          </>
        )}
      </WiredCard>
    </main>
  );
}

export default App;
