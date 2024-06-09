import * as OBC from "openbim-components"
import { RenderSettingsDB, ISettings } from "./DataBase/RenderSettingsDB"
import { IsExternal } from "rollup"
/**
 * class to control stable diffusion settings for request
 */
export class SettingsUIComponent extends OBC.SimpleUIComponent {
    onclick = new OBC.Event()
    private _settingsDB: RenderSettingsDB
    private _negativePrompt: HTMLTextAreaElement = this.getInnerElement("negative-prompt") as HTMLTextAreaElement
    private _width: HTMLTextAreaElement = this.getInnerElement("width") as HTMLTextAreaElement
    private _height: HTMLTextAreaElement = this.getInnerElement("height") as HTMLTextAreaElement
    constructor(components: OBC.Components) {
        const template = `
        <div id="settings-container">
            <label>Negative Prompt</label>
            <textarea id="negative-prompt"></textarea>
            <label>Width</label>
            <input id="width"></input>
            <label>Height</label>
            <input id="height"></input>

        </div>
        `
        super(components, template)
        this._setStyles()
        this._negativePrompt.textContent = "Bad quality, blurry, bad texture"
        this._width.value = "800"
        this._height.value = "800"
        this._settingsDB = new RenderSettingsDB()
    }
    get negativePrompt() {
        return this._negativePrompt.value
    }
    get width() {
        return this._width.value
    }
    get height() {
        return this._height.value
    }
    private _setStyles() {
        this.get().style.width = "100%"
        this.get().style.height = "100%"
        this.get().style.display = "flex"
        this.get().style.flexDirection = "column"
        this.get().style.rowGap = "10px"
        this.get().style.padding = "25px"
    }
    /**
     * this updates the forms html input values to whatever the DB values are
     * @returns 
     */
    async updateFormInputsFromDB() {
        const dbVal = await this._settingsDB.db.settings.toArray()
        const settings = dbVal[0]
        if ( !dbVal ) return
        this._negativePrompt.textContent = settings.negativePrompt
        this._width.value = settings.width
        this._height.value = settings.height
    }
    /**
     * this will updates the current settings and database with new inputs from user in theonAccept event
     */
    async update() {
        const settings = {
            negativePrompt: this._negativePrompt.value,
            width: this._width.value,
            height: this._height.value,
        }
        await this._settingsDB.update(settings)
    }
    /**
     * clears all items from database
     */
    clearSettings() {
        this._settingsDB.db.settings.clear()
    }
    /**
     * returns all items in database in an array data type
     * @returns 
     */
    getDB() {
        return this._settingsDB.db.settings.toArray()
    }
}

// TODO: need to actually get this to update render settings. should take from the DB values
// can have attirbute properties on the stablediffusion cclass instance and when onAccept is triggererd for settings form
// it will set the stable diffusion class instance objects properties and update them

// TODO: need to make so the default values are set on very first page initialize