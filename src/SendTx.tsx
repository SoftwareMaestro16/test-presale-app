import {
    SendTransactionRequest,
    useTonConnectModal,
    useTonConnectUI,
    useTonWallet
  } from "@tonconnect/ui-react";
  import { Address, beginCell, Cell, toNano } from "@ton/core";
  import { waitForTx } from "./tonapi.ts";
  import { useState } from "react";
  import './App.css';
  
  interface SendTxProps {
    selectedAmount: number | null;
    connectedAddress: string;  // добавляем адрес из Header
}

export const SendTx = ({ selectedAmount, connectedAddress }: SendTxProps) => {
    const wallet = useTonWallet();
    const { open } = useTonConnectModal();
    const [tonConnectUi] = useTonConnectUI();
    const [txInProgress, setTxInProgress] = useState<'none' | 'jetton' | 'claim'>('none');
    const [, setResultUrl] = useState<string | null>(null);
  
    const uploadJsonToIPFS = async (jsonData: any) => {
      const jsonString = JSON.stringify(jsonData);
      try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2YzQ0MjFhMC1hMzJmLTQ1YzgtYTljOS0yYTRiZWI0MmJlYmYiLCJlbWFpbCI6ImRhbmlpbHNjaGVyYmFrb3YxMzM3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5NGFhMTA1YjVmNjAyYWRiOTFmZiIsInNjb3BlZEtleVNlY3JldCI6ImI3MTA1YzJhOGI5MDM3MGFmY2U0M2M2MzU5Njc0YzcxMzc3ODZkNmM1ZDM1NDcyZjM1MWEzZDBlY2NlZDAxNjEiLCJleHAiOjE3NTQwNjkzMTB9.D5MN0ejg39UT4kEWP8H9h1CumqPnayqtHNr6bf48qE4', // Replace with your actual API key
            'Content-Type': 'application/json'
          },
          body: jsonString
        });
        const result = await response.json();
        const ipfsHash = result.IpfsHash;
        const gatewayUrl = 'moccasin-recent-earthworm-890.mypinata.cloud'; 
        const url = `https://${gatewayUrl}/ipfs/${ipfsHash}`;
        setResultUrl(url);
        console.log('IPFS URL:', url);
        return url; // Return the URL for further use
      } catch (error) {
        console.error('Error uploading JSON:', error);
        throw error; // Rethrow to handle it in the calling function
      }
    };
  
    const onSendParticipate = async () => {
      if (!wallet) {
        console.error('Wallet is not connected');
        return;
      }
  
      setTxInProgress("jetton");
      console.log('Connected: ', connectedAddress);
      
  
      try {
        const ownerAddress = Address.parse(connectedAddress);
        const tokenValue = selectedAmount ? selectedAmount * Math.pow(10, 9) : 0;
  
        const jsonData = {
          name: "$MANGO Private Sale",
          description: "Proof of Participation in the Presale.",
          buttons: [
            {
              label: "Tasty Mango.",
              uri: "https://t.me/TestMangoPresaleBot/Sale"
            }
          ],
          attributes: [
            {
              trait_type: "TON 💎",
              value: (tokenValue / 10**9).toString(),
            },
            {
              trait_type: "$MANGO 🥭",
              value: ((tokenValue * 20) / 10**9).toString(),
            },
          ],
          image: "https://softwaremaestro16.github.io/nft_collection/folder_for_mango/SbtMango.jpg",
        };
  
        // Upload JSON to IPFS and wait for the URL
        const ipfsUrl = await uploadJsonToIPFS(jsonData);
  
        const payloadCell = beginCell()
            .storeUint(0xd02b138, 32) // op 1
            .storeUint(123, 64) // query
            .storeCoins(toNano(0.05))
            .storeRef(beginCell()
                .storeAddress(ownerAddress)
                .storeRef(
                    beginCell().storeStringTail(ipfsUrl).endCell()
                )
                .storeAddress(ownerAddress)
                .endCell()
            )
            .endCell();
  
        const payload = payloadCell.toBoc().toString('base64');
  
        const tx: SendTransactionRequest = {
            validUntil: Math.round(Date.now() / 1000) + 60 * 5,
            messages: [
                {
                    address: "kQAGpsRVIcQgmHmFIATRZ8RKAg_Qguk6hnBhBrQTuZYaMGm2",
                    amount: tokenValue.toString(),
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
        console.error('Error during transaction:', e);
      } finally {
        setTxInProgress("none");
      }
    };
  
    const onSendClaim = async () => {
        if (!wallet) {
            console.error('Wallet is not connected');
            open();
            return;
        }
       
        setTxInProgress("claim");
    
        try {

            const payloadCell = beginCell()
                .storeUint(0xa769de27, 32) 
                .storeUint(123, 64) 
                .endCell();
    
            const payload = payloadCell.toBoc().toString('base64');
    
            const tx: SendTransactionRequest = {
                validUntil: Math.round(Date.now() / 1000) + 60 * 5,
                messages: [
                    {
                        address: "kQAGpsRVIcQgmHmFIATRZ8RKAg_Qguk6hnBhBrQTuZYaMGm2",
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
            setTxInProgress("none");
        }
    };
  
    return (
      <div>
        <div className="button-container">
          <button
            className="get-btn"
            onClick={onSendParticipate}
            disabled={selectedAmount === null || txInProgress !== 'none'}
          >
            {txInProgress === 'jetton' ? 'Tx in progress...' : 'Send TON 💎'}
          </button>
          <button
            className="get-btn"
            onClick={onSendClaim}
            disabled={txInProgress !== 'none'}
          >
            {txInProgress === 'claim' ? 'Tx in progress...' : 'Claim $MANGO 🥭'}
          </button>
        </div>
        {/* {resultUrl && <p>IPFS URL: <a href={resultUrl} target="_blank" rel="noopener noreferrer">{resultUrl}</a></p>} */}
      </div>
    );
  };
  