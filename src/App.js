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
import { demutatePassword } from './libs/mutation-common';

const PICKED_PASSWORD_COUNT = 1;

function App() {
  const boxCard = useRef({});
  const textInput = useRef({});
  const [password, setPassword] = useState('');
  const [passwordLoaded, setPasswordLoaded] = useState(false);
  const [pronounciation, setPronounciation] = useState('');
  const [copied, setCopied] = useState(false);
  const [isKata, setIsKata] = useState(false);

  const reGenerate = async (isGenerateKata) => {
    setPasswordLoaded(false);
    const generateFunction = isGenerateKata ? generateKata : generateAcak;
    const res = await generateFunction({ pickCount: PICKED_PASSWORD_COUNT });
    if (res.length) {
      let password = '';
      let pronounciation = '';

      if (isGenerateKata) {
        const [mutatedNoun, mutatedAdjective] = res;
        password = `${mutatedNoun}${mutatedAdjective}`;
        pronounciation = `${demutatePassword(mutatedNoun)} ${demutatePassword(
          mutatedAdjective
        )}`;
      } else {
        password = res[0];
        pronounciation = demutatePassword(password);
      }

      setPassword(password);
      setPronounciation(pronounciation.toLowerCase());
      setPasswordLoaded(true);
      textInput.current.value = password;
    }
    boxCard.current.requestUpdate();
  };

  const changeGenerator = async (isRight) => {
    setIsKata(isRight ? true : false);
  };

  const onCopyPassword = () => {
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  useEffect(() => {
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
              <div>{pronounciation}</div>
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
