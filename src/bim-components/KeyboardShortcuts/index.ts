import { v4 as uuidv4 } from 'uuid'
import  *  as OBC from "openbim-components"
import {KeyBoardShortcutUIComponent} from "./src/KeyboardShortcutUI"
import {CommandUIComponent, ShortcutUIComponent} from "./src/CommandUI"

class Command {
    id: string
    fn: Function
    event: OBC.Event<Function>
    name: string
    shortcut: string
    constructor(id: string, name: string, shortcut: string, fn: Function, event: OBC.Event<Function>) {
        this.id = id
        this.name = name
        this.shortcut = shortcut
        this.fn = fn
        this.event = event
    }
}

export class KeyBoardShortCutManager extends OBC.Component<KeyBoardShortcutUIComponent> implements OBC.UI{
    enabled: boolean = true
    static uuid: string = uuidv4()
    private _components: OBC.Components
    private _keyboardShortcutUI: KeyBoardShortcutUIComponent
    private _form: OBC.Modal
    private _commands: Command[] = []
    private activeModified: HTMLElement
    private _keysPressed: string[] = []
    uiElement = new OBC.UIElement<{activationBtn: OBC.Button, keyboardShortcutUI: KeyBoardShortcutUIComponent}>()

    constructor(components: OBC.Components) {
        super(components)
        this._components = components
        this._components.tools.add(KeyBoardShortCutManager.uuid, this)
        this._setUI()
        this._keyEventSetup()
    }

    private _setUI() {
        const activationBtn = new OBC.Button(this._components)
        activationBtn.materialIcon = "construction"
        activationBtn.onClick.add(() => {
            keyboardShortcutWindow.visible = true
        })
        this._keyboardShortcutUI = new KeyBoardShortcutUIComponent(this._components)

        const keyboardShortcutWindow = new OBC.FloatingWindow(this._components)
        this._components.ui.add(keyboardShortcutWindow)
        keyboardShortcutWindow.visible = false
        keyboardShortcutWindow.title = "Keyboard Shortcuts"
        keyboardShortcutWindow.addChild(this._keyboardShortcutUI)
        this._form = new OBC.Modal(this._components)
        this._form.title = "Edit Shortcut"
        this._components.ui.add(this._form)
        const todoDescriptionInput = new OBC.TextArea(this._components)
        todoDescriptionInput.label = "Key"
        this._form.slots.content.addChild(todoDescriptionInput)
        this._form.slots.content.get().style.padding = "20px"
        this._form.slots.content.get().style.display = "flex"
        this._form.slots.content.get().style.flexDirection = "column"
        this._form.slots.content.get().style.rowGap = "20px"
        this._form.onCancel.add(() => {
            this._form.visible = !this._form.visible
        })
        this._changeShortcutEventHandler()
        this.uiElement.set({activationBtn: activationBtn, keyboardShortcutUI: this._keyboardShortcutUI})
        this.addCommand("Keyboard Shortcuts", "ks", () => {
            console.log(this._commands)
            keyboardShortcutWindow.visible = !keyboardShortcutWindow.visible
        })
    }
    /** This method is responsible for adding commands of your application to the keyboard manager. These commands will then be available to the user of the app
     * and they will be able to configure different keys to these commands
     * 
     * @param commandName [string] the name if the command, this will display in the UI as the command name
     * @param shortcut [string] the shortcut key to assign to the command, when this key is pressed, the command will execute
     * @param fn [Function] the callback function to be executed when shortcut key is pressed
     */
    addCommand(commandName: string, shortcut: string, fn: Function) {
        try {
            this._validateShortcut(shortcut)
        } catch (error) {
            throw error
        }
        // id for command ui, shortcut ui components and command object so they can all be tied together
        const id = uuidv4()
        const event = new OBC.Event<Function>()
        event.add(()=>{fn()})
        const command = new Command(id, commandName, shortcut, fn, event)
        this._commands.push(command)
        const commandUI = new CommandUIComponent(this._components, id, commandName)
        this._keyboardShortcutUI.appendCommandChild(commandUI.get())
        const shortcutUI = new ShortcutUIComponent(this._components, id, shortcut)
        shortcutUI.onclick.add((e) => {
            const target = (e as Event).target as HTMLDivElement
            this.activeModified = target.closest(".command-line") as HTMLDivElement
            const formInput = this._form.get().querySelector("textarea") as HTMLTextAreaElement
            formInput.textContent = this.activeModified.querySelector(".key")!.textContent!
            this._form.visible = true
        })
        this._keyboardShortcutUI.appendShortcutChild(shortcutUI.get())
    }
    /**
     * this method validates the shortcut being passed in by the user or developer and checks to make
     * sure that it is valid and does not conflict with any existing shortcut key
     * @param shortcut [string]
     */
    private _validateShortcut(shortcut: string) {
        this._commands.forEach((command) => {
            if ( shortcut.length <= 1 || shortcut.length > 3 ) {
                throw new Error("Shortcut must be 2-3 characters long")
            } else if ( shortcut.toLowerCase() === command.shortcut.toLowerCase() ) {
                throw new Error(`Shortcut "${shortcut}" is already in use`)
            } else if ( shortcut.slice(0, 2).toLowerCase() == command.shortcut.slice(0, 2).toLowerCase() ) {
                throw new Error("Can't have the same first two characters of another command")
            }
        })
    }
    /**
     * all logic for keypress event.
     */
    private _keyEventSetup() {
        // we need the set timeout so that later it does not trigger an event if someone types a key and then minute later hits another one and sets off function
        document.addEventListener("keypress", (e: KeyboardEvent) => {
            const target = e.target as HTMLElement
            if ( target.tagName === "INPUT" || target.tagName === "TEXTAREA" ) return
            const keyPressed = e.key
            this._keysPressed.push(keyPressed)
            this._commands.forEach((command) => {
                const currentKeys = this._keysPressed.slice(-command.shortcut.length).join("").toLowerCase()
                if (currentKeys === command.shortcut.toLowerCase()) {
                    this._keysPressed.length = 0
                    command?.event.trigger()
                }
            })
            if ( this._keysPressed.length > 3 ) {
                this._keysPressed = this._keysPressed.slice(-3)
            }
        })
    }
    /**
     * logic for when the user changes the keyboard shortcut in the UI
     */
    private _changeShortcutEventHandler() {
        this._form.onAccept.add(() => {
            const input = this._form.get().querySelector("textarea")
            const inputValue = input!.value
            try {
                const existingKeyHTMLElement = this.activeModified.querySelector(".key") as HTMLParagraphElement
                const existingKey = this.activeModified.querySelector(".key")!.textContent!.toLowerCase()
                // checking if shortcut is same or similar as the one editing
                if ( !(inputValue.toLowerCase() ===  existingKey || inputValue.slice(0, 2).toLowerCase() === existingKey.slice(0, 2))) {
                    this._validateShortcut(inputValue)
                }
                existingKeyHTMLElement.textContent = inputValue.toUpperCase()
                const command = this.getCommand(this.activeModified.dataset.uuid!) as Command
                command.shortcut = inputValue
                this._form.visible = false
            } catch (error) {
                alert(error)
            } finally {
                input!.value = ""
            }
        })
    }
    /**
     * returns the array of Command objects stored in the instance of this class
     * @returns [Command[]]
     */
    getCommands() {
        return this._commands
    }
    /**
     * finds the command stored in this instances commands attribute based on id passed in
     * @param id [string] uuid of the Command object to return
     * @returns [Command]
     */
    getCommand(id: string): Command | undefined {
        const command = this._commands.find((command) => {
            if ( command.id === id ) {
                return command
            }
        })
        return command
    }

    dispose() {
        this.enabled = false
        this._commands.forEach((command) => {
            command.event.reset()
        })
        this._commands = []
    }

    get(): KeyBoardShortcutUIComponent {
        return this._keyboardShortcutUI
    }
}

