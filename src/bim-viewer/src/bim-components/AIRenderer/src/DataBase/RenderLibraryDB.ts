import { error } from "console";
import Dexie from "dexie";

interface IRender {
    id?: number,
    buffer: ArrayBuffer,
    title: string,
    date: string,
    uuid: string
  }

class GalleryDB extends Dexie {
  renders!: Dexie.Table<IRender, number>;

  constructor() {
    super("GalleryDB");
    this.version(1).stores({
      renders: "++id, title, date, buffer, uuid",
    });
  }
}

export class Gallery {
  db: GalleryDB;
  constructor() {
    this.db = new GalleryDB();
    this.db.version(1).stores({
        renders: "++id, title, date, buffer, uuid",
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
  async save(url: string, title: string, date: string, uuid: string) {
    try {
      const response = await fetch(url);
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
      return await this.db.renders.add({ buffer, title, date, uuid});
      }
    } catch (error) {
      throw new Error(`Error saving image to DB: ${error}`)
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
}
