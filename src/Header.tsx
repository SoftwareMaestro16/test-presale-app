import { useEffect } from "react";
import { CHAIN, TonConnectButton, useTonWallet, toUserFriendlyAddress } from "@tonconnect/ui-react";
import "./App.css";
import { getJettonBalance } from './tonapi';

interface HeaderProps {
    setBalance: (balance: number | null) => void;
}

export const Header = ({ setBalance }: HeaderProps) => {
    const wallet = useTonWallet();
    const jettonAddress = '0:ca1fae2684c9bfd7d83053d5735df19780c1260f3daf338b150084c42b6ab473'; // Replace with your jetton address

    useEffect(() => {
        if (wallet) {
            const address = toUserFriendlyAddress(wallet.account.address, wallet.account.chain === CHAIN.TESTNET);
            console.log('Connected wallet address:', address);

            getJettonBalance(address, jettonAddress)
                .then(balance => setBalance(balance))
                .catch(error => console.error('Error fetching balance:', error));
        }
    }, [wallet, setBalance]);

    return (
        <div className="header">
            <TonConnectButton />
        </div>
    );
};
