class MindfulAlert extends HTMLElement {
    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'open' })
        this.counter = 5
        this.closeAfter = this.counter * 1000
        this.closeInterval = null
    }

    async connectedCallback() {
        const cssURL = chrome.extension.getURL('css/alert.css')
        const cssRequest = await fetch(cssURL)
        const stylesheet = await cssRequest.text()
        let styleString = `<style>${stylesheet}</style>`

        this.shadow.innerHTML = styleString + this.getMarkup()        
        this.addCloseClickListener()
        this.attachMessageListener()
    }

    addCloseClickListener() {
        this.shadow.querySelector('.close-btn').addEventListener('click', this.hideAlert.bind(this))
    }

    attachMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.showAlert()
            this.addAutoClose()
        })
    }

    addAutoClose() {
        this.closeInterval = setInterval(() => {
            this.counter -= 1
            this.updateCounterText()

            if(this.counter === 0) this.resetCounter()
        }, 1000)
    }

    resetCounter() {
        clearInterval(this.closeInterval)
        this.counter = 8
        this.updateCounterText()
        this.hideAlert()
    }

    updateCounterText() {
        this.shadow.querySelector('.counter').innerText = this.counter
    }

    showAlert() {
        this.updateCounterText()
        this.shadow.querySelector('.overlay').style.display = 'block'
    }

    hideAlert() {
        this.shadow.querySelector('.overlay').style.display = 'none'
    }

    getMarkup() {
        const title = chrome.i18n.getMessage('reminder_title')
        const counterMsg = chrome.i18n.getMessage('counter_msg', '<span class="counter"></span>')
        const dismissMsg = chrome.i18n.getMessage('dismiss')

        return `<div class="overlay">
                    <div class="container">
                        <div class="title">
                            ${title}
                        </div>
                        <div class="message">
                            ${counterMsg}
                        </div>
                        <div class="close-btn">
                            ${dismissMsg}
                        </div>
                    </div>
                </div>`
    }
}