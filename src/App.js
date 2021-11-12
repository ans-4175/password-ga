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
import { demutatePassword } from './libs/common';

import './App.css';

function App() {
  const boxCard = useRef({});
  const textInput = useRef({});
  const [password, setPassword] = useState('');
  const [passwordLoaded, setPasswordLoaded] = useState(false);
  const [pronunciation, setPronunciation] = useState('');
  const [copied, setCopied] = useState(false);
  const [isKata, setIsKata] = useState(false);

  const reGenerate = async (isGenerateKata) => {
    setPasswordLoaded(false);
    const generateFunction = isGenerateKata ? generateKata : generateAcak;
    const res = await generateFunction({});
    if (res.length) {
      let password = '';
      let pronunciation = '';

      // Different behavior is needed for random letters and random words.
      // For random words, we need to "separate" the noun and adjective
      // before demutating, so that we can add a space between them.
      if (isGenerateKata) {
        const [mutatedNoun, mutatedAdjective] = res;
        password = `${mutatedNoun}${mutatedAdjective}`;
        pronunciation = `${demutatePassword(mutatedNoun)} ${demutatePassword(
          mutatedAdjective
        )}`;
      } else {
        password = res[0];
        pronunciation = demutatePassword(password);
      }

      setPassword(password);
      setPronunciation(pronunciation.toLowerCase());
      setPasswordLoaded(true);
      textInput.current.value = password;
    }
    boxCard.current.requestUpdate();
  };

  const changeGenerator = (isRight) => {
    setIsKata(isRight);
  };

  const onCopyPassword = () => {
    setCopied(true);

    // Set 2 seconds timeout before the button goes back to "Copy" from "Copied!".
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  useEffect(() => {
    // Automatically regenerate password when the toggle changes.
    reGenerate(isKata);
  }, [isKata]);

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
              <div>{pronunciation}</div>
            </section>
            <section>
              <WiredButton elevation={2} onClick={() => reGenerate(isKata)}>
                Re-Gen
              </WiredButton>
              <CopyToClipboard text={password} onCopy={onCopyPassword}>
                <WiredButton className="btn-copy" elevation={2}>
                  {copied ? 'Copied!' : 'Copy'}
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
