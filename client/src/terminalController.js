import ComponentsBuilder from './components.js'

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

    #registerEvents(eventEmitter, components) {
        eventEmitter.on('message:received', this.#onMessageReceived(components))
        eventEmitter.on('activityLog:updated', this.#onLogChange(components))
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

        let n = 1
        setInterval(() => {
            eventEmitter.emit('message:received', {message: 'hey', userName: `Joao_${n}`})
            eventEmitter.emit('activityLog:updated', `Joao_${n} join`)
            n = n+1
        }, 1000)
    }
}