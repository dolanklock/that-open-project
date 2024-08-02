/* eslint-disable consistent-return */
/* eslint-disable default-case */
/* eslint-disable max-classes-per-file */
/* eslint-disable prettier/prettier */
import { UUID } from "@thatopen/components";
import Dexie from "dexie";
import { v4 as uuidv4 } from 'uuid'

export interface IRender {
    id?: number,
    renderBuffer: ArrayBuffer | null,
    screenshotBuffer: ArrayBuffer,
    renderBuffers: { [key: string]: ArrayBuffer }
    title: string,
    date: string,
    projectName: string,
    uuid: string
  }

interface IProjects {
    [key: string]: IRender[]
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
        this.handleError(response.status)
    } else {
      const screenshotBuffer = await response.arrayBuffer();
      const renderBuffers = {}
      return await this.db.renders.add({ renderBuffer: null, screenshotBuffer, renderBuffers, title, date, projectName, uuid});
      }
    } catch (error) {
      throw new Error(`Error saving item to DB: ${error}`)
    }
  }

  async saveRender(url: string, existingUUID: string) {
    // uuid in this method will need to come from the screenshot item that is currenrly being rendered
    // should find the parent html and it should have data attribute with uuid in it and then i can 
    // pass that in to this method
    try { 
      const response = await fetch(url);
      if (!response.ok) {
        this.handleError(response.status)
    } else {
      const buffer = await response.arrayBuffer();
      const dbItem = await this.getItemByUUID(existingUUID)
      if (!dbItem) throw new Error("could not find existing database item by existing uuid")
      const renderId = uuidv4()
      dbItem.renderBuffers[renderId] = buffer
      console.log("db item testing", dbItem)
      }
    } catch (error) {
      throw new Error(`Error saving existing item in DB: ${error}`)
    }
  }
  async getItemByUUID(uuid: string) {
    try {
      const result = await this.db.renders.filter(dbItem => dbItem.uuid === uuid).toArray()
    //   console.log("got item", result)
    //   console.log("got item", result[0].id)
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
      console.log("testegtetet", i.screenshotBuffer)
      rv.push(this.arrayBufferToSrcImg(i.screenshotBuffer, i.uuid))
    }
    return rv
  }
  /**
   * need this function to convert array buffer to data url because in the
   * getActiveScreenshotImageAsDataUrl function i get the image as array buffer
   * for active screen shot and then that returns the image as data url 
   * for running the render function in the promptUI file. 
   * (the uploadImage method in stablediffusion class needs image as dataurl)
   * @param arrayBuffer 
   * @returns 
   */
  arrayBufferToDataURL(arrayBuffer: ArrayBuffer) {
    return new Promise((resolve, reject) => {
        // Create a Blob from the ArrayBuffer
        const blob = new Blob([arrayBuffer], { type: 'image/png' })
        // Use FileReader to convert Blob to Data URL
        const reader = new FileReader()
        reader.onloadend = function(event) {
            resolve(event.target.result);
        }
        reader.onerror = function(event) {
            reject(new Error("Failed to convert ArrayBuffer to Data URL"))
        }
        // Read the Blob as Data URL
        reader.readAsDataURL(blob)
    })
  }
  /**
   * gets the active image based on slide html element having class "active" in it
   * from there it gets the uuid from that html element and then passes it
   * to the getItemByUUID method in this class in order to get the db item
   * and from that can get the screenshots array buffer in order to pass that
   * to the render method from stable diffusion as data url 
   * @returns 
   */
  async getActiveScreenshotImageAsDataUrl() {
    const nodeList = document.querySelectorAll(".slide") as NodeList
    const slides = Array.from(nodeList) as HTMLDivElement[]
    const activeSlide = slides.find((slide) => {
        return slide.classList.contains("active")
    })
    console.log("activeslide", activeSlide)
    if (!activeSlide) return
    const activeImageUUID = activeSlide.dataset.uuid as string
    console.log("activeimageuuid", activeImageUUID)
    const dbItem = await this.getItemByUUID(activeImageUUID)
    console.log("array buffer look", dbItem.screenshotBuffer)
    try {
      const imageDataUrl = await this.arrayBufferToDataURL(dbItem.screenshotBuffer)
      return imageDataUrl
    } catch (error) {
      console.error("Error converting ArrayBuffer to Data URL:", error);
    }
}

  async getAllRenderImages() {
    const rv: string[] = []
    const allItems = await this.db.renders.toArray()
    for (const i of allItems) {
      if (i.renderBuffer) rv.push(this.arrayBufferToSrcImg(i.renderBuffer, i.uuid))
    }
    return rv
  }

    async getAllItems() {
        const items = await this.db.renders.toArray()
        return items
    }

    async groupDBItemsByProject(): Promise<IProjects> {
        const projects: IProjects = {}
        const dbItems = await this.db.renders.toArray()
        for (const i of dbItems) {
            if (i.projectName in projects) {
                projects[i.projectName].push(i)
            } else {
                projects[i.projectName] = [i]
            }
        }
        return projects
    }

    getScreenshotRenders() {

    }
    handleError(status: number) {
        switch(status) {
            case 400:
                throw new Error(`Bad response uploading render image to SD: ${status}`)
            case 401:
                throw new Error(`Bad response uploading render image to SD: ${status}`)
            case 403:
                throw new Error(`Bad response fetching final image url: ${status}`)
            case 404:
                throw new Error(`Bad response uploading render image to SD: ${status}`)
            case 500:
                throw new Error(`Bad response uploading render image to SD: ${status}`)  
        }
    }

}
