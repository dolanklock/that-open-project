import * as OBC from "openbim-components"

import { dateFormat } from "../../../ProjectFunctions"

export class CommandUIComponent extends OBC.SimpleUIComponent {
    constructor(components: OBC.Components, id: string, commandName: string) {
        const template = `
            <div class="command-line" data-uuid=${id}>
                <p class="command">${commandName}</p>
            </div>
        `
        super(components, template)
        this.get().style.border = "none"
        this.get().style.backgroundColor = "transparent"
        this.get().style.padding = "6px"
        this.get().style.display = "flex"
        this.get().style.justifyContent = "center"
        this.get().style.alignItems = "center"
    }
    
}

export class ShortcutUIComponent extends OBC.SimpleUIComponent {
    onclick = new OBC.Event()
    constructor(components: OBC.Components, id: string, shortcut: string) {
        const template = `
        <div class="command-line" data-uuid=${id}>
            <p class="key">${shortcut.toUpperCase()}</p>
        </div>
    `
        super(components, template)
        this.get().addEventListener("click", (e: Event) => {
            this.onclick.trigger(e)
        })
        this.get().style.cursor = "pointer"
        this.get().style.width = "150px"
        this.get().style.border = "none"
        this.get().style.backgroundColor = "darkgray"
        this.get().style.borderRadius = "8px"
        this.get().style.padding = "6px"
        this.get().style.display = "flex"
        this.get().style.justifyContent = "center"
        this.get().style.alignItems = "center"
        this.get().onmouseover = function() {
            this.get().style.backgroundColor = "#BCF124"
            this.get().style.color = "black"
        }.bind(this)
        this.get().onmouseleave = function() {
            this.get().style.backgroundColor = "darkgray"
            this.get().style.color = "white"
        }.bind(this)
    }   
}