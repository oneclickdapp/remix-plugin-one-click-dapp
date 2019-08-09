var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, customElement } from 'lit-element';
import { createIframeClient } from './client';
import { createDoc } from './ethdoc';
let EthdocComponent = class EthdocComponent extends LitElement {
    constructor() {
        super();
        /** client to communicate with the IDE */
        this.client = createIframeClient();
        this.docs = {};
        this.docAlerts = {};
        this.init();
    }
    async init() {
        await this.client.onload();
        this.client.solidity.on('compilationFinished', (file, src, version, result) => {
            if (!result)
                return;
            this.docs = createDoc(result);
            const status = {
                key: 'succeed',
                type: 'success',
                title: 'New documentation ready'
            };
            this.client.emit('statusChanged', status);
            this.requestUpdate();
        });
    }
    /** ⚠️ If you're using LitElement you should disable Shadow Root ⚠️ */
    createRenderRoot() {
        return this;
    }
    /** Write documentation to the FileSystem */
    async writeDoc(name) {
        try {
            const content = this.docs[name];
            await this.client.fileManager.setFile(`browser/${name}.doc.md`, content);
            this.showAlert(name);
        }
        catch (err) {
            this.showAlert(name, err);
        }
    }
    showAlert(name, err) {
        if (!err) {
            const message = `${name} created / updated inside File Manager 🦄`;
            this.docAlerts[name] = { message, type: 'success' };
        }
        else {
            const message = `😓${name} documentation was not generated : ${err}`;
            this.docAlerts[name] = { message, type: 'warning' };
        }
        this.requestUpdate();
        setTimeout(() => {
            delete this.docAlerts[name];
            this.requestUpdate();
        }, 3000);
    }
    render() {
        const contracts = Object.keys(this.docs).map(name => html `
        <button
          class="list-group-item list-group-item-action"
          @click="${() => this.writeDoc(name)}"
        >
          ${name} Documentation
        </button>
      `);
        const docAlerts = Object.keys(this.docAlerts)
            .map(key => this.docAlerts[key])
            .map(({ type, message }) => {
            return html `
          <div class="alert alert-${type}" role="alert">${message}</div>
        `;
        });
        const info = Object.keys(this.docs).length === 0
            ? html `
            <p>Compile a contract with Solidity Compiler.</p>
          `
            : html `
            <p>Click on a contract to generate documentation.</p>
          `;
        return html `
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
        <div id="alerts">${docAlerts}</div>
      </main>
    `;
    }
};
EthdocComponent = __decorate([
    customElement('eth-doc')
], EthdocComponent);
export { EthdocComponent };
