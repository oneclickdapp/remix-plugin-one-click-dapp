import { LitElement, html, customElement } from "lit-element";
import { PluginClient } from "@remixproject/plugin";
import { createClient } from "@remixproject/plugin-webview";
import { CompilationFileSources, CompilationResult, Status } from "./utils";
import axios from "axios";
import { print } from "graphql";
import gql from "graphql-tag";

import encouragement from "./encouragement";

// const ONE_CLICK_DAPP_API = "http://localhost:8911";
const ONE_CLICK_DAPP_API = "https://oneclickdapp.com/api/graphql";
const ONE_CLICK_DAPP_URL = "https://oneclickdapp.com";

type contract = {
  abi: any[];
};

type ContractMap = {
  [contractName: string]: contract;
};

type dapp = {
  mnemonic: string;
  abi: any[];
};

type dappMap = {
  [name: string]: dapp;
};

@customElement("one-click-dapp")
export class OneClickDapp extends LitElement {
  /** client to communicate with the IDE */
  private client = createClient(new PluginClient());
  private contracts: ContractMap = {};
  private contractAlerts: any = {};
  private oneclickdapps: dappMap = {};

  constructor() {
    super();
    this.init();
  }

  async init() {
    await this.client.onload();
    this.client.solidity.on(
      "compilationFinished",
      (
        file: string,
        src: CompilationFileSources,
        version: string,
        result: CompilationResult
      ) => {
        if (!result) return;
        this.contracts = this.createContracts(result);
        const status: Status = {
          key: "succeed",
          type: "success",
          title: "New interface generated",
        };
        this.client.emit("statusChanged", status);
        this.requestUpdate();
      }
    );
  }

  /** ⚠️ If you're using LitElement you should disable Shadow Root ⚠️ */
  createRenderRoot() {
    return this;
  }

  createContracts(result: CompilationResult) {
    return Object.keys(result.contracts).reduce((acc, fileName) => {
      const contracts = result.contracts[fileName];
      Object.keys(contracts).forEach(
        (name) => (acc[name] = { abi: contracts[name].abi })
      );
      return acc;
    }, {});
  }

  /** Use One Click Dapp API to generate an interface */
  async generateInterface() {
    try {
      const dappName = (<HTMLInputElement>document.getElementById("dappName"))
        .value;
      if (dappName.trim() === "") {
        throw new Error("Please enter a name for your dapp");
      }

      const dappAddress = (<HTMLInputElement>(
        document.getElementById("dappAddress")
      )).value;
      if (!/^(0x)+[0-9a-fA-F]{40}$/i.test(dappAddress)) {
        throw new Error("Please enter a valid contract address");
      }

      const selectedContractNames = [].slice
        .call(document.querySelectorAll("input[type=checkbox]:checked"))
        .map((checked) => {
          return (<HTMLInputElement>checked).value;
        });
      const combinedAbi = selectedContractNames.reduce((acc, name) => {
        return acc.concat(this.contracts[name].abi);
      }, <any>[]);
      if (combinedAbi.length === 0) {
        throw new Error("Please select at least one contract");
      }

      this.client.emit("statusChanged", {
        key: "loading",
        type: "info",
        title: "Generating ...",
      });
      const CREATE_DAPP = gql`
        mutation CreateDappMutation($input: CreateDappInput!) {
          createDapp(input: $input) {
            mnemonic
          }
        }
      `;
      axios
        .post(ONE_CLICK_DAPP_API, {
          method: "post",
          query: print(CREATE_DAPP),
          variables: {
            input: {
              name: dappName,
              description: "Created using the Remix plugin for One Click Dapp",
              abi: JSON.stringify(combinedAbi),
              creatorId: "8c89c6c6-e56b-4368-a407-f040ba4c2b33", // Remix user
              contract: dappAddress,
            },
          },
        })
        .then((res) => {
          console.log(res);
          if (!res.data.data.createDapp.mnemonic)
            throw Error("Couldn't create dapp");
          this.oneclickdapps[dappName] = {
            abi: combinedAbi,
            mnemonic: res.data.data.createDapp.mnemonic,
          };
          this.showAlert();
        })
        .catch((err) => {
          throw err.message;
        });
      setTimeout(() => {
        this.client.emit("statusChanged", { key: "none" });
      }, 10000);
    } catch (err) {
      this.showAlert(err);
    }
  }

  showAlert(err?: string) {
    if (!err) {
      const message =
        encouragement[Math.floor(Math.random() * encouragement.length)];
      this.contractAlerts = { message, type: "success" };
    } else {
      const message = `${err}`;
      this.contractAlerts = { message, type: "warning" };
    }
    this.requestUpdate();
    setTimeout(() => {
      this.contractAlerts = {};
      this.requestUpdate();
    }, 5000);
  }

  render() {
    const isContracts = Object.keys(this.contracts).length > 0;

    const availableContracts = isContracts
      ? Object.keys(this.contracts).map((name, index) => {
          return html`
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                value="${name}"
                id="${index}"
                checked
              />
              <label>
                ${name} [${this.contracts[name].abi.length} functions]
              </label>
            </div>
          `;
        })
      : html`
          <div class="list-group-item">
            None found, please compile a contract using the Solidity Compiler
            tab <img src="./compiler.png" width="30" />
          </div>
        `;

    const form = html`
      <div>
        <div class="form-group">
          <label for="dappContracts">Available Contracts:</label>
          ${availableContracts}
        </div>
        <div class="form-group">
          <label for="dappName">Name: </label>
          <input
            type="text"
            class="form-control"
            id="dappName"
            ?disabled="${!isContracts}"
            value="${Object.keys(this.contracts)[0] || ""}"
          />
        </div>
        <div class="form-group">
          <label for="dappAddress">Deployed Address: </label>
          <input
            type="text"
            class="form-control"
            id="dappAddress"
            placeholder="0xabc..."
            ?disabled="${!isContracts}"
          />
        </div>
        <button
          type="submit"
          style="margin:10px 0 3px 0"
          class="btn btn-lg btn-primary mb-2"
          @click="${() => this.generateInterface()}"
          ?disabled="${!isContracts}"
        >
          Generate Dapp
        </button>
      </div>
    `;

    const contractAlerts = html`
      <div
        class="alert alert-${this.contractAlerts.type}"
        role="alert"
        ?hidden="${Object.keys(this.contractAlerts).length === 0}"
      >
        <img style="margin: 0 0 0 0" src="./chelsea.png" width="50" /> ${this
          .contractAlerts.message}
      </div>
    `;

    const dapps = Object.keys(this.oneclickdapps).map((name, index) => {
      return html`
        <div class="card" style="margin-top:7px">
          <div class="card-body" style="padding: 7px">
            <h5 class="card-title">${name}</h5>
            <h6 class="card-subtitle mb-2 text-muted">
              ${this.oneclickdapps[name].abi.length} Functions
            </h6>
            <a
              href="${ONE_CLICK_DAPP_URL}/${this.oneclickdapps[name].mnemonic}"
              class="card-link"
              target="_blank"
              >oneclickdapp.com/${this.oneclickdapps[name].mnemonic}</a
            >
          </div>
        </div>
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
        <h4>Let's make it <b>Persistent</b></h4>
        <div style="margin: 10px 0  0 0" id="form">${form}</div>
        <div id="alerts" style="margin: 0 0  0 0">${contractAlerts}</div>
        <h4 style="margin: 10px 0  0 0">Your Dapps:</h4>
        <h6>
          <a href="https://oneclickdapp.com/new" target="_blank">view recent</a>
        </h6>
        <div class="list-group" id="dapps">${dapps}</div>
      </main>
    `;
  }
}
