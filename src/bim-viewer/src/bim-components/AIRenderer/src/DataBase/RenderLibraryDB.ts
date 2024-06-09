import Dexie from "dexie";

interface IRender {
    id?: number,
    buffer: ArrayBuffer,
    title: string,
    date: string
  }

class GalleryDB extends Dexie {
  renders!: Dexie.Table<IRender, number>;

  constructor() {
    super("GalleryDB");
    this.version(1).stores({
      renders: "++id, title, date, buffer",
    });
  }
}

export class Gallery {
  db: GalleryDB;
  constructor() {
    this.db = new GalleryDB();
    this.db.version(1).stores({
        renders: "++id, title, date, buffer",
    });
  }

  async init() {
    await this.db.open();
  }

  async save(url: string, title: string, date: string) {
    try {
      const response = await fetch(url);
      console.log("response here", response)
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
      return await this.db.renders.add({ buffer, title, date });
      }
    } catch (error) {
      console.log("url", url)
      throw new Error(`Error saving image to DB: ${error}`)
    }
  }

  async clear() {
    await this.db.renders.clear();
  }

  deleteRender(key: number) {
    this.db.renders.delete(key)
  }
}
