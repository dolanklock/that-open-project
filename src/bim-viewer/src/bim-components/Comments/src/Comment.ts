import * as THREE from "three"

export class Comment {
  text: string
  position?: THREE.Vector3
  replies: string[] = []
  constructor(text: string) {
    this.text = text
  }
}