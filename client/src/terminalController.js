import ComponentsBuilder from './components.js'
import { constants } from './constants.js'

export default class TerminalController {
    #usersCollors = new Map()

    constructor() {}

    #pickColor() {
        return `#${((1 << 24) * Math.random() | 0).toString(16)}-fg` 
    }

    #onInputReceived(eventEmitter) {
        return function () {
            const message = this.getValue()
            console.log(message)
            this.clearValue()
        }
    }

    #getUserColor(userName) {
        if(this.#usersCollors.has(userName)) 
            return this.#usersCollors.get(userName)
        
        const color = this.#pickColor()
        this.#usersCollors.set(userName, color)

        return color
    }

    #onMessageReceived({ screen, chat }) {
        return msg => {
            const { userName, message } = msg
            const color = this.#getUserColor(userName)

            chat.addItem(`{${color}}{bold}${userName}{/}: ${message}`)
            screen.render()
        }
    }

    #onLogChange({ screen, activityLog }) {
        return msg => {
            const [userName] = msg.split(/\s/)
            const color = this.#getUserColor(userName)

            activityLog.addItem(`{${color}}{bold}${msg.toString()}{/}`)
            screen.render()
        }
    }

    #onStatusChange({ screen, status }){
        return users => {

            // pega o primeiro elemento da lista, que é o titulo
            const { content } = status.items.shift()
            status.clearItems()
            status.addItem(content)

            users.forEach(userName => {
                const color = this.#getUserColor(userName)
                status.addItem(`{${color}}{bold}${userName}{/}`)
            })

            screen.render()
        }
    }

    #registerEvents(eventEmitter, components) {
        eventEmitter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(components))
        eventEmitter.on(constants.events.app.ACTIVITY_LOG_UPDATED, this.#onLogChange(components))
        eventEmitter.on(constants.events.app.STATUS_UPDATED, this.#onStatusChange(components))
    }

    async initializeTable(eventEmitter) {
        const components = new ComponentsBuilder()
            .setScreen({ title: 'HackerChat - Flávio Eduardo'})
            .setLayoutComponent()
            .setInputComponent(this.#onInputReceived(eventEmitter))
            .setChatComponent()
            .setActivityLogComponent()
            .setStatusComponent()
            .build()

        this.#registerEvents(eventEmitter, components)

        components.input.focus()
        components.screen.render()

    }
}