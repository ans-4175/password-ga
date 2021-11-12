import React, { useEffect, useState, useRef } from 'react';
import {
  WiredButton,
  WiredCard,
  WiredInput,
  WiredLink,
  WiredToggle
} from 'wired-elements-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import generateAcak from './libs/password-ga';
import generateKata from './libs/password-ga-kata';
import { demutatePassword } from './libs/common';

import './App.css';

// When appended with an additional query parameter &phrase={word},
// it will open a page containing the word's type and meaning.
const KATEGLO_WORD_BASE_URL = 'http://kateglo.com/?mod=dictionary&action=view';

function App() {
  const boxCard = useRef({});
  const textInput = useRef({});
  const [password, setPassword] = useState('');
  const [passwordLoaded, setPasswordLoaded] = useState(false);
  // The idea of showing pronunciations comes from the original idea of this app,
  // which is to make randomized password easier to pronounce. When the randomized
  // password is composed of "noun" + "adjective", then we will also give it link
  // to kateglo, using the `KATEGLO_WORD_BASE_URL` variable.
  //
  // The type of this state is Array<{ word: string; href?: string }>.
  // The `href` field is only be defined when we are generating password of noun + adjective.
  const [pronunciations, setPronunciations] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isKata, setIsKata] = useState(false);

  const reGenerate = async (isGenerateKata) => {
    setPasswordLoaded(false);
    const generateFunction = isGenerateKata ? generateKata : generateAcak;
    const res = await generateFunction({});
    if (res.length) {
      let newPassword = '';
      let newPronunciations = [];

      // Different behavior is needed for random letters and random words.
      // For random words, we need to "separate" the noun and adjective
      // before demutating, so that we can add a space between them.
      if (isGenerateKata) {
        const [mutatedNoun, mutatedAdjective] = res;
        const demutatedNoun = demutatePassword(mutatedNoun);
        const demutatedAdjective = demutatePassword(mutatedAdjective);

        newPassword = `${mutatedNoun}${mutatedAdjective}`;
        newPronunciations = [
          {
            word: demutatedNoun,
            href: `${KATEGLO_WORD_BASE_URL}&phrase=${demutatedNoun}`
          },
          {
            word: demutatedAdjective,
            href: `${KATEGLO_WORD_BASE_URL}&phrase=${demutatedAdjective}`
          }
        ];
      } else {
        newPassword = res[0];
        newPronunciations = [{ word: demutatePassword(newPassword) }];
      }

      setPassword(newPassword);
      setPronunciations(newPronunciations);
      setPasswordLoaded(true);
      textInput.current.value = newPassword;
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
              <div className="pronunciation">
                <span className="pronunciation-label">Pelafalan: </span>

                <div className="pronunciation-values">
                  {pronunciations.map((pronunciation) => (
                    <Pronunciation {...pronunciation} />
                  ))}
                </div>
              </div>
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
            <div className="foot-notes">
              Copyright @ans4175 &amp; @ajiballinst{' '}
            </div>
          </>
        )}
      </WiredCard>
    </main>
  );
}

export default App;

// Composing components.
function Pronunciation({ word, href }) {
  if (href === undefined) {
    // Early return the word only when there is no `href`.
    return word;
  }

  return (
    // We want to "pertain" the current state, so we open it in a new tab.
    // Source: https://css-tricks.com/use-target_blank/#a-good-reason-the-user-is-working-on-something-on-the-page-that-might-be-lost-if-the-current-page-changed.
    <WiredLink href={href} target="_blank" rel="noopener">
      {word}
    </WiredLink>
  );
}
