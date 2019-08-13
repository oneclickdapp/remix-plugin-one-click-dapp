import { LitElement, html, customElement } from 'lit-element';
import axios from 'axios'
import { createIframeClient } from './client';
import {
  remixApi,
  CompilationFileSources,
  CompilationResult,
  Status
} from './utils';
import { createDoc } from './ethdoc';

const ONE_CLICK_DAPP_URL="https://oneclickdapp.com"

interface ContractMap {
  [contractName: string]: string;
}

interface InterfaceMap {
  [name: string]: string;
}

@customElement('eth-doc')
export class EthdocComponent extends LitElement {
  /** client to communicate with the IDE */
  private client = createIframeClient();
  private docs: ContractMap = {};
  private docAlerts: any = {};
  private dapps: InterfaceMap = {};

  constructor() {
    super();
    this.init();
  }

  async init() {
    await this.client.onload();
    this.client.solidity.on(
      'compilationFinished',
      (
        file: string,
        src: CompilationFileSources,
        version: string,
        result: CompilationResult
      ) => {
        if (!result) return;
        this.docs = createDoc(result);
        const status: Status = {
          key: 'succeed',
          type: 'success',
          title: 'New interface generated'
        };
        this.client.emit('statusChanged', status);
        this.requestUpdate();
      }
    );
  }

  /** ⚠️ If you're using LitElement you should disable Shadow Root ⚠️ */
  createRenderRoot() {
    return this;
  }

  /** Use One Click Dapp API to generate an interface */
  async generateInterface() {
    try {
      this.client.emit('statusChanged', { key: 'loading', type: 'info', title: 'Generating ...' })
      axios
        .post(`${ONE_CLICK_DAPP_URL}/contracts`, {
          contractName: "remix d-d-dapp",
          contractAddress: "0xabc",
          abi: this.docs[0],
          network: "unknown",
          creatorAddress: 'remix-plugin'
        })
        .then(res => {
            this.dapps['remix d-d-dapp'] = res.data.mnemonic;
        })
        .catch(err => {
          throw(err.message);
        });

      this.showAlert();
      setTimeout(() => {
        this.client.emit('statusChanged', { key: 'none' })
      }, 10000)
    } catch (err) {
      this.showAlert(err);
    }
  }

  showAlert(err?: string) {
    if (!err) {
      const message = `New interface generated!`;
      this.docAlerts = { message, type: 'success' };
    } else {
      const message = `Interface was not generated : ${err}`;
      this.docAlerts = { message, type: 'warning' };
    }
    this.requestUpdate();
    setTimeout(() => {
      this.docAlerts = {};
      this.requestUpdate();
    }, 3000);
  }

  render() {
    const contracts = Object.keys(this.docs).map((name, index) => {
      return html`
        <div class="list-group-item ">
          ${name} [${this.docs[name].length} functions]
        </div>
      `;
    });

    const docAlerts = html`
      <div class="alert alert-${this.docAlerts.type}" role="alert">
        ${this.docAlerts.message}
      </div>
    `;

    const info =
      Object.keys(this.docs).length === 0
        ? html`
            <p>Please compile a contract using the Solidity Compiler.</p>
          `
        : html`
            <p>Available contracts:</p>
          `;

    const button =
      Object.keys(this.docs).length === 0
        ? ''
        : html`
            <button
              class="btn btn-lg btn-primary"
              @click="${() => this.generateInterface()}"
            >
              Generate Interface
            </button>
          `;

    const interfaces = Object.keys(this.dapps).map((name, index) => {
      return html`
        <a href="${ONE_CLICK_DAPP_URL}/${this.dapps[name]}" target="_blank">
          <div class="list-group-item list-group-item-action">
            ${name}: ${this.dapps[name]}
          </div>
        </a>
      `;
    });

    return html`
      <style>
        main {
          padding: 10px;
        }
        #alerts {
          margin-top: 20px;
          font-size: 0.8rem;
        }
        .alert {
          animation: enter 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
        }
        @keyframes enter {
          0% {
            opacity: 0;
            transform: translateY(50px) scaleY(1.2);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scaleY(1);
          }
        }
      </style>
      <main>
        ${info}
        <div class="list-group">${contracts}</div>
        <div id="button">${button}</div>
        <div id="interfaces">${interfaces}</div>
        <div id="alerts">${docAlerts}</div>
      </main>
    `;
  }
}
