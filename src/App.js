import React, { useEffect, useState, useRef } from "react";
import { WiredButton, WiredCard, WiredInput } from "wired-elements-react";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import generatePasswords from './libs/password-ga';

import "./App.css";

function App() {
  const boxCard = useRef({});
  const textInput = useRef({});
  const [password, setPassword] = useState([]);
  const [passwordLoaded, setPasswordLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const reGenerate = async () => {
    setPasswordLoaded(false);
    setCopied(false);
    const res = await generatePasswords({});
    if (res.length) {
      setPassword(res[0]);
      setPasswordLoaded(true);
      textInput.current.value = res[0];
    }
    boxCard.current.requestUpdate();
  }

  useEffect(() => {
    (async () => {
      await reGenerate();
    })();
  }, []);

  return (
    <main>
      <WiredCard elevation={3} ref={boxCard}>
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
          <WiredButton elevation={2} onClick={() => reGenerate()}>
            Re-Gen
          </WiredButton>
          </section>
          <section>
            <CopyToClipboard text={password}
              onCopy={() => setCopied(true)}>
              <WiredButton className="btn-copy" elevation={2}>
                Copy
              </WiredButton>
            </CopyToClipboard>
            <div className="copied">{copied ? "copied" : ""}</div>
          </section>
          </>
        )}
      </WiredCard>
    </main>
  );
}

export default App;
