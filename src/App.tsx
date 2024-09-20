import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";
import { Header } from "./Header.tsx";
import { SendTx } from "./SendTx.tsx";
import { useEffect, useState } from "react";
import WebAppSDK from '@twa-dev/sdk';
import './App.css';

declare global {
  interface Window {
    Telegram?: any;
  }
}

function App() {
  const [isTg, setIsTg] = useState<boolean>(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(0.1); 
  const [, setBalance] = useState<number | null>(null);
  const [address, setAddress] = useState<string>(''); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const isTgCheck = Boolean(window.Telegram?.WebApp?.initData);
    if (isTgCheck) {
      WebAppSDK.ready();
      WebAppSDK.enableClosingConfirmation();
      WebAppSDK.expand();
      WebAppSDK.headerColor = "#f85717";
      setIsTg(true);
    }
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (value >= 0.1 && value <= 2) {
      setSelectedAmount(value);
      setError(null); 
    } else {
      setError('Value must be between 0.1 and 2 TON');
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSelectedAmount(value);
    setError(null); 
  };

  return (
    <>
      {!isTg ? (
        <div className="denied-container">
          Access denied. Please open in Telegram.
        </div>
      ) : (
        <div className="tg-container">
          <TonConnectUIProvider
            manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json"
            uiPreferences={{
              borderRadius: "m",
              colorsSet: {
                [THEME.LIGHT]: {
                  connectButton: {
                    background: "#2191d1",
                  },
                  accent: "#2191d1",
                  telegramButton: "#2191d1",
                  background: {
                    qr: "#ffffff",
                    tint: "#2191d1",
                    primary: "#2191d1",
                    secondary: "#ffffff",
                    segment: "#2191d1",
                  },
                  text: {
                    primary: "#ffffff",
                    secondary: "#ffffff",
                  },
                },
              },
            }}
            actionsConfiguration={{
              modals: "all",
              notifications: ["error"],
              twaReturnUrl: "https://t.me/TestMangoPresaleBot/Sale",
            }}
          >
            <Header setBalance={setBalance} setAddress={setAddress} />
            <SendTx selectedAmount={selectedAmount} connectedAddress={address} />
          </TonConnectUIProvider>

          <div className="texts-main">
            <h1 className="first-t">$MANGO Presale</h1>
            <h2 className="second-t">Testnet</h2>

            <div className="input-container">
              <input
                type="number"
                className={`styled-input ${error ? 'error' : ''}`} 
                value={selectedAmount ?? ''}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                min="0.1"
                max="2"
                step="0.01"
              />
              {error && <p className="error-message">{error}</p>} {/* Show error message */}
            </div>

            <div className="slider-container">
              <input
                type="range"
                className="slider"
                min="0.1"
                max="2"
                step="0.01"
                value={selectedAmount ?? 0.1}
                onChange={handleSliderChange}
              />
            </div>

            <div className="links-container">
              {/* <h3>
                <a className="link">Your Share: ~</a>
              </h3>
              <h3>
                <a className="link">Getting Jetton: ~</a>
              </h3> */}
              <h3>
                <a href="https://testnet.getgems.io/collection/kQAGpsRVIcQgmHmFIATRZ8RKAg_Qguk6hnBhBrQTuZYaMGm2" className="link">View Participants</a>
              </h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
