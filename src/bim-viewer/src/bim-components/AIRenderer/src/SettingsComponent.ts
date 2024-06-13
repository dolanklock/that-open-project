
import { RenderSettingsDB, ISettings } from "./DataBase/RenderSettingsDB"
import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import {Gallery} from "./DataBase/RenderLibraryDB"
import { v4 as uuidv4 } from 'uuid'

export class SettingsComponent {
    private _components: OBC.Components
    private _settingsDB: RenderSettingsDB
    negativePrompt: string
    width: string
    height: string
    constructor(components: OBC.Components) {
        this._components = components
        this.negativePrompt = "Bad quality, blurry, bad texture"
        this.width = "512"
        this.height = "512"
        this._settingsDB = new RenderSettingsDB()
        this.init()
    }
    async init() {
        const settings = await this._settingsDB.db.settings.toArray()
        console.log("settings change", settings)
        this.negativePrompt = settings[0].negativePrompt
        this.width = settings[0].width
        this.height = settings[0].height
    }
    async getNegPrompt() {
        const settings = await this._settingsDB.db.settings.toArray()
        return settings[0].negativePrompt
    }
    async getWidth() {
        const settings = await this._settingsDB.db.settings.toArray()
        return settings[0].width
    }
    async getHeight() {
        const settings = await this._settingsDB.db.settings.toArray()
        return settings[0].height
    }
    /**
     * this will updates the current settings and database with new inputs from user in theonAccept event
     */
    async update(negPrompt: string, width: string, height: string) {
        const settings = {
            negativePrompt: negPrompt,
            width,
            height,
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