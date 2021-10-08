const LIMIT = 60 * 1000

class pauseItem {
    constructor() {
        this.timeSpent = 0 //time spent in seconds
        this.timer = null
        this.after1Second = () => {
            if(this.timeSpent === LIMIT) {
                this.timeSpent = 0
                notifyUser()
            }
            else {
                this.timeSpent += 1
            }
        }
    }
}

const pauseList = {
    'www.facebook.com': new pauseItem(),
    'twitter.com': new pauseItem(),
    'www.reddit.com':  new pauseItem(),
    'www.pinterest.com': new pauseItem(),
    'www.google.com.pk': new pauseItem()
}


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const isTabLoaded = changeInfo && changeInfo.status === 'complete'
    const isActiveTab = tab.active === true
    const hostname = getHost(tab.url)

    if(isTabLoaded && isActiveTab && hostname) process(hostname)
})

function process(hostname) {
    for (const host in pauseList) {
        if(host === hostname && !pauseList[host].timer) {
            console.log(`Timer started for ${host}`)
            pauseList[host].timer = setInterval(pauseList[host].after1Second, 1000)
        }
        else if(host !== hostname && pauseList[host].timer) {
            console.log(`Timer stopped for ${host}, Time spent: ${pauseList[host].timeSpent}`)
            clearInterval(pauseList[host].timer)
            pauseList[host].timer = null
        }
    }
}

chrome.tabs.onActivated.addListener(async activeInfo => {
    const tab = await getTab(activeInfo.tabId)
    if(tab.url === '') return

    const hostname = getHost(tab.url)

    if(hostname) process(hostname)
    else stopAllTimers();
})

function stopAllTimers() {
    for (const pauseItem in pauseList) {
        clearInterval(pauseList[pauseItem].timer)
        pauseList[pauseItem].timer = null
    }
}

function getTab(tabId) {
    return new Promise((resolve, reject) => 
        chrome.tabs.get(tabId, resolve)
    )
}

function notifyUser() {
    chrome.tabs.query({active: true}, tabs => 
        chrome.tabs.sendMessage(tabs[0].id, 'takeBreath')
    )
}

function getHost(url) {
    const location = new URL(url)
    const hostname = location.hostname
    
    if(hostname in pauseList) return hostname
    return false
}
