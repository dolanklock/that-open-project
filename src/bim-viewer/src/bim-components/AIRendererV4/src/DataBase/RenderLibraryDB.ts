import { error } from "console";
import Dexie from "dexie";

interface IRender {
    id?: number,
    renderBuffer: ArrayBuffer | null,
    screenshotBuffer: ArrayBuffer,
    title: string,
    date: string,
    projectName: string,
    uuid: string
  }

class GalleryDB extends Dexie {
  renders!: Dexie.Table<IRender, number>;

  constructor() {
    super("GalleryDB");
    this.version(1).stores({
      renders: "++id, title, date, renderBuffer, screenshotBuffer, projectName, uuid",
    });
  }
}

export class Gallery {
  db: GalleryDB;
  constructor() {
    this.db = new GalleryDB();
    this.db.version(1).stores({
        renders: "++id, title, date, renderBuffer, screenshotBuffer, projectName, uuid",
    });
    // this.clear()
  }

  async init() {
    await this.db.open();
  }
  /**
   * saves the image and all associated data to the DB
   * @param url 
   * @param title 
   * @param date 
   * @param uuid 
   * @returns 
   */
  async saveScreenshot(url: string, title: string, date: string, projectName: string, uuid: string) {
    try {
      console.log("saving rendered image", url)
      const response = await fetch(url);
      console.log(response)
      if (!response.ok) {
        switch(response.status) {
            case 400:
                throw new Error(`Bad response saving image to render library DB: ${response.status}`)
            case 401:
                throw new Error(`Bad response saving image to render library DB: ${response.status}`)
            case 403:
              throw new Error(`Bad response saving image to render library DB: ${response.status}`)
            case 404:
                throw new Error(`Bad response saving image to render library DB: ${response.status}`)
            case 500:
                throw new Error(`Bad response saving image to render library DB: ${response.status}`)  
        }
    } else {
      const screenshotBuffer = await response.arrayBuffer();
      return await this.db.renders.add({ renderBuffer: null, screenshotBuffer, title, date, projectName, uuid});
      }
    } catch (error) {
      throw new Error(`Error saving item to DB: ${error}`)
    }
  }
  async saveRender(url: string, title: string, date: string, uuid: string) {
    // uuid in this method will need to come from the screenshot item that is currenrly being rendered
    // should find the parent html and it should have data attribute with uuid in it and then i can 
    // pass that in to this method
    try {
      console.log("saving rendered image", url)
      const response = await fetch(url);
      console.log(response)
      if (!response.ok) {
        switch(response.status) {
            case 400:
                throw new Error(`Bad response saving image to render library DB: ${response.status}`)
            case 401:
                throw new Error(`Bad response saving image to render library DB: ${response.status}`)
            case 403:
              throw new Error(`Bad response saving image to render library DB: ${response.status}`)
            case 404:
                throw new Error(`Bad response saving image to render library DB: ${response.status}`)
            case 500:
                throw new Error(`Bad response saving image to render library DB: ${response.status}`)  
        }
    } else {
      const buffer = await response.arrayBuffer();
      const dbItem = await this.getItemByUUID(uuid)
      const id = dbItem.id
      if (!id) return
      return await this.db.renders.update(id, { renderBuffer: buffer});
      }
    } catch (error) {
      throw new Error(`Error saving existing item in DB: ${error}`)
    }
  }
  async getItemByUUID(uuid: string) {
    try {
      const result = await this.db.renders.filter(dbItem => dbItem.uuid === uuid).toArray()
      console.log("got item", result)
      console.log("got item", result[0].id)
      return result[0]
    } catch (error) {
      throw new Error("cannot find item in DB with matching uuid")
    }
  }
  /**
   * finds item in DB based on uuid passed in and deletes item from DB
   * @param uuid 
   */
  async deleteItem(uuid: string) {
    const items = await this.db.renders.toArray()
    const itemDelete = items.find((item) => {
      return item.uuid === uuid
    }) as IRender
    if (!itemDelete) {
      throw new Error(`Could not find matching uuid in data base`)
    }
    const key = itemDelete.id as number
    this.db.renders.delete(key)
  }
  /**
   * clears all DB data * ONLY IF NEEDED*
   */
  async clear() {
    await this.db.renders.clear();
  }

  arrayBufferToSrcImg(arrayBuffer: ArrayBuffer, fileName: string) {
    const file = new File([new Blob([arrayBuffer])], fileName)
    const src = URL.createObjectURL(file)
    return src
  }

  async getAllScreenShotImages() {
    const rv: string[] = []
    const allItems = await this.db.renders.toArray()
    for (const i of allItems) {
      rv.push(this.arrayBufferToSrcImg(i.screenshotBuffer, i.uuid))
    }
    return rv
  }
  async getAllRenderImages() {
    const rv: string[] = []
    const allItems = await this.db.renders.toArray()
    for (const i of allItems) {
      rv.push(this.arrayBufferToSrcImg(i.renderBuffer, i.uuid))
    }
    return rv
  }
}

// TODO: need save for render and screenshot
// if i do a render and click render button from existing screenshot
// then need to get the existing saved item in database
// that has screenshot already and save the rendered image to that
// if taking screenshot of model or uploading new screenshot need
// to save a brand new item to DB


// TODO: db needs to have projectID/ project name,
// and render and screenshot

// should be able to click on dropdown on card and change the project
// its currently grouped under and it will move to that group
// (render image and screenshot)