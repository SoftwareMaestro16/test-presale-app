import { Api, HttpClient } from "@ton-api/client";

const httpClient = new HttpClient({
    baseUrl: 'https://testnet.tonapi.io',
    baseApiParams: {
        headers: {
            Authorization: `Bearer AGI2S5NMZM573CAAAAAA7H6N3CDNHKCHIKNBGJ3D2RSAJPHJCDZ2R3VZPGGMIAOSEEZ4CGI`,
            'Content-type': 'application/json'
        }
    }
});

export const tonapi = new Api(httpClient);

export async function waitForTx(msgHash: string, attempt = 0) {
    try {
        return await tonapi.blockchain.getBlockchainTransactionByMessageHash(msgHash);
    } catch (e) {
        if (attempt >= 10) {
            throw e;
        }

        await new Promise(resolve => setTimeout(resolve, 1500));

        return waitForTx(msgHash, attempt + 1);
    }
}

export async function getJettonWalletAddress(jettonMasterAddress: string, walletAddress: string) {
    const result = await tonapi.blockchain.execGetMethodForBlockchainAccount(jettonMasterAddress, 'get_wallet_address', {
        args: [walletAddress]
    });

    return result.decoded.jetton_wallet_address;
}

export async function getJettonBalance(connectedAddress: string, jettonAddress: string) {
    const url = `https://testnet.tonapi.io/v2/accounts/${connectedAddress}/jettons/${jettonAddress}?currencies=ton,usd,rub&supported_extensions=custom_payload`;

    console.log(`Fetching balance from URL: ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer AGI2S5NMZM573CAAAAAA7H6N3CDNHKCHIKNBGJ3D2RSAJPHJCDZ2R3VZPGGMIAOSEEZ4CGI`,
                'Content-type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching balance: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API response:', data); 
        
        const balance = parseFloat(data.balance);
        const humanReadableBalance = balance / Math.pow(10, 6); 
        console.log(humanReadableBalance);
        
        return humanReadableBalance;
    } catch (error) {
        console.error('Failed to fetch jetton balance:', error);
        throw error;
    }
}
