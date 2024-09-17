import {
    SendTransactionRequest,
    useIsConnectionRestored,
    useTonConnectModal,
    useTonConnectUI,
    useTonWallet
} from "@tonconnect/ui-react";
import {Address, beginCell, Cell, toNano} from "@ton/core";
import {getJettonWalletAddress, waitForTx} from "./tonapi.ts";
import {useState} from "react";
import {USDT} from "./constants.ts";
import './App.css';

interface SendTxProps {
  selectedAmount: number | null;
}

export const SendTx = ({ selectedAmount }: SendTxProps) => {
    const wallet = useTonWallet();
    const isRestored = useIsConnectionRestored();
    const { open } = useTonConnectModal();
    const [tonConnectUi] = useTonConnectUI();
    const [txInProgress, setTxInProgress] = useState<'none' | 'jetton' | 'giver'>('none');

    const onSendJettonLottery = async () => {
        if (selectedAmount === null || !wallet) {
            console.error('No amount selected or wallet is not connected');
            return;
        }
       
        setTxInProgress('jetton');
    
        try {
            const jwAddress = await getJettonWalletAddress(USDT.toRawString(), wallet!.account.address);
            const smcAddress = Address.parse("kQBDXDfzKQPIO4xTfAXwLYGbwxynC6WQMnRcp08gkTMHmKZR");
            const decimals = 6;

            const innerPayload = beginCell()
                .storeUint(0xfbf0ec9b, 32) 
                .endCell();
    
            const jwPayload = beginCell()
                .storeUint(0xf8a7ea5, 32)
                .storeUint(0, 64)
                .storeCoins(selectedAmount * 10**decimals)
                .storeAddress(smcAddress)
                .storeUint(0, 2) // response address -- null
                .storeUint(0, 1)
                .storeCoins(toNano("0.1"))
                .storeBit(1)
                .storeRef(innerPayload)
                .endCell()
    
            const payload = jwPayload.toBoc().toString('base64');
    
            const tx: SendTransactionRequest = {
                validUntil: Math.round(Date.now() / 1000) + 60 * 5,
                messages: [
                    {
                        address: jwAddress.toString(),
                        amount: "155000000", 
                        payload
                    }
                ]
            };
            
            const result = await tonConnectUi.sendTransaction(tx, {
                modals: 'all',
                notifications: ['error']
            });
    
            const imMsgCell = Cell.fromBase64(result.boc);
            const inMsgHash = imMsgCell.hash().toString('hex');
    
            try {
                const tx = await waitForTx(inMsgHash);
                console.log(tx);
            } catch (e) {
                console.error('Error waiting for transaction:', e);
            }
        } catch (e) {
            console.error('Error sending transaction:', e);
        } finally {
            setTxInProgress('none');
        }
    };

    const onSendGiver = async () => {
        if (!wallet) {
            console.error('Wallet is not connected');
            open();
            return;
        }
       
        setTxInProgress('giver');
    
        try {
            const payloadCell = beginCell()
                .storeUint(0xeae698e4, 32) 
                .storeUint(123, 64) 
                .endCell();
    
            const payload = payloadCell.toBoc().toString('base64');
    
            const tx: SendTransactionRequest = {
                validUntil: Math.round(Date.now() / 1000) + 60 * 5,
                messages: [
                    {
                        address: "kQDSWPjYMkGidIqVUA6FpjuykW1YjAV-U3TtR2F2rDXqjNLc",
                        amount: "55000000", 
                        payload
                    }
                ]
            };
            
            const result = await tonConnectUi.sendTransaction(tx, {
                modals: 'all',
                notifications: ['error']
            });
    
            const imMsgCell = Cell.fromBase64(result.boc);
            const inMsgHash = imMsgCell.hash().toString('hex');
    
            try {
                const tx = await waitForTx(inMsgHash);
                console.log(tx);
            } catch (e) {
                console.error('Error waiting for transaction:', e);
            }
        } catch (e) {
            console.error('Error sending transaction:', e);
        } finally {
            setTxInProgress('none');
        }
    };

    if (!isRestored) {
        // return 'Loading...';
    }

    if (!wallet) {
        // return <button onClick={open}>Connect wallet</button>
    }

    return (
        <div>
            <div className="button-container">
                <button
                    className="get-btn"
                    onClick={onSendGiver}
                    disabled={txInProgress !== 'none'}
                >
                    {txInProgress === 'giver' ? 'Tx in progress...' : 'Get 2000 $USDT (fake)'}
                </button>
                <button
                    className="get-btn"
                    onClick={onSendJettonLottery}
                    disabled={selectedAmount === null || txInProgress !== 'none'}
                >
                    {txInProgress === 'jetton' ? 'Tx in progress...' : '🎰 Send $USDT 💸'}
                </button>
            </div>
        </div>
    );
};
