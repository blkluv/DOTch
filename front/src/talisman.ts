import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';

const APP_NAME = 'DOTch Auction';

export class TalismanWallet {
  private api: ApiPromise | null = null;
  private accounts: any[] = [];
  private selectedAccount: any = null;

  // Connect to Polkadot node
  async connectApi(): Promise<ApiPromise> {
    if (this.api) {
      return this.api;
    }

    const provider = new WsProvider('wss://westend-asset-hub-rpc.polkadot.io');
    this.api = await ApiPromise.create({ provider });
    return this.api;
  }

  // Connect Talisman wallet
  async connectWallet(): Promise<boolean> {
    try {
      // Enable Talisman extension
      const extensions = await web3Enable(APP_NAME);
      
      if (extensions.length === 0) {
        throw new Error('Talisman wallet not found. Please install it.');
      }

      // Get accounts from Talisman
      this.accounts = await web3Accounts();
      
      if (this.accounts.length > 0) {
        this.selectedAccount = this.accounts[0];
        return true;
      } else {
        throw new Error('No accounts found in Talisman.');
      }
    } catch (error) {
      console.error('Talisman connection error:', error);
      throw error;
    }
  }

  // Get accounts
  getAccounts(): any[] {
    return this.accounts;
  }

  // Get selected account
  getSelectedAccount(): any {
    return this.selectedAccount;
  }

  // Switch account
  switchAccount(account: any): void {
    this.selectedAccount = account;
  }

  // Get injector for signing transactions
  async getInjector() {
    if (!this.selectedAccount) {
      throw new Error('No account selected');
    }
    return await web3FromAddress(this.selectedAccount.address);
  }

  // Get API instance
  getApi(): ApiPromise | null {
    return this.api;
  }

  // Disconnect
  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
    this.accounts = [];
    this.selectedAccount = null;
  }
}

// Export a singleton instance
export const talismanWallet = new TalismanWallet();