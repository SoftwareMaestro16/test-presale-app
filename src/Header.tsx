import { useEffect } from "react";
import { CHAIN, TonConnectButton, useTonWallet, toUserFriendlyAddress } from "@tonconnect/ui-react";
import "./App.css";
import { getJettonBalance } from './tonapi';

interface HeaderProps {
    setBalance: (balance: number | null) => void;
    setAddress: (address: string) => void; 
}

export const Header = ({ setBalance, setAddress }: HeaderProps) => {
    const wallet = useTonWallet();
    const jettonAddress = 'kQBpqkbPrhSjleAQ8W9TJpZBj6K3GKijCH-Uz_6H7UnaqVTI'; 

    useEffect(() => {
        if (wallet) {
            const address = toUserFriendlyAddress(wallet.account.address, wallet.account.chain === CHAIN.TESTNET);
            console.log('Connected wallet address:', address);

            setAddress(address); 
            getJettonBalance(address, jettonAddress)
                .then(balance => setBalance(balance))
                .catch(error => console.error('Error fetching balance:', error));
        }
    }, [wallet, setBalance, setAddress]);

    return (
        <div className="header">
            <TonConnectButton />
        </div>
    );
};
