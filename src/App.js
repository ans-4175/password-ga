import React, { useEffect, useState, useRef } from 'react';
import {
  WiredButton,
  WiredCard,
  WiredInput,
  WiredToggle
} from 'wired-elements-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import generateAcak from './libs/password-ga';
import generateKata from './libs/password-ga-kata';

import './App.css';

function App() {
  const boxCard = useRef({});
  const textInput = useRef({});
  const [password, setPassword] = useState([]);
  const [passwordLoaded, setPasswordLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isKata, setIsKata] = useState(false);

  const reGenerate = async () => {
    setPasswordLoaded(false);
    setCopied(false);
    const generateFunction = isKata ? generateKata : generateAcak;
    const res = await generateFunction({});
    if (res.length) {
      setPassword(res[0]);
      setPasswordLoaded(true);
      textInput.current.value = res[0];
    }
    boxCard.current.requestUpdate();
  };

  const changeGenerator = (isRight) => {
    setIsKata(isRight ? true : false);
  };

  useEffect(() => {
    reGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main>
      <WiredCard elevation={3} ref={boxCard}>
        <h1>Password Generator</h1>
        {!passwordLoaded ? (
          <p>Loading</p>
        ) : (
          <>
            <section>
              <span className="toggle-kata">kata acak</span>
              <WiredToggle
                checked={isKata}
                onChange={(e) => changeGenerator(e.detail.checked)}
              />
              <span className="toggle-kata">kata benda</span>
              <div className="toggle-notes">{isKata ? 'beta version' : ''}</div>
            </section>
            <section>
              <WiredInput
                disabled={true}
                placeholder="password here"
                value={password}
                ref={textInput}
              />
              <div className="copied">{copied ? 'copied' : ''}</div>
            </section>
            <section>
              <WiredButton elevation={2} onClick={() => reGenerate()}>
                Re-Gen
              </WiredButton>
              <CopyToClipboard text={password} onCopy={() => setCopied(true)}>
                <WiredButton className="btn-copy" elevation={2}>
                  Copy
                </WiredButton>
              </CopyToClipboard>
            </section>
            <div className="foot-notes">Copyright @ans4175</div>
          </>
        )}
      </WiredCard>
    </main>
  );
}

export default App;
