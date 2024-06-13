
import { RenderSettingsDB, ISettings } from "./DataBase/RenderSettingsDB"
import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"

export class SettingsComponent {
    private _components: OBC.Components
    private _settingsDB: RenderSettingsDB
    constructor(components: OBC.Components) {
        this._components = components
        this._settingsDB = new RenderSettingsDB()
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
