import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";
import { Header } from "./Header.tsx";
import { SendTx } from "./SendTx.tsx";
import { useEffect, useState } from "react";
import WebAppSDK from '@twa-dev/sdk';
import './App.css';
import { getJettonBalance } from './tonapi';

declare global {
  interface Window {
    Telegram?: any;
  }
}

function App() {
  const [isTg, setIsTg] = useState<boolean>(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const jettonAddress = '0:ca1fae2684c9bfd7d83053d5735df19780c1260f3daf338b150084c42b6ab473'; 

  useEffect(() => {
    const isTgCheck = Boolean(window.Telegram?.WebApp?.initData);

    if (isTgCheck) {
      WebAppSDK.ready();
      WebAppSDK.enableClosingConfirmation();
      WebAppSDK.expand();
      WebAppSDK.headerColor = "#ffffff";
      setIsTg(true);
    }
  }, []);

  const handleMiniButtonClick = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleUpdateBalance = () => {
    if (window.Telegram?.WebApp?.initData) {
      const address = window.Telegram.WebApp.initData;
      getJettonBalance(address, jettonAddress)
        .then(balance => setBalance(balance))
        .catch(error => console.error('Error fetching balance:', error));
    }
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
              twaReturnUrl: "https://t.me/TestJettonLotteryBot/Start",
            }}
          >
            <Header setBalance={setBalance} />
            <SendTx selectedAmount={selectedAmount} />
          </TonConnectUIProvider>

          <div className="texts-main">
            <h1 className="first-t">Jetton Lottery</h1>
            <h2 className="second-t">Testnet</h2>
            <input type="number" className="styled-input" value={selectedAmount ?? ''} readOnly />
            <div className="button-group">
              <button className="mini-btn" onClick={() => handleMiniButtonClick(100)}>100</button>
              <button className="mini-btn" onClick={() => handleMiniButtonClick(250)}>250</button>
              <button className="mini-btn" onClick={() => handleMiniButtonClick(500)}>500</button>
            </div>
            <div className="styled-input2-container">
              <input
                type="text"
                className="styled-input2"
                value={`$USDT: ${balance !== null ? balance : '~'}`}
                readOnly
              />
              <button className="update-btn" onClick={handleUpdateBalance}>🔄</button>
            </div>
            <div className="links-container">
              <h3>
                <a href="https://t.me/testgiver_ton_bot" className="link">Testnet TON</a>
              </h3>
              <h3>
                <a href="https://testnet.tonviewer.com/kQDSWPjYMkGidIqVUA6FpjuykW1YjAV-U3TtR2F2rDXqjNLc" className="link">Giver Contract</a>
              </h3>
              <h3>
                <a href="https://testnet.tonviewer.com/kQBDXDfzKQPIO4xTfAXwLYGbwxynC6WQMnRcp08gkTMHmKZR" className="link">Lottery Contract</a>
              </h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
